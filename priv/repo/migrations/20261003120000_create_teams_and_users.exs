defmodule GitBeholder.Repo.Migrations.CreateTeamsAndUsers do
  use Ecto.Migration

  def change do
    create table(:teams) do
      add :name, :string, null: false

      timestamps()
    end

    create unique_index(:teams, [:name])

    # Every user belongs to a team; "default" always exists so a user can
    # be created before any team management happens.
    execute(
      """
      INSERT INTO teams (name, inserted_at, updated_at)
      VALUES ('default', strftime('%Y-%m-%dT%H:%M:%S', 'now'), strftime('%Y-%m-%dT%H:%M:%S', 'now'))
      """,
      "DELETE FROM teams WHERE name = 'default'"
    )

    create table(:users) do
      add :name, :string, null: false
      add :email, :string, null: false
      # A data URL from an upload for now; a platform avatar URL once
      # integrations (Azure DevOps, GitHub...) fill it in.
      add :avatar_url, :text
      # The person using this installation — the header avatar.
      add :is_local, :boolean, null: false, default: false
      add :team_id, references(:teams, on_delete: :restrict), null: false

      timestamps()
    end

    create unique_index(:users, [:email])
    create index(:users, [:team_id])
    create unique_index(:users, [:is_local], where: "is_local", name: :users_single_local_index)
  end
end
