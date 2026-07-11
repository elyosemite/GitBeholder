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
