defmodule GitBeholder.GitStatus do
  alias GitBeholder.Git.CommandRunner

  def git_status(path) do
    CommandRunner.run(["status"], path)
  end
end
