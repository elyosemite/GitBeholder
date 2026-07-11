defmodule GitBeholderWeb.GitPullControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Repositories

  setup %{conn: conn} do
    remote_path =
      Path.join(System.tmp_dir!(), "git_pull_ctrl_test_remote_#{System.unique_integer([:positive])}")

    repo_path =
      Path.join(System.tmp_dir!(), "git_pull_ctrl_test_repo_#{System.unique_integer([:positive])}")

    File.mkdir_p!(remote_path)
    {_, 0} = System.cmd("git", ["init", "-q", "--bare"], cd: remote_path)

    File.mkdir_p!(repo_path)
    {_, 0} = System.cmd("git", ["init", "-q"], cd: repo_path)
    {_, 0} = System.cmd("git", ["config", "user.email", "test@example.com"], cd: repo_path)
    {_, 0} = System.cmd("git", ["config", "user.name", "Test User"], cd: repo_path)
    {_, 0} = System.cmd("git", ["remote", "add", "origin", remote_path], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "hello")
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "initial"], cd: repo_path)
    System.cmd("git", ["push", "-q", "-u", "origin", "HEAD"], cd: repo_path)

    on_exit(fn ->
      File.rm_rf!(remote_path)
      File.rm_rf!(repo_path)
    end)

    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})

    {:ok, repository} =
      Repositories.create_repository(%{
        name: "scratch_repo",
        path: repo_path,
        workspace_id: workspace.id
      })

    %{conn: conn, workspace: workspace, repository: repository}
  end

  test "POST .../pull succeeds with nothing new", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn = post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/pull")

    assert %{"status" => "ok"} = json_response(conn, 200)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/pull")

    assert json_response(conn, 404)
  end
end
