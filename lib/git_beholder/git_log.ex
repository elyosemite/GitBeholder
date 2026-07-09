defmodule GitBeholder.GitLog do
  @default_limit 20

  # refs (branch/tag decorations) and platform are left empty here — no
  # decoration lookup yet, and platform (github/gitlab/etc) isn't
  # something plain git knows about at all.
  def list_commits(repo_path, branch, limit \\ @default_limit) do
    if File.dir?(Path.join(repo_path, ".git")) do
      args = [
        "log",
        branch,
        "-n",
        Integer.to_string(limit),
        "--pretty=format:%h|%an|%ad|%s",
        "--date=format:%Y-%m-%d %H:%M"
      ]

      case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
        {output, 0} ->
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
                refs: []
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
