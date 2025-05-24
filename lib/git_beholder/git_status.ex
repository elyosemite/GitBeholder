defmodule GitBeholder.GitStatus do
  def git_status(path) do
    {output, exit_code} = System.cmd("git", ["status"], cd: path, stderr_to_stdout: true)

    case exit_code do
      0 -> {:ok, output}
      _ -> {:error, output}
    end
  end
end
