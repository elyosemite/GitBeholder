defmodule GitBeholder.GitLogTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitLog

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_log_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp commit(repo_path, message) do
    File.write!(Path.join(repo_path, "file.txt"), message)
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", message], cd: repo_path)
  end

  test "returns :error for a path that isn't a git repository" do
    assert {:error, _reason} = GitLog.list_commits(System.tmp_dir!(), "main")
  end

  test "lists commits on the given branch, newest first, with empty refs", %{
    repo_path: repo_path
  } do
    commit(repo_path, "first")
    commit(repo_path, "second")
    commit(repo_path, "third")

    assert {:ok, commits} = GitLog.list_commits(repo_path, "master")

    assert [
             %{message: "third", refs: []},
             %{message: "second", refs: []},
             %{message: "first", refs: []}
           ] = commits

    for commit <- commits do
      assert %{hash: hash, author: "Test", timestamp: timestamp} = commit
      assert String.match?(hash, ~r/^[0-9a-f]+$/)
      assert String.match?(timestamp, ~r/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    end
  end

  test "respects the limit", %{repo_path: repo_path} do
    commit(repo_path, "first")
    commit(repo_path, "second")
    commit(repo_path, "third")

    assert {:ok, [%{message: "third"}]} = GitLog.list_commits(repo_path, "master", 1)
  end

  test "reads a different branch than the one currently checked out", %{repo_path: repo_path} do
    commit(repo_path, "on master")
    System.cmd("git", ["checkout", "-q", "-b", "feature"], cd: repo_path)
    commit(repo_path, "on feature")
    System.cmd("git", ["checkout", "-q", "master"], cd: repo_path)

    assert {:ok, [%{message: "on feature"}, %{message: "on master"}]} =
             GitLog.list_commits(repo_path, "feature")

    assert {:ok, [%{message: "on master"}]} = GitLog.list_commits(repo_path, "master")
  end

  test "returns :error for an unknown branch", %{repo_path: repo_path} do
    commit(repo_path, "first")

    assert {:error, _reason} = GitLog.list_commits(repo_path, "no-such-branch")
  end
end
