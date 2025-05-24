defmodule GitBeholderWeb.GitCommitController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitCommit

  def create(conn, %{"repo_path" => repo_path, "file_path" => file_path, "message" => message}) do
    case GitCommit.commit_file(repo_path, file_path, message) do
      {:ok, output} ->
        json(conn, %{status: "ok", message: output})

      {:error, error_msg} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_msg})
    end
  end

  def create(conn, %{"repo_path" => repo_path, "file_path" => file_path}) do
    create(conn, %{"repo_path" => repo_path, "file_path" => file_path, "message" => "Commit via Gitbehodler API"})
  end
end
