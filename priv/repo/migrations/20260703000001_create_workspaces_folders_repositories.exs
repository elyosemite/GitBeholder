defmodule GitBeholder.Repo.Migrations.CreateWorkspacesFoldersRepositories do
  use Ecto.Migration

  def change do
    create table(:workspaces) do
      add :name, :string, null: false

      timestamps()
    end

    create table(:folders) do
      add :name, :string, null: false
      add :workspace_id, references(:workspaces, on_delete: :delete_all), null: false
      add :parent_folder_id, references(:folders, on_delete: :delete_all), null: true

      timestamps()
    end

    create index(:folders, [:workspace_id])
    create index(:folders, [:parent_folder_id])

    create table(:repositories) do
      add :name, :string, null: false
      add :path, :string, null: false
      add :workspace_id, references(:workspaces, on_delete: :delete_all), null: false
      add :folder_id, references(:folders, on_delete: :nilify_all), null: true

      timestamps()
    end

    create index(:repositories, [:workspace_id])
    create index(:repositories, [:folder_id])
  end
end
