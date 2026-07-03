defmodule GitBeholder.Git.CommandRunner do
  @type cmd_result :: {:ok, String.t()} | {:error, String.t()}

  @spec run(list(String.t()), String.t()) :: cmd_result()
  def run(args, repo_path) do
    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {error_output, _} -> {:error, error_output}
    end
  end

  @spec git_repo?(String.t()) :: boolean()
  def git_repo?(path) do
    File.dir?(Path.join(path, ".git"))
  end

  @spec with_valid_repo(String.t(), (-> cmd_result())) :: cmd_result()
  def with_valid_repo(repo_path, fun) do
    if git_repo?(repo_path) do
      fun.()
    else
      {:error, "Not a valid Git repository"}
    end
  end
end
