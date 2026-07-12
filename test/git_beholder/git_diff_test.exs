defmodule GitBeholder.GitDiffTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitDiff

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_diff_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp commit(repo_path, message) do
    System.cmd("git", ["add", "-A"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", message], cd: repo_path)
    {hash, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: repo_path)
    String.trim(hash)
  end

  test "reports additions for a new file in the root commit", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\nline3\n")
    hash = commit(repo_path, "add file.txt")

    assert {:ok, [%{path: "file.txt", additions: 3, deletions: 0}]} =
             GitDiff.file_changes(repo_path, hash)
  end

  test "reports additions and deletions for a modified file", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\nline3\n")
    commit(repo_path, "add file.txt")

    File.write!(Path.join(repo_path, "file.txt"), "line1\nchanged\nline3\nline4\n")
    hash = commit(repo_path, "edit file.txt")

    assert {:ok, [%{path: "file.txt", additions: 2, deletions: 1}]} =
             GitDiff.file_changes(repo_path, hash)
  end

  test "lists multiple files changed in the same commit", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "a.txt"), "a\n")
    File.write!(Path.join(repo_path, "b.txt"), "b\n")
    hash = commit(repo_path, "add two files")

    assert {:ok, changes} = GitDiff.file_changes(repo_path, hash)
    paths = Enum.map(changes, & &1.path) |> Enum.sort()
    assert paths == ["a.txt", "b.txt"]
  end

  test "resolves a plain rename to its new path", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "old.txt"), "content\nmore content\nyet more\n")
    commit(repo_path, "add old.txt")

    System.cmd("git", ["mv", "old.txt", "new.txt"], cd: repo_path)
    hash = commit(repo_path, "rename old.txt to new.txt")

    assert {:ok, [%{path: "new.txt", additions: 0, deletions: 0}]} =
             GitDiff.file_changes(repo_path, hash)
  end

  test "resolves a common-prefix compacted rename to its new path", %{repo_path: repo_path} do
    File.mkdir_p!(Path.join(repo_path, "lib/foo"))
    File.write!(Path.join(repo_path, "lib/foo/bar.ex"), "content\nmore\nyet more\n")
    commit(repo_path, "add lib/foo/bar.ex")

    System.cmd("git", ["mv", "lib/foo/bar.ex", "lib/foo/baz.ex"], cd: repo_path)
    hash = commit(repo_path, "rename bar.ex to baz.ex")

    assert {:ok, [%{path: "lib/foo/baz.ex", additions: 0, deletions: 0}]} =
             GitDiff.file_changes(repo_path, hash)
  end

  test "returns an error for an unknown commit hash", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "file.txt"), "content\n")
    commit(repo_path, "initial")

    assert {:error, _reason} = GitDiff.file_changes(repo_path, "deadbeef")
  end

  describe "file_diff/3" do
    test "returns hunk + context/removed/added lines for a modified file", %{
      repo_path: repo_path
    } do
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\nline3\n")
      commit(repo_path, "add file.txt")

      File.write!(Path.join(repo_path, "file.txt"), "line1\nchanged\nline3\nline4\n")
      hash = commit(repo_path, "edit file.txt")

      assert {:ok, %{binary: false, lines: lines}} = GitDiff.file_diff(repo_path, hash, "file.txt")

      assert [
               %{type: "hunk"},
               %{type: "context", old_line: 1, new_line: 1, content: "line1"},
               %{type: "removed", old_line: 2, new_line: nil, content: "line2"},
               %{type: "added", old_line: nil, new_line: 2, content: "changed"},
               %{type: "context", old_line: 3, new_line: 3, content: "line3"},
               %{type: "added", old_line: nil, new_line: 4, content: "line4"}
             ] = lines
    end

    test "returns only added lines for a new file in the root commit", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\n")
      hash = commit(repo_path, "add file.txt")

      assert {:ok, %{binary: false, lines: lines}} = GitDiff.file_diff(repo_path, hash, "file.txt")

      assert [
               %{type: "hunk"},
               %{type: "added", new_line: 1, content: "line1"},
               %{type: "added", new_line: 2, content: "line2"}
             ] = lines
    end

    test "returns only removed lines for a deleted file", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\n")
      commit(repo_path, "add file.txt")

      File.rm!(Path.join(repo_path, "file.txt"))
      hash = commit(repo_path, "delete file.txt")

      assert {:ok, %{binary: false, lines: lines}} = GitDiff.file_diff(repo_path, hash, "file.txt")

      assert [
               %{type: "hunk"},
               %{type: "removed", old_line: 1, content: "line1"},
               %{type: "removed", old_line: 2, content: "line2"}
             ] = lines
    end

    test "reports binary files without trying to parse hunks", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.bin"), <<0, 1, 2, 3, 0, 4, 5>>)
      hash = commit(repo_path, "add binary file")

      assert {:ok, %{binary: true, lines: []}} = GitDiff.file_diff(repo_path, hash, "file.bin")
    end

    test "returns an error for an unknown commit hash", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.txt"), "content\n")
      commit(repo_path, "initial")

      assert {:error, _reason} = GitDiff.file_diff(repo_path, "deadbeef", "file.txt")
    end
  end
end
