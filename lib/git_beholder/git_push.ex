defmodule GitBeholder.GitPush do
  def status(repo_path) do
    case System.cmd("git", ["rev-list", "--left-right", "--count", "@{u}...HEAD"],
           cd: repo_path,
           stderr_to_stdout: true
         ) do
      {output, 0} ->
        [behind, ahead] =
          output
          |> String.trim()
          |> String.split(~r/\s+/)
          |> Enum.map(&String.to_integer/1)

        {:ok, %{ahead: ahead, behind: behind}}

      # No upstream configured for the current branch — nothing to sync
      # against, so report a quiet zero state instead of an error.
      {_error_output, _exit_code} ->
        {:ok, %{ahead: 0, behind: 0}}
    end
  end

  def push(repo_path) do
    case System.cmd("git", ["push"], cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {error_output, _exit_code} -> {:error, error_output}
    end
  end
end
