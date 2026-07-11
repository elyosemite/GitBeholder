defmodule GitBeholder.GitStagingTest do
  use ExUnit.Case, async: true

  alias GitBeholder.{GitStaging, GitStatus}

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_staging_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp commit_file(repo_path, name, content) do
    File.write!(Path.join(repo_path, name), content)
    System.cmd("git", ["add", name], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "add #{name}"], cd: repo_path)
  end

  defp status_by_path(repo_path) do
    {:ok, changes} = GitStatus.list_changes(repo_path)
    Map.new(changes, fn change -> {change.path, change} end)
  end

  test "stage adds an untracked file to the index", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "new.txt"), "brand new\n")

    assert {:ok, _} = GitStaging.stage(repo_path, "new.txt")

    assert %{path: "new.txt", status: "A", staged: true} = status_by_path(repo_path)["new.txt"]
  end

  test "stage adds a modified tracked file to the index", %{repo_path: repo_path} do
    commit_file(repo_path, "tracked.txt", "original\n")
    File.write!(Path.join(repo_path, "tracked.txt"), "changed\n")

    assert {:ok, _} = GitStaging.stage(repo_path, "tracked.txt")

    assert %{path: "tracked.txt", status: "M", staged: true} = status_by_path(repo_path)["tracked.txt"]
  end

  test "unstage removes a new file from the index without deleting it", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "new.txt"), "brand new\n")
    System.cmd("git", ["add", "new.txt"], cd: repo_path)

    assert {:ok, _} = GitStaging.unstage(repo_path, "new.txt")

    assert %{path: "new.txt", status: "U", staged: false} = status_by_path(repo_path)["new.txt"]
    assert File.exists?(Path.join(repo_path, "new.txt"))
  end

  test "unstage keeps a tracked file's edits as unstaged", %{repo_path: repo_path} do
    commit_file(repo_path, "tracked.txt", "original\n")
    File.write!(Path.join(repo_path, "tracked.txt"), "changed\n")
    System.cmd("git", ["add", "tracked.txt"], cd: repo_path)

    assert {:ok, _} = GitStaging.unstage(repo_path, "tracked.txt")

    assert %{path: "tracked.txt", status: "M", staged: false} = status_by_path(repo_path)["tracked.txt"]
  end

  test "stage returns an error for a pathspec that matches nothing", %{repo_path: repo_path} do
    assert {:error, _reason} = GitStaging.stage(repo_path, "does_not_exist.txt")
  end
end
