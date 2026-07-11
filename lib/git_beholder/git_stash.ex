defmodule GitBeholder.GitStash do
  def list_stashes(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      case System.cmd("git", ["stash", "list", "--format=%gd|%s"],
             cd: repo_path,
             stderr_to_stdout: true
           ) do
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
    |> String.trim()
    |> String.split("\n", trim: true)
    |> Enum.map(&parse_line/1)
  end

  defp parse_line(line) do
    [ref, subject] = String.split(line, "|", parts: 2)
    {branch, message} = parse_subject(subject)

    %{
      index: ref |> String.trim_leading("stash@{") |> String.trim_trailing("}") |> String.to_integer(),
      branch: branch,
      message: message
    }
  end

  # `git stash` (no message) records "WIP on <branch>: <hash> <subject>";
  # `git stash push -m <message>` records "On <branch>: <message>".
  defp parse_subject("WIP on " <> rest), do: split_branch_message(rest)
  defp parse_subject("On " <> rest), do: split_branch_message(rest)
  defp parse_subject(subject), do: {"", subject}

  defp split_branch_message(rest) do
    case String.split(rest, ": ", parts: 2) do
      [branch, message] -> {branch, message}
      [branch] -> {branch, ""}
    end
  end
end
