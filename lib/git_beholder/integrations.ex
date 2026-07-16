defmodule GitBeholder.Integrations do
  @moduledoc """
  Context for connecting a Repository to a work item provider (Azure
  DevOps now, others later), storing its credentials encrypted, and
  resolving that connection for search/link/transition operations.
  """

  alias GitBeholder.Repo
  alias GitBeholder.Integrations.Integration

  @provider_modules %{
    "azure_devops" => GitBeholder.Integrations.AzureDevOps
  }

  @doc """
  Tests a would-be connection's credentials against the provider named
  in `attrs` (`provider`, `config`, `credentials`, ...) without
  persisting anything — backs the "Test connection" action, which runs
  before Save.

  Returns:
    * `{:ok, list()}` — e.g. the provider's work item types
    * `{:error, :unsupported_provider}`
    * `{:error, term()}` — whatever the provider's `list_types/1` returns
  """
  def test_connection(attrs) do
    with {:ok, provider_module} <- provider_module(fetch(attrs, :provider)) do
      connection = %{
        config: fetch(attrs, :config) || %{},
        credentials: fetch(attrs, :credentials)
      }

      provider_module.list_types(connection)
    end
  end

  @doc """
  Connects a Repository to a work item provider, persisting `attrs`
  (`provider`, `config`, `credentials`, ...). The credential is
  encrypted transparently by the `Integration` schema's
  `EncryptedBinary` field type — this function never sees ciphertext,
  and never returns the plaintext credential back out.

  Returns:
    * `{:ok, %Integration{}}`
    * `{:error, %Ecto.Changeset{}}`
  """
  def connect(repository_id, attrs) do
    %Integration{}
    |> Integration.changeset(put_repository_id(attrs, repository_id))
    |> Repo.insert()
  end

  @doc """
  Fetches the Integration connected to `repository_id`.

  Returns:
    * `{:ok, %Integration{}}`
    * `{:error, :not_found}`
  """
  def get_connection(repository_id) do
    case Repo.get_by(Integration, repository_id: repository_id) do
      nil -> {:error, :not_found}
      %Integration{} = integration -> {:ok, integration}
    end
  end

  @doc """
  Disconnects (deletes) the Integration connected to `repository_id`.

  Returns:
    * `{:ok, %Integration{}}`
    * `{:error, :not_found}`
  """
  def disconnect(repository_id) do
    with {:ok, integration} <- get_connection(repository_id) do
      Repo.delete(integration)
    end
  end

  # Ecto.Changeset.cast/3 requires params to be either all-atom-keyed or
  # all-string-keyed, never mixed — so repository_id is merged in using
  # whichever key style attrs already uses (controllers pass Phoenix's
  # string-keyed params; internal/test callers often use atom keys).
  defp put_repository_id(attrs, repository_id) do
    if Enum.any?(Map.keys(attrs), &is_atom/1) do
      Map.put(attrs, :repository_id, repository_id)
    else
      Map.put(attrs, "repository_id", repository_id)
    end
  end

  defp provider_module(provider) do
    case Map.fetch(@provider_modules, provider) do
      {:ok, module} -> {:ok, module}
      :error -> {:error, :unsupported_provider}
    end
  end

  # Reads `key` from `attrs` regardless of whether the caller used atom
  # keys (internal/test callers) or string keys (Phoenix params).
  defp fetch(attrs, key) do
    Map.get(attrs, key) || Map.get(attrs, Atom.to_string(key))
  end
end
