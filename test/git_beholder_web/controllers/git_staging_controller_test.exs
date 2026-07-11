defmodule GitBeholderWeb.GitStagingControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Repositories

  setup %{conn: conn} do
    repo_path =
      Path.join(System.tmp_dir!(), "git_beholder_staging_test_#{System.unique_integer([:positive])}")

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

  test "POST .../stage stages the given file", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      post(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/stage",
        %{"file_path" => "file.txt"}
      )

    assert %{"status" => "ok"} = json_response(conn, 200)
  end

  test "POST .../stage returns 400 for a pathspec that matches nothing", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      post(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/stage",
        %{"file_path" => "missing.txt"}
      )

    assert %{"status" => "error"} = json_response(conn, 400)
  end

  test "POST .../unstage unstages the given file", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    System.cmd("git", ["add", "file.txt"], cd: repository.path)

    conn =
      post(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/unstage",
        %{"file_path" => "file.txt"}
      )

    assert %{"status" => "ok"} = json_response(conn, 200)
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn =
      post(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/999999/stage",
        %{"file_path" => "file.txt"}
      )

    assert json_response(conn, 404)
  end
end
