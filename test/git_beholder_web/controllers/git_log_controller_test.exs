defmodule GitBeholderWeb.GitLogControllerTest do
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

  test "GET .../log returns recent commits", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/log?limit=3"
      )

    assert [%{"hash" => _, "author" => _, "date" => _, "message" => _} | _] =
             json_response(conn, 200)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/log")

    assert json_response(conn, 404)
  end
end
