defmodule GitBeholderWeb.GitStagingController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStaging

  def stage(conn, %{"file_path" => file_path}) do
    respond(conn, GitStaging.stage(conn.assigns.repository.path, file_path))
  end

  def unstage(conn, %{"file_path" => file_path}) do
    respond(conn, GitStaging.unstage(conn.assigns.repository.path, file_path))
  end

  defp respond(conn, {:ok, output}) do
    json(conn, %{status: "ok", message: output})
  end

  defp respond(conn, {:error, reason}) do
    conn
    |> put_status(:bad_request)
    |> json(%{status: "error", message: reason})
  end
end
