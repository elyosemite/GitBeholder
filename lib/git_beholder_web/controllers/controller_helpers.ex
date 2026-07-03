defmodule GitBeholderWeb.ControllerHelpers do
  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]

  def respond_with_result(conn, {:ok, data}) when is_map(data) do
    json(conn, Map.put(data, :status, "ok"))
  end

  def respond_with_result(conn, {:ok, output}) do
    json(conn, %{status: "ok", output: output})
  end

  def respond_with_result(conn, {:error, message}, status \\ :bad_request) do
    conn
    |> put_status(status)
    |> json(%{status: "error", message: message})
  end
end
