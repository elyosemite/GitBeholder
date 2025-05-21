defmodule GitBeholderWeb.MusicController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Music

  def index(conn, _params) do
    "ok"
    |> Music.create()
    |> handle_response(conn)
  end

  defp handle_response({:ok, music}, conn) do
    conn
    |> put_status(:ok)
    |> render("create.json", music: music)
  end

  defp handle_response({:error, message}, conn) do
    conn
    |> put_status(:bad_request)
    |> json(%{message: message})
  end
end
