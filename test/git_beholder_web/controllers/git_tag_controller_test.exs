defmodule GitBeholderWeb.GitTagControllerTest do
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

  test "GET .../tags returns the tag list", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/tags")

    tags = json_response(conn, 200)
    assert is_list(tags)

    for tag <- tags do
      assert %{"name" => name, "date" => date} = tag
      assert is_binary(name)
      assert is_binary(date)
    end
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/tags")

    assert json_response(conn, 404)
  end
end
