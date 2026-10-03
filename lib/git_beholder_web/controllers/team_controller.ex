defmodule GitBeholderWeb.TeamController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Accounts
  alias GitBeholderWeb.UserJSON

  def index(conn, _params) do
    json(conn, %{teams: Enum.map(Accounts.list_teams(), &UserJSON.team/1)})
  end

  def create(conn, params) do
    case Accounts.create_team(params) do
      {:ok, team} ->
        conn
        |> put_status(:created)
        |> json(UserJSON.team(team))

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
    end
  end
end
