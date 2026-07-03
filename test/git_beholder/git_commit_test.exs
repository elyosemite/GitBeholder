defmodule GitBeholder.GitCommitTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitCommit

  @test_root Path.expand("./test_repos_commit", __DIR__)

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

  test "commit_file/3 returns error when file does not exist", %{repo: repo} do
    assert {:error, msg} = GitCommit.commit_file(repo, "nonexistent.txt")
    assert msg =~ "File does not exist"
  end

  test "commit_file/3 commits an existing file with default message", %{repo: repo} do
    file = "hello.txt"
    File.write!(Path.join(repo, file), "hello world")

    assert {:ok, output} = GitCommit.commit_file(repo, file)
    assert output =~ "Commit from BitBeholder API"
  end

  test "commit_file/3 commits an existing file with custom message", %{repo: repo} do
    file = "custom.txt"
    File.write!(Path.join(repo, file), "custom content")

    assert {:ok, output} = GitCommit.commit_file(repo, file, "my custom message")
    assert output =~ "my custom message"
  end

  test "commit_file/3 returns error when nothing to commit (file already committed)", %{repo: repo} do
    file = "already.txt"
    File.write!(Path.join(repo, file), "content")

    {:ok, _} = GitCommit.commit_file(repo, file)

    assert {:error, _output} = GitCommit.commit_file(repo, file, "second commit")
  end
end
