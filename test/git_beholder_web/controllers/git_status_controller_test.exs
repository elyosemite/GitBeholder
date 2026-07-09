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

  test "GET .../status returns file changes", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/status")

    changes = json_response(conn, 200)
    assert is_list(changes)

    for change <- changes do
      assert %{"path" => path, "status" => status, "staged" => staged} = change
      assert is_binary(path)
      assert status in ["M", "A", "D", "U"]
      assert is_boolean(staged)
    end
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/status")

    assert json_response(conn, 404)
  end
end
