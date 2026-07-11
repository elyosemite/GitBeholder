defmodule GitBeholderWeb.GitDiffControllerTest do
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

    {hash, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: File.cwd!())

    %{conn: conn, workspace: workspace, repository: repository, hash: String.trim(hash)}
  end

  test "GET .../commits/:hash/files returns the changed files", %{
    conn: conn,
    workspace: workspace,
    repository: repository,
    hash: hash
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits/#{hash}/files"
      )

    changes = json_response(conn, 200)
    assert is_list(changes)
    assert length(changes) > 0

    for change <- changes do
      assert %{"path" => path} = change
      assert is_binary(path)
      assert Map.has_key?(change, "additions")
      assert Map.has_key?(change, "deletions")
    end
  end

  test "returns 400 for an unknown commit hash", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits/deadbeef/files"
      )

    assert json_response(conn, 400)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace, hash: hash} do
    conn =
      get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/commits/#{hash}/files")

    assert json_response(conn, 404)
  end
end
