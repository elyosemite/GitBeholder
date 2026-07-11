defmodule GitBeholderWeb.GitBranchControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Repositories

  setup %{conn: conn} do
    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})

    {:ok, repository} =
      Repositories.create_repository(%{
        name: "git_beholder",
        path: File.cwd!(),
        workspace_id: workspace.id
      })

    %{conn: conn, workspace: workspace, repository: repository}
  end

  test "GET .../branches returns local and remote branches with current/local/remote flags", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/branches"
      )

    branches = json_response(conn, 200)

    assert [%{"name" => _, "current" => _, "local" => _, "remote" => _} | _] = branches
    assert Enum.count(branches, & &1["current"]) == 1
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/branches")

    assert json_response(conn, 404)
  end
end
