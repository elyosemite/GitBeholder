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
    test "returns the raw patch for a modified file", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\nline3\n")
      commit(repo_path, "add file.txt")

      File.write!(Path.join(repo_path, "file.txt"), "line1\nchanged\nline3\nline4\n")
      hash = commit(repo_path, "edit file.txt")

      assert {:ok, %{binary: false, patch: patch}} = GitDiff.file_diff(repo_path, hash, "file.txt")

      assert patch =~ "diff --git a/file.txt b/file.txt"
      assert patch =~ "-line2"
      assert patch =~ "+changed"
      assert patch =~ "+line4"
    end

    test "returns a patch with only additions for a new file in the root commit", %{
      repo_path: repo_path
    } do
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\n")
      hash = commit(repo_path, "add file.txt")

      assert {:ok, %{binary: false, patch: patch}} = GitDiff.file_diff(repo_path, hash, "file.txt")

      assert patch =~ "+line1"
      assert patch =~ "+line2"
      refute patch =~ "\n-line"
    end

    test "returns a patch with only deletions for a deleted file", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.txt"), "line1\nline2\n")
      commit(repo_path, "add file.txt")

      File.rm!(Path.join(repo_path, "file.txt"))
      hash = commit(repo_path, "delete file.txt")

      assert {:ok, %{binary: false, patch: patch}} = GitDiff.file_diff(repo_path, hash, "file.txt")

      assert patch =~ "-line1"
      assert patch =~ "-line2"
      refute patch =~ "\n+line"
    end

    test "reports binary files without a patch body", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.bin"), <<0, 1, 2, 3, 0, 4, 5>>)
      hash = commit(repo_path, "add binary file")

      assert {:ok, %{binary: true, patch: nil}} = GitDiff.file_diff(repo_path, hash, "file.bin")
    end

    test "returns an error for an unknown commit hash", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "file.txt"), "content\n")
      commit(repo_path, "initial")

      assert {:error, _reason} = GitDiff.file_diff(repo_path, "deadbeef", "file.txt")
    end

    test "returns the first-parent patch for a file unchanged by the merge itself", %{
      repo_path: repo_path
    } do
      File.write!(Path.join(repo_path, "file.txt"), "base\n")
      commit(repo_path, "base")

      System.cmd("git", ["checkout", "-q", "-b", "feature"], cd: repo_path)
      File.write!(Path.join(repo_path, "file.txt"), "feature change\n")
      commit(repo_path, "feature change")

      System.cmd("git", ["checkout", "-q", "-"], cd: repo_path)
      commit(repo_path, "unrelated commit on main")

      System.cmd("git", ["checkout", "-q", "feature"], cd: repo_path)
      System.cmd("git", ["merge", "-q", "--no-ff", "-m", "merge", "-"], cd: repo_path)

      {hash_output, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: repo_path)
      merge_hash = String.trim(hash_output)

      # file.txt equals the feature-branch parent exactly (no conflict), so
      # git's default merge-diff simplification shows nothing for it — this
      # is the case that used to produce an empty patch.
      assert {:ok, %{binary: false, patch: patch}} =
               GitDiff.file_diff(repo_path, merge_hash, "file.txt")

      assert patch =~ "diff --git a/file.txt b/file.txt"
      assert patch =~ "-base"
      assert patch =~ "+feature change"
    end
  end

  describe "file status" do
    test "reports added, modified, deleted and renamed files", %{repo_path: repo_path} do
      File.write!(Path.join(repo_path, "keep.txt"), "v1\n")
      File.write!(Path.join(repo_path, "gone.txt"), "bye\n")
      File.write!(Path.join(repo_path, "old_name.txt"), "a\nb\nc\nd\ne\n")
      commit(repo_path, "base")

      File.write!(Path.join(repo_path, "keep.txt"), "v2\n")
      File.rm!(Path.join(repo_path, "gone.txt"))
      File.write!(Path.join(repo_path, "fresh.txt"), "hi\n")
      System.cmd("git", ["mv", "old_name.txt", "new_name.txt"], cd: repo_path)
      hash = commit(repo_path, "mixed changes")

      assert {:ok, changes} = GitDiff.file_changes(repo_path, hash)
      status = Map.new(changes, &{&1.path, &1.status})

      assert status == %{
               "keep.txt" => "M",
               "gone.txt" => "D",
               "fresh.txt" => "A",
               "new_name.txt" => "R"
             }
    end

    test "rejects a non-hex hash before calling git", %{repo_path: repo_path} do
      assert {:error, :invalid_hash} = GitDiff.file_changes(repo_path, "--output=/tmp/pwned")
      assert {:error, :invalid_hash} = GitDiff.file_diff(repo_path, "--output=/tmp/pwned", "a.txt")
    end
  end

  describe "file_diff/4 context lines" do
    setup %{repo_path: repo_path} do
      lines = Enum.map_join(1..40, "", &"line #{&1}\n")
      File.write!(Path.join(repo_path, "big.txt"), lines)
      commit(repo_path, "add big.txt")

      File.write!(Path.join(repo_path, "big.txt"), String.replace(lines, "line 20\n", "changed 20\n"))
      %{hash: commit(repo_path, "change line 20")}
    end

    # Body lines only ("\n line N"): git also echoes the line before a hunk
    # in its "@@ … @@ line 16" header.
    test "defaults to git's 3 lines around the change", %{repo_path: repo_path, hash: hash} do
      assert {:ok, %{patch: patch}} = GitDiff.file_diff(repo_path, hash, "big.txt")

      assert patch =~ "\n line 17\n"
      refute patch =~ "\n line 16\n"
    end

    test "shows exactly `context` lines on each side", %{repo_path: repo_path, hash: hash} do
      assert {:ok, %{patch: one}} = GitDiff.file_diff(repo_path, hash, "big.txt", 1)
      assert one =~ "\n line 19\n"
      refute one =~ "\n line 18\n"

      assert {:ok, %{patch: twelve}} = GitDiff.file_diff(repo_path, hash, "big.txt", 12)
      assert twelve =~ "\n line 8\n"
      refute twelve =~ "\n line 7\n"
    end
  end
end
