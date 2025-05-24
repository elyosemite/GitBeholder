defmodule GitBeholderWeb.GitStatusController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStatus

  def status(conn, %{"path" => path}) do
    case GitStatus.git_status(path) do
      {:ok, output} ->
        json(conn, %{status: "ok", output: output})

        {:error, error_output} ->
          json(conn, %{status: "error", output: error_output})
    end
  end
end
