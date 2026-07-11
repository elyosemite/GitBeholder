defmodule GitBeholderWeb.Plugs.FetchRepositoryTest do
  use GitBeholder.DataCase, async: false

  import Plug.Test

  alias GitBeholder.Repositories
  alias GitBeholderWeb.Plugs.FetchRepository

  setup do
    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})

    {:ok, repository} =
      Repositories.create_repository(%{
        name: "git_beholder",
        path: File.cwd!(),
        workspace_id: workspace.id
      })

    %{workspace: workspace, repository: repository}
  end

  defp conn_with_params(workspace_id, repository_id) do
    :get
    |> conn("/api/v1/workspaces/#{workspace_id}/repositories/#{repository_id}/status")
    |> Map.put(:params, %{
      "workspace_id" => to_string(workspace_id),
      "repository_id" => to_string(repository_id)
    })
  end

  test "assigns the resolved repository when found", %{
    workspace: workspace,
    repository: repository
  } do
    conn =
      workspace.id
      |> conn_with_params(repository.id)
      |> FetchRepository.call([])

    refute conn.halted
    assert conn.assigns.repository.id == repository.id
  end

  test "halts with 404 for an unknown repository", %{workspace: workspace} do
    conn =
      workspace.id
      |> conn_with_params(999_999)
      |> FetchRepository.call([])

    assert conn.halted
    assert conn.status == 404
  end

  test "halts with 404 when the repository belongs to a different workspace", %{
    repository: repository
  } do
    {:ok, other_workspace} = Repositories.create_workspace(%{name: "Sales"})

    conn =
      other_workspace.id
      |> conn_with_params(repository.id)
      |> FetchRepository.call([])

    assert conn.halted
    assert conn.status == 404
  end

  test "halts with 400 for a non-numeric id" do
    conn =
      :get
      |> conn("/api/v1/workspaces/abc/repositories/def/status")
      |> Map.put(:params, %{"workspace_id" => "abc", "repository_id" => "def"})
      |> FetchRepository.call([])

    assert conn.halted
    assert conn.status == 400
  end
end
