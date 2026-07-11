defmodule GitBeholderWeb.GitLogControllerTest do
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

    {current_branch, 0} =
      System.cmd("git", ["rev-parse", "--abbrev-ref", "HEAD"], cd: File.cwd!())

    %{conn: conn, workspace: workspace, repository: repository, branch: String.trim(current_branch)}
  end

  test "GET .../commits returns recent commits for the given branch", %{
    conn: conn,
    workspace: workspace,
    repository: repository,
    branch: branch
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits?branch=#{branch}&limit=3"
      )

    assert [
             %{
               "hash" => _,
               "message" => _,
               "description" => _,
               "author" => _,
               "timestamp" => _,
               "refs" => refs
             }
             | _
           ] = json_response(conn, 200)

    assert is_list(refs)
  end

  test "returns 400 without a branch query param", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits")

    assert json_response(conn, 400)
  end

  test "returns 400 for an unknown branch", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits?branch=no-such-branch"
      )

    assert json_response(conn, 400)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn =
      get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/commits?branch=main")

    assert json_response(conn, 404)
  end
end
