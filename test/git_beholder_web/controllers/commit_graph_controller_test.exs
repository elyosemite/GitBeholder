defmodule GitBeholderWeb.CommitGraphControllerTest do
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

  test "GET .../commit-graph returns nodes/edges/truncated for the given range", %{
    conn: conn,
    workspace: workspace,
    repository: repository,
    branch: branch
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit-graph" <>
          "?branch=#{branch}&start_date=2000-01-01&end_date=2036-01-01"
      )

    assert %{"nodes" => nodes, "edges" => edges, "truncated" => truncated} = json_response(conn, 200)
    assert is_list(nodes)
    assert is_list(edges)
    assert is_boolean(truncated)

    assert Enum.any?(nodes, &(&1["type"] == "commit"))
    assert Enum.any?(nodes, &(&1["type"] == "file"))
  end

  test "returns 400 without required query params", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit-graph")

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
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit-graph" <>
          "?branch=#{branch}&start_date=not-a-date&end_date=2036-01-01"
      )

    assert json_response(conn, 400)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/999999/commit-graph" <>
          "?branch=main&start_date=2000-01-01&end_date=2036-01-01"
      )

    assert json_response(conn, 404)
  end
end
