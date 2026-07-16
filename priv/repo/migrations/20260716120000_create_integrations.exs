defmodule GitBeholder.Repo.Migrations.CreateIntegrations do
  use Ecto.Migration

  def change do
    create table(:integrations) do
      add :repository_id, references(:repositories, on_delete: :delete_all), null: false
      add :provider, :string, null: false
      add :config, :map, null: false, default: %{}
      add :credentials, :binary, null: false
      add :enabled, :boolean, null: false, default: true
      add :auto_close_enabled, :boolean, null: false, default: false
      add :auto_close_target_state, :string

      timestamps()
    end

    create index(:integrations, [:repository_id])
  end
end
