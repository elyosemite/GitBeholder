defmodule GitBeholder.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias GitBeholder.Accounts.Team

  # A resized upload stored as a data URL is a few tens of KB; this caps
  # anything far larger than a profile picture.
  @max_avatar_length 500_000

  schema "users" do
    field :name, :string
    field :email, :string
    field :avatar_url, :string
    field :is_local, :boolean, default: false

    belongs_to :team, Team

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :avatar_url, :team_id])
    |> validate_required([:name, :email, :team_id])
    |> validate_length(:name, max: 255)
    |> validate_format(:email, ~r/^[^\s@]+@[^\s@]+$/, message: "must be a valid email")
    |> validate_length(:avatar_url, max: @max_avatar_length)
    |> validate_avatar_url()
    |> unique_constraint(:email)
    |> foreign_key_constraint(:team_id)
  end

  # Only images we can render: an uploaded data URL or a remote http(s) URL.
  defp validate_avatar_url(changeset) do
    validate_change(changeset, :avatar_url, fn :avatar_url, url ->
      if String.starts_with?(url, ["data:image/", "https://", "http://"]),
        do: [],
        else: [avatar_url: "must be an image data URL or an http(s) URL"]
    end)
  end
end
