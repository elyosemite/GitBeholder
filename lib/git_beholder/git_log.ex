defmodule GitBeholder.GitLog do
  alias GitBeholder.GitRefs

  @default_limit 200
  # Unit/record separators: commit subjects and bodies can contain almost
  # any character (including "|" or newlines), so a plain "|"/"\n" split
  # would break on real-world messages.
  @field_sep "\x1f"
  @record_sep "\x1e"

  def list_commits(repo_path, branch, limit \\ @default_limit) do
    if File.dir?(Path.join(repo_path, ".git")) do
      args = [
        "log",
        branch,
        "-n",
        Integer.to_string(limit),
        "--pretty=format:%H#{@field_sep}%an#{@field_sep}%ad#{@field_sep}%s#{@field_sep}%b#{@record_sep}",
        "--date=format:%Y-%m-%d %H:%M"
      ]

      # The refs lookup spawns its own git processes; run it alongside
      # `git log` instead of after it.
      decorations_task = Task.async(fn -> GitRefs.decorations_by_commit(repo_path) end)
      log_result = System.cmd("git", args, cd: repo_path, stderr_to_stdout: true)
      decorations = Task.await(decorations_task, :infinity)

      case {log_result, decorations} do
        {{output, 0}, {:ok, decorations}} -> {:ok, parse(output, decorations)}
        {{_output, 0}, {:error, reason}} -> {:error, reason}
        {{error_msg, _exit_code}, _decorations} -> {:error, error_msg}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end

  defp parse(output, decorations) do
    output
    |> String.split(@record_sep)
    |> Enum.map(&String.trim/1)
    |> Enum.reject(&(&1 == ""))
    |> Enum.map(fn record ->
      [hash, author, timestamp, subject, body] = String.split(record, @field_sep, parts: 5)

      %{
        hash: hash,
        message: subject,
        description: flatten(body),
        author: author,
        timestamp: timestamp,
        refs: Map.get(decorations, hash, [])
      }
    end)
  end

  defp flatten(body) do
    body
    |> String.trim()
    |> String.replace(~r/\s*\n\s*/, " ")
  end
end
