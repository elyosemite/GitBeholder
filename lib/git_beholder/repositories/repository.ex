defmodule GitBeholder.Repositories.Repository do
  use Ecto.Schema
  import Ecto.Changeset

  alias GitBeholder.Repositories.{Workspace, Folder}

  schema "repositories" do
    field :name, :string
    field :path, :string
    # Set by Repositories.mark_opened/1, never by user input.
    field :last_opened_at, :utc_datetime_usec

    belongs_to :workspace, Workspace
    belongs_to :folder, Folder

    timestamps()
  end

  @doc false
  def changeset(repository, attrs) do
    repository
    |> cast(attrs, [:name, :path, :workspace_id, :folder_id])
    |> validate_required([:name, :path, :workspace_id])
    |> validate_length(:name, max: 255)
    |> foreign_key_constraint(:workspace_id)
    |> foreign_key_constraint(:folder_id)
  end
end
