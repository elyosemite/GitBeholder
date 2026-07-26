defmodule GitBeholderWeb.CommitActivityControllerTest do
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

  test "GET .../commit-activity returns daily buckets for the given range", %{
    conn: conn,
    workspace: workspace,
    repository: repository,
    branch: branch
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit-activity" <>
          "?branch=#{branch}&start_date=2000-01-01&end_date=2036-01-01"
      )

    assert %{"buckets" => buckets, "truncated" => truncated} = json_response(conn, 200)
    assert is_list(buckets)
    assert is_boolean(truncated)

    assert [
             %{
               "date" => _,
               "commit_count" => _,
               "file_count" => _,
               "lines_changed" => _,
               "authors" => authors,
               "branches" => branches
             }
             | _
           ] = buckets

    assert is_list(authors)
    assert is_list(branches)
  end

  test "returns 400 without required query params", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit-activity")

    assert json_response(conn, 400)
  end

  test "returns 400 for an invalid date format", %{
    conn: conn,
    workspace: workspace,
    repository: repository,
    branch: branch
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit-activity" <>
          "?branch=#{branch}&start_date=not-a-date&end_date=2036-01-01"
      )

    assert json_response(conn, 400)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/999999/commit-activity" <>
          "?branch=main&start_date=2000-01-01&end_date=2036-01-01"
      )

    assert json_response(conn, 404)
  end
end
