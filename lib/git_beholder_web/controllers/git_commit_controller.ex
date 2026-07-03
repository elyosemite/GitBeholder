defmodule GitBeholderWeb.GitCommitController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitCommit

  def create(conn, %{"file_path" => file_path} = params) do
    message = Map.get(params, "message", "Commit via Gitbehodler API")

    case GitCommit.commit_file(conn.assigns.repository.path, file_path, message) do
      {:ok, output} ->
        json(conn, %{status: "ok", message: output})

      {:error, error_msg} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_msg})
    end
  end
end
