defmodule GitBeholder.GitDiff do
  @doc """
  Lists the files changed by a single commit, with added/removed line
  counts. Works for the root commit too (no parent needed, unlike a plain
  `git diff <hash>^..<hash>`).

  Returns:
    * `{:ok, [%{path: String.t(), additions: integer | nil, deletions: integer | nil}]}`
      — additions/deletions are `nil` for binary files (git reports "-").
    * `{:error, reason}`
  """
  def file_changes(repo_path, hash) do
    case System.cmd("git", ["show", "--numstat", "--format=", hash],
           cd: repo_path,
           stderr_to_stdout: true
         ) do
      {output, 0} -> {:ok, parse(output)}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end

  defp parse(output) do
    output
    |> String.trim()
    |> String.split("\n", trim: true)
    |> Enum.map(&parse_line/1)
  end

  defp parse_line(line) do
    [additions, deletions, path] = String.split(line, "\t", parts: 3)

    %{
      path: resolve_path(path),
      additions: parse_count(additions),
      deletions: parse_count(deletions)
    }
  end

  defp parse_count("-"), do: nil
  defp parse_count(count), do: String.to_integer(count)

  @doc """
  Returns the unified diff for a single file within a single commit, as a
  flat, order-preserving list of typed lines — the caller decides how to
  lay them out (unified, side-by-side, ...).

  Returns:
    * `{:ok, %{binary: false, lines: [%{type: "hunk" | "context" | "added" | "removed", old_line: integer | nil, new_line: integer | nil, content: String.t()}]}}`
    * `{:ok, %{binary: true, lines: []}}` — git reports "Binary files ... differ"
    * `{:error, reason}`
  """
  def file_diff(repo_path, hash, path) do
    case System.cmd("git", ["show", "--format=", hash, "--", path],
           cd: repo_path,
           stderr_to_stdout: true
         ) do
      {output, 0} -> {:ok, parse_diff(output)}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end

  defp parse_diff(output) do
    if String.contains?(output, "Binary files") do
      %{binary: true, lines: []}
    else
      lines =
        output
        |> String.split("\n")
        |> Enum.drop_while(&(!String.starts_with?(&1, "@@")))
        |> parse_diff_lines()

      %{binary: false, lines: lines}
    end
  end

  defp parse_diff_lines(lines) do
    {result, _old, _new} = Enum.reduce(lines, {[], 0, 0}, &parse_diff_line/2)
    Enum.reverse(result)
  end

  defp parse_diff_line("@@" <> _ = line, {acc, _old, _new}) do
    {old_start, new_start} = parse_hunk_header(line)
    {[%{type: "hunk", old_line: nil, new_line: nil, content: line} | acc], old_start, new_start}
  end

  defp parse_diff_line("-" <> content, {acc, old_line, new_line}) do
    {[%{type: "removed", old_line: old_line, new_line: nil, content: content} | acc], old_line + 1,
     new_line}
  end

  defp parse_diff_line("+" <> content, {acc, old_line, new_line}) do
    {[%{type: "added", old_line: nil, new_line: new_line, content: content} | acc], old_line,
     new_line + 1}
  end

  defp parse_diff_line(" " <> content, {acc, old_line, new_line}) do
    {[%{type: "context", old_line: old_line, new_line: new_line, content: content} | acc],
     old_line + 1, new_line + 1}
  end

  # blank lines and "\ No newline at end of file" trailers carry no content
  defp parse_diff_line(_line, state), do: state

  defp parse_hunk_header(line) do
    case Regex.run(~r/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/, line) do
      [_, old_start, new_start] -> {String.to_integer(old_start), String.to_integer(new_start)}
      _ -> {0, 0}
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
