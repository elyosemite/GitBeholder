defmodule GitBeholderWeb.GitCommitController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitCommit
  alias GitBeholder.PathValidator

  def create(conn, %{"repo_path" => repo_path, "file_path" => file_path, "message" => message}) do
    with {:ok, safe_repo} <- PathValidator.validate_repo_path(repo_path),
         {:ok, safe_file} <- PathValidator.validate_file_path(safe_repo, file_path) do
      case GitCommit.commit_file(safe_repo, safe_file, message) do
        {:ok, output} ->
          json(conn, %{status: "ok", message: output})

        {:error, error_msg} ->
          conn
          |> put_status(:bad_request)
          |> json(%{status: "error", message: error_msg})
      end
    else
      {:error, reason} ->
        conn
        |> put_status(:forbidden)
        |> json(%{status: "error", message: reason})
    end
  end

  def create(conn, %{"repo_path" => repo_path, "file_path" => file_path}) do
    create(conn, %{"repo_path" => repo_path, "file_path" => file_path, "message" => "Commit via GitBeholder API"})
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{status: "error", message: "Missing required parameters: repo_path, file_path"})
  end
end
