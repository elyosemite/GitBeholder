defmodule GitBeholder.GitLog do
  @default_limit 10

  def list_commits(repo_path, limit \\ @default_limit) do
    if File.dir?(Path.join(repo_path, ".git")) do
      args = [
        "log",
        "-n",
        Integer.to_string(limit),
        "--pretty=format:%H|%an|%ad|%s",
        "--date=short"
      ]

      case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
        {output, 0} ->
          commits =
            output
            |> String.trim()
            |> String.split("\n", trim: true)
            |> Enum.map(fn line ->
              [hash, author, date, message] = String.split(line, "|", parts: 4)

              %{
                hash: hash,
                author: author,
                date: date,
                message: message
              }
            end)

          {:ok, commits}

        {error_msg, _exit_code} ->
          {:error, error_msg}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end
end
