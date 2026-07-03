defmodule GitBeholder.GitStatus do
  def git_status(path) do
    cond do
      !File.dir?(path) ->
        {:error, "Directory does not exist: #{path}"}

      !File.dir?(Path.join(path, ".git")) ->
        {:error, "Not a valid Git repository: #{path}"}

      true ->
        case System.cmd("git", ["status"], cd: path, stderr_to_stdout: true) do
          {output, 0} -> {:ok, output}
          {output, _} -> {:error, output}
        end
    end
  end
end
