defmodule GitBeholderWeb.GitBranchControllerTest do
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

  test "GET .../branches returns local and remote branches with current/local/remote flags", %{
    conn: conn,
    workspace: workspace,
    repository: repository
  } do
    conn =
      get(
        conn,
        "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/branches"
      )

    branches = json_response(conn, 200)

    assert [%{"name" => _, "current" => _, "local" => _, "remote" => _} | _] = branches
    assert Enum.count(branches, & &1["current"]) == 1
  end

  test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
    conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/branches")

    assert json_response(conn, 404)
  end

  describe "POST /api/v1/workspaces/:workspace_id/repositories/:repository_id/branches/checkout" do
    setup %{conn: conn} do
      repo_path =
        Path.join(
          System.tmp_dir!(),
          "git_branch_ctrl_checkout_test_#{System.unique_integer([:positive])}"
        )

      File.mkdir_p!(repo_path)
      System.cmd("git", ["init", "-q", "-b", "main"], cd: repo_path)
      System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
      System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
      File.write!(Path.join(repo_path, "file.txt"), "hello\n")
      System.cmd("git", ["add", "file.txt"], cd: repo_path)
      System.cmd("git", ["commit", "-q", "-m", "initial"], cd: repo_path)
      System.cmd("git", ["checkout", "-q", "-b", "feature-local"], cd: repo_path)
      System.cmd("git", ["checkout", "-q", "main"], cd: repo_path)

      on_exit(fn -> File.rm_rf!(repo_path) end)

      {:ok, workspace} = Repositories.create_workspace(%{name: "Scratch"})

      {:ok, repository} =
        Repositories.create_repository(%{
          name: "scratch_repo",
          path: repo_path,
          workspace_id: workspace.id
        })

      %{conn: conn, workspace: workspace, repository: repository, repo_path: repo_path}
    end

    test "checks out the given branch", %{
      conn: conn,
      workspace: workspace,
      repository: repository,
      repo_path: repo_path
    } do
      conn =
        post(
          conn,
          "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/branches/checkout",
          %{"name" => "feature-local"}
        )

      assert %{"status" => "ok"} = json_response(conn, 200)

      {branch, 0} = System.cmd("git", ["rev-parse", "--abbrev-ref", "HEAD"], cd: repo_path)
      assert String.trim(branch) == "feature-local"
    end

    test "returns 400 for a branch that doesn't exist", %{
      conn: conn,
      workspace: workspace,
      repository: repository
    } do
      conn =
        post(
          conn,
          "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/branches/checkout",
          %{"name" => "no-such-branch"}
        )

      assert %{"status" => "error"} = json_response(conn, 400)
    end
  end
end
