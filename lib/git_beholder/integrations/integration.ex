defmodule GitBeholder.Integrations.Integration do
  use Ecto.Schema
  import Ecto.Changeset

  alias GitBeholder.Repositories.Repository
  alias GitBeholder.Integrations.EncryptedBinary

  schema "integrations" do
    field :provider, :string
    field :config, :map, default: %{}
    field :credentials, EncryptedBinary
    field :enabled, :boolean, default: true
    field :auto_close_enabled, :boolean, default: false
    field :auto_close_target_state, :string

    belongs_to :repository, Repository

    timestamps()
  end

  @doc false
  def changeset(integration, attrs) do
    integration
    |> cast(attrs, [
      :provider,
      :config,
      :credentials,
      :enabled,
      :auto_close_enabled,
      :auto_close_target_state,
      :repository_id
    ])
    |> validate_required([:provider, :credentials, :repository_id])
    |> foreign_key_constraint(:repository_id)
  end
end
