defmodule GitBeholder.Accounts do
  @moduledoc """
  Context for users and the teams they belong to.

  Every user belongs to exactly one team; the "default" team is created by
  the migration and receives any user created without a team. One user is
  the *local* user — the person using this installation, shown by the
  header avatar — created on first access from the global git identity.
  """

  import Ecto.Query, warn: false

  alias GitBeholder.Repo
  alias GitBeholder.Accounts.{Team, User}

  @default_team "default"

  ## Teams

  @doc "Lists all teams, ordered by name."
  def list_teams do
    Repo.all(from t in Team, order_by: t.name)
  end

  @doc "Creates a team."
  def create_team(attrs) do
    %Team{}
    |> Team.changeset(attrs)
    |> Repo.insert()
  end

  @doc "The team every user falls back to. Always present (seeded by migration)."
  def default_team! do
    Repo.get_by!(Team, name: @default_team)
  end

  ## Users

  @doc "Lists all users with their team."
  def list_users do
    Repo.all(from u in User, order_by: u.name, preload: :team)
  end

  @doc "Gets a user with their team, or nil."
  def get_user(id) do
    User |> Repo.get(id) |> Repo.preload(:team)
  end

  @doc """
  Creates a user. Without a `team_id` the user joins the default team.
  """
  def create_user(attrs) do
    attrs = put_default_team(attrs)

    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
    |> preload_team()
  end

  @doc "Updates a user's name, email, avatar or team."
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
    |> preload_team()
  end

  @doc """
  The local user, created on first call from `identity` — by default the
  global git `user.name` / `user.email`, the same identity the user's
  commits carry.
  """
  def local_user(identity \\ &git_identity/0) do
    case Repo.one(from u in User, where: u.is_local, preload: :team) do
      %User{} = user -> {:ok, user}
      nil -> create_local_user(identity.())
    end
  end

  defp create_local_user(%{name: name, email: email}) do
    %User{is_local: true}
    |> User.changeset(%{name: name, email: email, team_id: default_team!().id})
    |> Repo.insert()
    |> preload_team()
  end

  defp git_identity do
    %{
      name: git_config("user.name") || "GitBeholder user",
      email: git_config("user.email") || "user@localhost"
    }
  end

  defp git_config(key) do
    case System.cmd("git", ["config", "--global", key], stderr_to_stdout: true) do
      {value, 0} -> if String.trim(value) == "", do: nil, else: String.trim(value)
      _ -> nil
    end
  end

  # Params arrive with string keys from controllers, atom keys from code.
  defp put_default_team(attrs) do
    has_team? = Map.get(attrs, :team_id) || Map.get(attrs, "team_id")

    cond do
      has_team? -> attrs
      Enum.any?(Map.keys(attrs), &is_binary/1) -> Map.put(attrs, "team_id", default_team!().id)
      true -> Map.put(attrs, :team_id, default_team!().id)
    end
  end

  defp preload_team({:ok, user}), do: {:ok, Repo.preload(user, :team, force: true)}
  defp preload_team(error), do: error
end
