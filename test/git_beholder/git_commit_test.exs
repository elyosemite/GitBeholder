defmodule GitBeholder.GitCommitTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitCommit

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_commit_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  test "commits whatever is staged", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "new.txt"), "brand new\n")
    System.cmd("git", ["add", "new.txt"], cd: repo_path)

    assert {:ok, _} = GitCommit.commit(repo_path, "add new.txt")

    {log, 0} = System.cmd("git", ["log", "-1", "--pretty=%s"], cd: repo_path)
    assert String.trim(log) == "add new.txt"
  end

  test "returns an error when nothing is staged", %{repo_path: repo_path} do
    assert {:error, _reason} = GitCommit.commit(repo_path, "empty commit attempt")
  end
end
