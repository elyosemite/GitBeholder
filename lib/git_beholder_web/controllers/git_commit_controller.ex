defmodule GitBeholderWeb.GitCommitController do
  use GitBeholderWeb, :controller
  import GitBeholderWeb.ControllerHelpers

  alias GitBeholder.GitCommit

  def create(conn, %{"repo_path" => repo_path, "file_path" => file_path, "message" => message}) do
    respond_with_result(conn, GitCommit.commit_file(repo_path, file_path, message))
  end

  def create(conn, %{"repo_path" => repo_path, "file_path" => file_path}) do
    create(conn, %{
      "repo_path" => repo_path,
      "file_path" => file_path,
      "message" => "Commit via Gitbehodler API"
    })
  end
end
