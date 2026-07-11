defmodule GitBeholder.GitStashTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitStash

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_stash_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "original\n")
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "initial"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  test "returns an empty list when there are no stashes", %{repo_path: repo_path} do
    assert {:ok, []} = GitStash.list_stashes(repo_path)
  end

  test "parses a stash created without a message", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "file.txt"), "changed\n")
    System.cmd("git", ["stash"], cd: repo_path)

    assert {:ok, [%{index: 0, branch: branch, message: message}]} = GitStash.list_stashes(repo_path)
    assert branch in ["main", "master"]
    assert message =~ "initial"
  end

  test "parses a stash created with an explicit message", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "file.txt"), "changed\n")
    System.cmd("git", ["stash", "push", "-m", "WIP header spacing tweaks"], cd: repo_path)

    assert {:ok, [%{index: 0, branch: branch, message: "WIP header spacing tweaks"}]} =
             GitStash.list_stashes(repo_path)

    assert branch in ["main", "master"]
  end

  test "lists multiple stashes, most recent first", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "file.txt"), "first change\n")
    System.cmd("git", ["stash", "push", "-m", "first stash"], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "second change\n")
    System.cmd("git", ["stash", "push", "-m", "second stash"], cd: repo_path)

    assert {:ok,
            [
              %{index: 0, message: "second stash"},
              %{index: 1, message: "first stash"}
            ]} = GitStash.list_stashes(repo_path)
  end
end
