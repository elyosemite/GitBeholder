defmodule GitBeholderWeb.GitStatusController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStatus

  def status(conn, _params) do
    case GitStatus.git_status(conn.assigns.repository.path) do
      {:ok, output} ->
        json(conn, %{status: "ok", output: output})

      {:error, error_output} ->
        json(conn, %{status: "error", output: error_output})
    end
  end
end
