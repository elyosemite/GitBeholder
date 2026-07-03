defmodule GitBeholderWeb.GitLogControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  @test_root Path.expand("./test_repos_log_ctrl", __DIR__)

  setup do
    File.rm_rf!(@test_root)
    repo = Path.join(@test_root, "repo")
    File.mkdir_p!(repo)

    System.cmd("git", ["init"], cd: repo, stderr_to_stdout: true)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo)
    System.cmd("git", ["config", "user.name", "TestAuthor"], cd: repo)

    File.write!(Path.join(repo, "a.txt"), "a")
    System.cmd("git", ["add", "a.txt"], cd: repo)
    System.cmd("git", ["commit", "-m", "initial commit"], cd: repo)

    File.write!(Path.join(repo, "b.txt"), "b")
    System.cmd("git", ["add", "b.txt"], cd: repo)
    System.cmd("git", ["commit", "-m", "second commit"], cd: repo)

    on_exit(fn -> File.rm_rf!(@test_root) end)

    {:ok, repo: repo}
  end

  test "GET /api/git/log returns commit history", %{conn: conn, repo: repo} do
    conn = get(conn, "/api/git/log", %{"repo_path" => repo})

    commits = json_response(conn, 200)
    assert is_list(commits)
    assert length(commits) == 2

    first = List.first(commits)
    assert Map.has_key?(first, "hash")
    assert Map.has_key?(first, "author")
    assert Map.has_key?(first, "date")
    assert Map.has_key?(first, "message")
    assert first["message"] == "second commit"
  end

  test "GET /api/git/log respects limit parameter", %{conn: conn, repo: repo} do
    conn = get(conn, "/api/git/log", %{"repo_path" => repo, "limit" => "1"})

    commits = json_response(conn, 200)
    assert length(commits) == 1
  end

  test "GET /api/git/log returns error for invalid repo path", %{conn: conn} do
    conn = get(conn, "/api/git/log", %{"repo_path" => "/tmp/nonexistent_repo_#{:rand.uniform(999999)}"})

    assert %{"error" => _reason} = json_response(conn, 400)
  end
end
