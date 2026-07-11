defmodule GitBeholder.GitStaging do
  def stage(repo_path, file_path) do
    run_git(repo_path, ["add", "--", file_path])
  end

  def unstage(repo_path, file_path) do
    run_git(repo_path, ["reset", "--", file_path])
  end

  defp run_git(repo_path, args) do
    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end
end
