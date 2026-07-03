defmodule GitBeholderWeb.GitCommitControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  @test_root Path.expand("./test_repos_commit_ctrl", __DIR__)

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

  test "POST /api/git/commit commits a file with a custom message", %{conn: conn, repo: repo} do
    File.write!(Path.join(repo, "file.txt"), "hello")

    conn =
      post(conn, "/api/git/commit", %{
        "repo_path" => repo,
        "file_path" => "file.txt",
        "message" => "test commit msg"
      })

    assert %{"status" => "ok", "message" => message} = json_response(conn, 200)
    assert message =~ "test commit msg"
  end

  test "POST /api/git/commit uses default message when none provided", %{conn: conn, repo: repo} do
    File.write!(Path.join(repo, "default.txt"), "content")

    conn =
      post(conn, "/api/git/commit", %{
        "repo_path" => repo,
        "file_path" => "default.txt"
      })

    assert %{"status" => "ok"} = json_response(conn, 200)
  end

  test "POST /api/git/commit returns error for nonexistent file", %{conn: conn, repo: repo} do
    conn =
      post(conn, "/api/git/commit", %{
        "repo_path" => repo,
        "file_path" => "nope.txt",
        "message" => "should fail"
      })

    assert %{"status" => "error", "message" => msg} = json_response(conn, 400)
    assert msg =~ "File does not exist"
  end
end
