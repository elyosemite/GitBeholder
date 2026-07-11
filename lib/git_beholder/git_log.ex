defmodule GitBeholder.GitLog do
  alias GitBeholder.GitRefs

  @default_limit 200

  def list_commits(repo_path, branch, limit \\ @default_limit) do
    if File.dir?(Path.join(repo_path, ".git")) do
      args = [
        "log",
        branch,
        "-n",
        Integer.to_string(limit),
        "--pretty=format:%H|%an|%ad|%s",
        "--date=format:%Y-%m-%d %H:%M"
      ]

      case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
        {output, 0} ->
          with {:ok, decorations} <- GitRefs.decorations_by_commit(repo_path) do
            commits =
              output
              |> String.trim()
              |> String.split("\n", trim: true)
              |> Enum.map(fn line ->
                [hash, author, timestamp, message] = String.split(line, "|", parts: 4)

                %{
                  hash: hash,
                  message: message,
                  author: author,
                  timestamp: timestamp,
                  refs: Map.get(decorations, hash, [])
                }
              end)

            {:ok, commits}
          end

        {error_msg, _exit_code} ->
          {:error, error_msg}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end
end
