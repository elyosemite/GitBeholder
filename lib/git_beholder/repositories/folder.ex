defmodule GitBeholder.Repositories.Folder do
  use Ecto.Schema
  import Ecto.Changeset

  alias GitBeholder.Repositories.{Workspace, Repository}

  schema "folders" do
    field :name, :string

    belongs_to :workspace, Workspace
    belongs_to :parent_folder, __MODULE__, foreign_key: :parent_folder_id

    has_many :subfolders, __MODULE__, foreign_key: :parent_folder_id
    has_many :repositories, Repository

    timestamps()
  end

  @doc false
  def changeset(folder, attrs) do
    folder
    |> cast(attrs, [:name, :workspace_id, :parent_folder_id])
    |> validate_required([:name, :workspace_id])
    |> validate_length(:name, max: 255)
    |> foreign_key_constraint(:workspace_id)
    |> foreign_key_constraint(:parent_folder_id)
  end
end
