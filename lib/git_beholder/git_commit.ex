defmodule GitBeholder.GitCommit do
  alias GitBeholder.Git.CommandRunner

  def commit_file(repo_path, file_path, message \\ "Commit from BitBeholder API") do
    full_path = Path.join(repo_path, file_path)

    cond do
      !File.exists?(full_path) ->
        {:error, "File does not exist: #{full_path}"}

      true ->
        with {:ok, _} <- CommandRunner.run(["add", file_path], repo_path),
             {:ok, commit_output} <- CommandRunner.run(["commit", "-m", message], repo_path) do
          {:ok, commit_output}
        end
    end
  end
end
