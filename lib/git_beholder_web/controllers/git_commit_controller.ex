defmodule GitBeholderWeb.GitCommitController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitCommit

  def create(conn, %{"message" => message}) do
    case GitCommit.commit(conn.assigns.repository.path, message) do
      {:ok, output} ->
        json(conn, %{status: "ok", message: output})

      {:error, error_msg} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_msg})
    end
  end
end
