defmodule GitBeholderWeb.UserController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Accounts
  alias GitBeholderWeb.UserJSON

  def index(conn, _params) do
    json(conn, %{users: Enum.map(Accounts.list_users(), &UserJSON.user/1)})
  end

  def show(conn, %{"id" => id}) do
    case Accounts.get_user(id) do
      nil -> conn |> put_status(:not_found) |> json(%{error: "User not found"})
      user -> json(conn, UserJSON.user(user))
    end
  end

  def create(conn, params) do
    params
    |> Map.take(["name", "email", "avatar_url", "team_id"])
    |> Accounts.create_user()
    |> respond(conn, :created)
  end

  def update(conn, %{"id" => id} = params) do
    case Accounts.get_user(id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "User not found"})

      user ->
        user
        |> Accounts.update_user(Map.take(params, ["name", "email", "avatar_url", "team_id"]))
        |> respond(conn, :ok)
    end
  end

  # The local user: the person using this install (header avatar).
  def show_me(conn, _params) do
    {:ok, user} = Accounts.local_user()
    json(conn, UserJSON.user(user))
  end

  def update_me(conn, params) do
    {:ok, user} = Accounts.local_user()

    user
    |> Accounts.update_user(Map.take(params, ["name", "email", "avatar_url", "team_id"]))
    |> respond(conn, :ok)
  end

  defp respond({:ok, user}, conn, status) do
    conn |> put_status(status) |> json(UserJSON.user(user))
  end

  defp respond({:error, changeset}, conn, _status) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
  end
end
