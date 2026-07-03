defmodule GitBeholderWeb.GitLogController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitLog

  def index(conn, %{"repo_path" => path} = params) do
    with {:ok, limit} <- parse_limit(Map.get(params, "limit", "10")) do
      case GitLog.list_commits(path, limit) do
        {:ok, commits} ->
          json(conn, commits)

        {:error, reason} ->
          conn
          |> put_status(:bad_request)
          |> json(%{status: "error", message: reason})
      end
    else
      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: reason})
    end
  end

  def index(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{status: "error", message: "Missing required parameter: repo_path"})
  end

  defp parse_limit(value) when is_binary(value) do
    case Integer.parse(value) do
      {n, ""} when n > 0 -> {:ok, n}
      _ -> {:error, "Invalid limit: must be a positive integer"}
    end
  end
end
