defmodule GitBeholderWeb.GitPushController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitPush

  def status(conn, _params) do
    {:ok, status} = GitPush.status(conn.assigns.repository.path)
    json(conn, status)
  end

  def create(conn, _params) do
    case GitPush.push(conn.assigns.repository.path) do
      {:ok, output} ->
        json(conn, %{status: "ok", message: output})

      {:error, error_msg} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_msg})
    end
  end
end
