defmodule GitBeholderWeb.UserJSON do
  @moduledoc "JSON shapes for users and teams, shared by their controllers."

  def user(user) do
    %{
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      is_local: user.is_local,
      team: team(user.team)
    }
  end

  def team(team) do
    %{id: team.id, name: team.name}
  end
end
