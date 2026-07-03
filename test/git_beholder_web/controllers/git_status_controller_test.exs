defmodule GitBeholderWeb.GitStatusControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  @test_root Path.expand("./test_repos_status_ctrl", __DIR__)

  setup do
    File.rm_rf!(@test_root)
    repo = Path.join(@test_root, "repo")
    File.mkdir_p!(repo)

    System.cmd("git", ["init"], cd: repo, stderr_to_stdout: true)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo)

    on_exit(fn -> File.rm_rf!(@test_root) end)

    {:ok, repo: repo}
  end

  test "GET /api/git/status returns status for valid repo", %{conn: conn, repo: repo} do
    conn = get(conn, "/api/git/status", %{"path" => repo})

    assert %{"status" => "ok", "output" => output} = json_response(conn, 200)
    assert output =~ "On branch"
  end

  test "GET /api/git/status shows untracked files", %{conn: conn, repo: repo} do
    File.write!(Path.join(repo, "new_file.txt"), "content")

    conn = get(conn, "/api/git/status", %{"path" => repo})

    assert %{"status" => "ok", "output" => output} = json_response(conn, 200)
    assert output =~ "new_file.txt"
  end
end
