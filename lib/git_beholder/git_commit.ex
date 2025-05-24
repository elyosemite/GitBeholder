defmodule GitBeholder.GitCommit do
  def commit_file(repo_path, file_path, message \\ "Commit from BitBeholder API") do
    full_path = Path.join(repo_path, file_path)

    cond do
      !File.exists?(full_path) ->
        {:error, "File does not exist: #{full_path}"}

      true ->
        with {_, 0} <- System.cmd("git", ["add", file_path], cd: repo_path, stderr_to_stdout: true),
            {commit_output, 0} <- System.cmd("git", ["commit", "-m", message], cd: repo_path, stderr_to_stdout: true) do
          {:ok, commit_output}
        else
          {error_output, _} -> {:error, error_output}
      end
    end
  end
end
