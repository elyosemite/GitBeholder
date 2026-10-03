defmodule GitBeholder.Repo.Migrations.AddLastOpenedAtToRepositories do
  use Ecto.Migration

  def change do
    alter table(:repositories) do
      # When the app last opened this repository: orders the launcher's
      # recent list and picks the repository to reopen on startup.
      add :last_opened_at, :utc_datetime_usec
    end

    create index(:repositories, [:last_opened_at])
  end
end
