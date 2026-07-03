defmodule GitBeholder.GitLogTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitLog

  @test_root Path.expand("./test_repos_log", __DIR__)

  setup do
    File.rm_rf!(@test_root)
    repo = Path.join(@test_root, "repo")
    File.mkdir_p!(repo)

    System.cmd("git", ["init"], cd: repo, stderr_to_stdout: true)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo)
    System.cmd("git", ["config", "user.name", "TestAuthor"], cd: repo)

    on_exit(fn -> File.rm_rf!(@test_root) end)

    {:ok, repo: repo}
  end

  test "list_commits/2 returns error for non-git directory" do
    dir = Path.join(@test_root, "not_a_repo")
    File.mkdir_p!(dir)

    assert {:error, "Not a valid Git repository"} = GitLog.list_commits(dir)
  end

  test "list_commits/2 returns commits from a repo with history", %{repo: repo} do
    File.write!(Path.join(repo, "a.txt"), "a")
    System.cmd("git", ["add", "a.txt"], cd: repo)
    System.cmd("git", ["commit", "-m", "first commit"], cd: repo)

    File.write!(Path.join(repo, "b.txt"), "b")
    System.cmd("git", ["add", "b.txt"], cd: repo)
    System.cmd("git", ["commit", "-m", "second commit"], cd: repo)

    assert {:ok, commits} = GitLog.list_commits(repo)
    assert length(commits) == 2

    [latest, oldest] = commits
    assert latest.message == "second commit"
    assert oldest.message == "first commit"
    assert latest.author == "TestAuthor"
    assert is_binary(latest.hash) and byte_size(latest.hash) == 40
    assert is_binary(latest.date)
  end

  test "list_commits/2 respects the limit parameter", %{repo: repo} do
    for i <- 1..5 do
      File.write!(Path.join(repo, "file#{i}.txt"), "content #{i}")
      System.cmd("git", ["add", "."], cd: repo)
      System.cmd("git", ["commit", "-m", "commit #{i}"], cd: repo)
    end

    assert {:ok, commits} = GitLog.list_commits(repo, 3)
    assert length(commits) == 3
  end

  test "list_commits/2 uses default limit of 10", %{repo: repo} do
    for i <- 1..15 do
      File.write!(Path.join(repo, "file#{i}.txt"), "content #{i}")
      System.cmd("git", ["add", "."], cd: repo)
      System.cmd("git", ["commit", "-m", "commit #{i}"], cd: repo)
    end

    assert {:ok, commits} = GitLog.list_commits(repo)
    assert length(commits) == 10
  end
end
