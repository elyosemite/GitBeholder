defmodule GitBeholder.GitDiff do
  # A (possibly abbreviated) hex hash. Checked before reaching git so a
  # value like `--output=…` from the URL can never be read as an option.
  @hash_format ~r/^[0-9a-fA-F]{4,40}$/

  @doc """
  Lists the files changed by a single commit, with their status and
  added/removed line counts. Works for the root commit too (no parent
  needed, unlike a plain `git diff <hash>^..<hash>`).

  One `git show --raw --numstat` call carries both: `--raw` lines (starting
  with ":") give the status letter, `--numstat` lines the counts.

  Returns:
    * `{:ok, [%{path, status, additions, deletions}]}` — `status` is git's
      letter: "A" added, "M" modified, "D" deleted, "R" renamed, "C"
      copied, "T" type changed; additions/deletions are `nil` for binary
      files (git reports "-").
    * `{:error, :invalid_hash}`
    * `{:error, reason}`
  """
  def file_changes(repo_path, hash) do
    with :ok <- validate_hash(hash) do
      case System.cmd("git", ["show", "--raw", "--numstat", "--format=", hash],
             cd: repo_path,
             stderr_to_stdout: true
           ) do
        {output, 0} -> {:ok, parse(output)}
        {error_msg, _exit_code} -> {:error, error_msg}
      end
    end
  end

  defp validate_hash(hash) do
    if Regex.match?(@hash_format, hash), do: :ok, else: {:error, :invalid_hash}
  end

  defp parse(output) do
    {raw_lines, numstat_lines} =
      output
      |> String.trim()
      |> String.split("\n", trim: true)
      |> Enum.split_with(&String.starts_with?(&1, ":"))

    status_by_path = Map.new(raw_lines, &parse_raw_line/1)

    Enum.map(numstat_lines, fn line ->
      [additions, deletions, path] = String.split(line, "\t", parts: 3)
      path = resolve_path(path)

      %{
        path: path,
        status: Map.get(status_by_path, path, "M"),
        additions: parse_count(additions),
        deletions: parse_count(deletions)
      }
    end)
  end

  # ":100644 100644 abc123 def456 M\tpath" or, for renames/copies,
  # ":… R087\told\tnew" — the last field is the current path.
  defp parse_raw_line(line) do
    [meta | paths] = String.split(line, "\t")
    status = meta |> String.split(" ") |> List.last() |> String.first()
    {List.last(paths), status}
  end

  defp parse_count("-"), do: nil
  defp parse_count(count), do: String.to_integer(count)

  @doc """
  Returns the raw unified diff for a single file within a single commit,
  with `context` unchanged lines around each change (git's `-U`, 3 by
  default) — fewer to scan a large file's changes, more to read them.
  The caller (the `@pierre/diffs` frontend library) parses the patch text
  itself, including for side-by-side rendering.

  Uses `-m --first-parent` so merge commits diff against their first parent
  instead of git's default combined-diff history simplification, which
  silently omits the diff entirely whenever the path is identical to *any*
  one parent — the common case for most files in a clean merge.

  Returns:
    * `{:ok, %{binary: false, patch: String.t()}}` — full `git show` output,
      starting at the `diff --git` header
    * `{:ok, %{binary: true, patch: nil}}` — git reports "Binary files ... differ"
    * `{:error, :invalid_hash}`
    * `{:error, reason}`
  """
  def file_diff(repo_path, hash, path, context \\ 3)
      when is_integer(context) and context >= 0 do
    with :ok <- validate_hash(hash) do
      args = ["show", "--format=", "-m", "--first-parent", "-U#{context}", hash, "--", path]

      case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
        {output, 0} -> {:ok, parse_diff(output)}
        {error_msg, _exit_code} -> {:error, error_msg}
      end
    end
  end

  defp parse_diff(output) do
    if String.contains?(output, "Binary files") do
      %{binary: true, patch: nil}
    else
      %{binary: false, patch: output}
    end
  end

  # Renames print as "old => new" (full rename) or a common-prefix
  # compacted form like "lib/foo/{bar.ex => baz.ex}" — either way, the
  # right-hand side is the file's current path.
  defp resolve_path(path) do
    cond do
      String.contains?(path, "{") ->
        Regex.replace(~r/\{[^}]* => ([^}]*)\}/, path, "\\1")

      String.contains?(path, " => ") ->
        path |> String.split(" => ") |> List.last()

      true ->
        path
    end
  end
end
