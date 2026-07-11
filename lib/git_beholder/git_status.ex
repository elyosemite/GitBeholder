defmodule GitBeholder.GitStatus do
  # git's own status letters collapsed onto the 4 the frontend renders.
  # R(enamed)/C(opied) don't have a dedicated color/icon yet, so they
  # fold into the closest fit; same for U(nmerged) conflicts.
  @status_letters %{
    "A" => "A",
    "M" => "M",
    "D" => "D",
    "R" => "M",
    "C" => "A",
    "U" => "M"
  }

  def list_changes(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      case System.cmd("git", ["status", "--porcelain"], cd: repo_path, stderr_to_stdout: true) do
        {output, 0} ->
          {:ok, parse(output)}

        {error_msg, _exit_code} ->
          {:error, error_msg}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end

  defp parse(output) do
    output
    |> String.split("\n", trim: true)
    |> Enum.flat_map(&parse_line/1)
  end

  defp parse_line("?? " <> path), do: [%{path: path, status: "U", staged: false}]

  defp parse_line(
         <<index_char::binary-size(1), worktree_char::binary-size(1), " ", path::binary>>
       ) do
    []
    |> maybe_entry(index_char, path, true)
    |> maybe_entry(worktree_char, path, false)
  end

  defp parse_line(_line), do: []

  defp maybe_entry(entries, " ", _path, _staged), do: entries

  defp maybe_entry(entries, letter, raw_path, staged) do
    # Renames/copies print as "old -> new"; the new path is what's live.
    path = raw_path |> String.split(" -> ") |> List.last()
    status = Map.get(@status_letters, letter, "M")
    entries ++ [%{path: path, status: status, staged: staged}]
  end
end
