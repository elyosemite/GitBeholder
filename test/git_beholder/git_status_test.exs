defmodule GitBeholder.GitStatusTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitStatus

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_status_test_#{System.unique_integer([:positive])}")
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

  test "returns :error for a path that isn't a git repository" do
    assert {:error, _reason} = GitStatus.list_changes(System.tmp_dir!())
  end

  test "reports staged, unstaged, staged+unstaged, and untracked files", %{repo_path: repo_path} do
    commit_file(repo_path, "tracked.txt", "original\n")

    # staged-only modification
    File.write!(Path.join(repo_path, "tracked.txt"), "staged change\n")
    System.cmd("git", ["add", "tracked.txt"], cd: repo_path)

    # staged-only new file
    File.write!(Path.join(repo_path, "new.txt"), "brand new\n")
    System.cmd("git", ["add", "new.txt"], cd: repo_path)

    # untracked file
    File.write!(Path.join(repo_path, "scratch.txt"), "not tracked\n")

    assert {:ok, changes} = GitStatus.list_changes(repo_path)

    by_path = Map.new(changes, fn change -> {change.path, change} end)

    assert by_path["tracked.txt"] == %{path: "tracked.txt", status: "M", staged: true}
    assert by_path["new.txt"] == %{path: "new.txt", status: "A", staged: true}
    assert by_path["scratch.txt"] == %{path: "scratch.txt", status: "U", staged: false}
  end

  test "reports both a staged and an unstaged entry for the same path", %{repo_path: repo_path} do
    commit_file(repo_path, "both.txt", "original\n")

    File.write!(Path.join(repo_path, "both.txt"), "staged edit\n")
    System.cmd("git", ["add", "both.txt"], cd: repo_path)
    File.write!(Path.join(repo_path, "both.txt"), "unstaged edit on top\n")

    assert {:ok, changes} = GitStatus.list_changes(repo_path)
    both = Enum.filter(changes, &(&1.path == "both.txt"))

    assert Enum.sort(both) ==
             Enum.sort([
               %{path: "both.txt", status: "M", staged: true},
               %{path: "both.txt", status: "M", staged: false}
             ])
  end

  test "resolves a rename to its new path", %{repo_path: repo_path} do
    commit_file(repo_path, "old.txt", "content\n")
    System.cmd("git", ["mv", "old.txt", "renamed.txt"], cd: repo_path)

    assert {:ok, changes} = GitStatus.list_changes(repo_path)

    assert [%{path: "renamed.txt", status: "M", staged: true}] = changes
  end
end
