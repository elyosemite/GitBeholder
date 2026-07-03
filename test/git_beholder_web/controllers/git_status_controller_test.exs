defmodule GitBeholderWeb.GitStatusControllerTest do
  use GitBeholderWeb.ConnCase, async: true

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

  test "GET .../status returns the repository status", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/status")

    assert %{"status" => "ok", "output" => output} = json_response(conn, 200)
    assert is_binary(output)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/status")

    assert json_response(conn, 404)
  end
end
