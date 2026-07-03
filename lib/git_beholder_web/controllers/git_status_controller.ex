defmodule GitBeholderWeb.GitStatusController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStatus

  def status(conn, %{"path" => path}) do
    case GitStatus.git_status(path) do
      {:ok, output} ->
        json(conn, %{status: "ok", output: output})

      {:error, error_output} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_output})
    end
  end

  def status(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{status: "error", message: "Missing required parameter: path"})
  end
end
