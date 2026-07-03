defmodule GitBeholder.GitStatusTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitStatus

  @test_root Path.expand("./test_repos_status", __DIR__)

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

  test "git_status/1 returns ok with status output for a valid repo", %{repo: repo} do
    assert {:ok, output} = GitStatus.git_status(repo)
    assert is_binary(output)
    assert output =~ "On branch"
  end

  test "git_status/1 shows untracked files", %{repo: repo} do
    File.write!(Path.join(repo, "untracked.txt"), "content")

    assert {:ok, output} = GitStatus.git_status(repo)
    assert output =~ "untracked.txt"
  end

  test "git_status/1 returns error for non-git directory" do
    dir = Path.join(System.tmp_dir!(), "git_status_test_not_a_repo_#{:rand.uniform(999999)}")
    File.mkdir_p!(dir)

    on_exit(fn -> File.rm_rf!(dir) end)

    assert {:error, output} = GitStatus.git_status(dir)
    assert output =~ "not a git repository"
  end
end
