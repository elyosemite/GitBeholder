defmodule GitBeholderWeb.GitCommitControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Repositories

  setup %{conn: conn} do
    repo_path =
      Path.join(System.tmp_dir!(), "git_beholder_commit_test_#{System.unique_integer([:positive])}")

    File.mkdir_p!(repo_path)
    {_, 0} = System.cmd("git", ["init"], cd: repo_path)
    {_, 0} = System.cmd("git", ["config", "user.email", "test@example.com"], cd: repo_path)
    {_, 0} = System.cmd("git", ["config", "user.name", "Test User"], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "hello")

    on_exit(fn -> File.rm_rf!(repo_path) end)

    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})

    {:ok, repository} =
      Repositories.create_repository(%{
        name: "scratch_repo",
        path: repo_path,
        workspace_id: workspace.id
      })

    %{conn: conn, workspace: workspace, repository: repository}
  end

  test "POST .../commit commits the given file", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      post(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commit",
        %{"file_path" => "file.txt", "message" => "Initial commit"}
      )

    assert %{"status" => "ok"} = json_response(conn, 200)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn =
      post(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/999999/commit",
        %{"file_path" => "file.txt"}
      )

    assert json_response(conn, 404)
  end
end
