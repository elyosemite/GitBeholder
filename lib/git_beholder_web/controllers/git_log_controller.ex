defmodule GitBeholderWeb.GitLogController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitLog
  alias GitBeholder.PathValidator

  @max_limit 100

  def index(conn, %{"repo_path" => path} = params) do
    with {:ok, safe_path} <- PathValidator.validate_repo_path(path),
         {:ok, limit} <- parse_limit(params) do
      case GitLog.list_commits(safe_path, limit) do
        {:ok, commits} ->
          json(conn, commits)

        {:error, reason} ->
          conn
          |> put_status(:bad_request)
          |> json(%{error: reason})
      end
    else
      {:error, reason} ->
        conn
        |> put_status(:forbidden)
        |> json(%{status: "error", message: reason})
    end
  end

  def index(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{status: "error", message: "Missing required parameter: repo_path"})
  end

  defp parse_limit(%{"limit" => limit_str}) when is_binary(limit_str) do
    case Integer.parse(limit_str) do
      {n, ""} when n > 0 and n <= @max_limit -> {:ok, n}
      {n, ""} when n > @max_limit -> {:ok, @max_limit}
      _ -> {:error, "Invalid limit parameter: must be a positive integer"}
    end
  end

  defp parse_limit(_), do: {:ok, 10}
end
