defmodule GitBeholder.Repositories do
  @moduledoc """
  Context for organizing and resolving registered Git repositories,
  grouped under Workspaces and (optionally) Folders.
  """

  import Ecto.Query, warn: false

  alias GitBeholder.Repo
  alias GitBeholder.Repositories.{Workspace, Folder, Repository}

  @doc """
  Creates a Workspace.
  """
  def create_workspace(attrs) do
    %Workspace{}
    |> Workspace.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Creates a Folder inside a Workspace, optionally nested under a parent Folder.
  """
  def create_folder(attrs) do
    %Folder{}
    |> Folder.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Registers a Repository by absolute path inside a Workspace,
  optionally placed inside a Folder.
  """
  def create_repository(attrs) do
    %Repository{}
    |> Repository.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Resolves a Repository that belongs to the given Workspace, validating
  that its registered path still exists and is still a Git repository.

  Returns:
    * `{:ok, %Repository{}}`
    * `{:error, :not_found}` — no such repository in this workspace
    * `{:error, :path_unavailable}` — repository exists in the database,
      but its registered path is missing or no longer a Git repository
  """
  def fetch_repository(workspace_id, repository_id) do
    query =
      from r in Repository,
        where: r.id == ^repository_id and r.workspace_id == ^workspace_id

    case Repo.one(query) do
      nil ->
        {:error, :not_found}

      %Repository{} = repository ->
        if valid_git_repository?(repository.path) do
          {:ok, repository}
        else
          {:error, :path_unavailable}
        end
    end
  end

  defp valid_git_repository?(path) do
    File.dir?(path) and File.dir?(Path.join(path, ".git"))
  end
end
