defmodule GitBeholder.GitCommit do
  def commit(repo_path, message) do
    case System.cmd("git", ["commit", "-m", message], cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {error_output, _} -> {:error, error_output}
    end
  end
end
