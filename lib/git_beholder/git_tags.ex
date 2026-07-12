defmodule GitBeholder.GitTags do
  def list_tags(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      args = [
        "for-each-ref",
        "--sort=-creatordate",
        "--format=%(refname:short)|%(creatordate:short)",
        "refs/tags"
      ]

      case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
        {output, 0} -> {:ok, parse(output)}
        {error_msg, _exit_code} -> {:error, error_msg}
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
    [name, date] = String.split(line, "|", parts: 2)
    %{name: name, date: date}
  end
end
