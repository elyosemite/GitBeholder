defmodule GitBeholderWeb.GitPushControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Repositories

  setup %{conn: conn} do
    remote_path =
      Path.join(System.tmp_dir!(), "git_push_ctrl_test_remote_#{System.unique_integer([:positive])}")

    repo_path =
      Path.join(System.tmp_dir!(), "git_push_ctrl_test_repo_#{System.unique_integer([:positive])}")

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

  test "GET .../push/status reports ahead/behind counts", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/push/status")

    assert %{"ahead" => 0, "behind" => 0} = json_response(conn, 200)
  end

  test "POST .../push pushes local commits", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    File.write!(Path.join(repository.path, "new.txt"), "content")
    System.cmd("git", ["add", "new.txt"], cd: repository.path)
    System.cmd("git", ["commit", "-q", "-m", "add new.txt"], cd: repository.path)

    conn = post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/push")

    assert %{"status" => "ok"} = json_response(conn, 200)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/push/status")

    assert json_response(conn, 404)
  end
end
