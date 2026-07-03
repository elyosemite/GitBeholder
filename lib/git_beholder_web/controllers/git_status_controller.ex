defmodule GitBeholderWeb.GitStatusController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStatus
  alias GitBeholder.PathValidator

  def status(conn, %{"path" => path}) do
    case PathValidator.validate_repo_path(path) do
      {:ok, safe_path} ->
        case GitStatus.git_status(safe_path) do
          {:ok, output} ->
            json(conn, %{status: "ok", output: output})

          {:error, error_output} ->
            conn
            |> put_status(:bad_request)
            |> json(%{status: "error", output: error_output})
        end

      {:error, reason} ->
        conn
        |> put_status(:forbidden)
        |> json(%{status: "error", message: reason})
    end
  end

  def status(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{status: "error", message: "Missing required parameter: path"})
  end
end
