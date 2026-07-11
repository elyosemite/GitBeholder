defmodule GitBeholderWeb.GitStashControllerTest do
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

  test "GET .../stashes returns the stash list", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/stashes")

    stashes = json_response(conn, 200)
    assert is_list(stashes)

    for stash <- stashes do
      assert %{"index" => index, "branch" => branch, "message" => message} = stash
      assert is_integer(index)
      assert is_binary(branch)
      assert is_binary(message)
    end
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/stashes")

    assert json_response(conn, 404)
  end
end
