defmodule GitBeholder.Accounts.Team do
  use Ecto.Schema
  import Ecto.Changeset

  alias GitBeholder.Accounts.User

  schema "teams" do
    field :name, :string

    has_many :users, User

    timestamps()
  end

  @doc false
  def changeset(team, attrs) do
    team
    |> cast(attrs, [:name])
    |> validate_required([:name])
    |> validate_length(:name, max: 255)
    |> unique_constraint(:name)
  end
end
