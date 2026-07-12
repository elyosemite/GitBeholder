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

  describe "GET .../commits/:hash/diff" do
    setup %{conn: conn} do
      repo_path =
        Path.join(System.tmp_dir!(), "git_diff_ctrl_test_#{System.unique_integer([:positive])}")

      File.mkdir_p!(repo_path)
      System.cmd("git", ["init", "-q"], cd: repo_path)
      System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
      System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\n")
      System.cmd("git", ["add", "-A"], cd: repo_path)
      System.cmd("git", ["commit", "-q", "-m", "add file.txt"], cd: repo_path)
      {hash, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: repo_path)

      on_exit(fn -> File.rm_rf!(repo_path) end)

      {:ok, workspace} = Repositories.create_workspace(%{name: "Scratch"})

      {:ok, repository} =
        Repositories.create_repository(%{
          name: "scratch_repo",
          path: repo_path,
          workspace_id: workspace.id
        })

      %{conn: conn, workspace: workspace, repository: repository, hash: String.trim(hash)}
    end

    test "returns the raw patch for a single file", %{
      conn: conn,
      workspace: workspace,
      repository: repository,
      hash: hash
    } do
      conn =
        get(
          conn,
          "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits/#{hash}/diff?path=file.txt"
        )

      assert %{"binary" => false, "patch" => patch} = json_response(conn, 200)
      assert patch =~ "diff --git a/file.txt b/file.txt"
      assert patch =~ "+line1"
      assert patch =~ "+line2"
    end

    test "returns 400 for an unknown commit hash", %{
      conn: conn,
      workspace: workspace,
      repository: repository
    } do
      conn =
        get(
          conn,
          "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/commits/deadbeef/diff?path=file.txt"
        )

      assert json_response(conn, 400)
    end
  end
end
