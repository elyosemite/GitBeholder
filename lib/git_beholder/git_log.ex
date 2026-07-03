defmodule GitBeholder.GitLog do
  alias GitBeholder.Git.CommandRunner

  @default_limit 10

  def list_commits(repo_path, limit \\ @default_limit) do
    CommandRunner.with_valid_repo(repo_path, fn ->
      args = [
        "log",
        "-n",
        Integer.to_string(limit),
        "--pretty=format:%H|%an|%ad|%s",
        "--date=short"
      ]

      case CommandRunner.run(args, repo_path) do
        {:ok, output} ->
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

        error ->
          error
      end
    end)
  end
end
