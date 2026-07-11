defmodule GitBeholder.GitBranchesTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitBranches

  setup do
    remote_path =
      Path.join(
        System.tmp_dir!(),
        "git_branches_test_remote_#{System.unique_integer([:positive])}"
      )

    repo_path =
      Path.join(System.tmp_dir!(), "git_branches_test_repo_#{System.unique_integer([:positive])}")

    File.mkdir_p!(remote_path)
    System.cmd("git", ["init", "-q", "--bare"], cd: remote_path)

    File.mkdir_p!(repo_path)
    System.cmd("git", ["init", "-q", "-b", "main"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
    System.cmd("git", ["remote", "add", "origin", remote_path], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "hello\n")
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "initial"], cd: repo_path)
    System.cmd("git", ["push", "-q", "-u", "origin", "main"], cd: repo_path)
    # The bare repo's own HEAD may still point at init.defaultBranch
    # (often "master"), which was never pushed — point it at "main" so
    # a plain clone of it checks out something.
    System.cmd("git", ["symbolic-ref", "HEAD", "refs/heads/main"], cd: remote_path)

    # local-only branch, never pushed
    System.cmd("git", ["branch", "feature-local"], cd: repo_path)

    # remote-only branch: pushed from elsewhere, never checked out here
    clone_path =
      Path.join(System.tmp_dir!(), "git_branches_test_clone_#{System.unique_integer([:positive])}")

    System.cmd("git", ["clone", "-q", remote_path, clone_path])
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: clone_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: clone_path)
    System.cmd("git", ["checkout", "-q", "-b", "feature-remote"], cd: clone_path)
    System.cmd("git", ["push", "-q", "-u", "origin", "feature-remote"], cd: clone_path)

    System.cmd("git", ["fetch", "-q"], cd: repo_path)

    on_exit(fn ->
      File.rm_rf!(remote_path)
      File.rm_rf!(repo_path)
      File.rm_rf!(clone_path)
    end)

    %{repo_path: repo_path}
  end

  test "classifies local, tracked, and remote-only branches", %{repo_path: repo_path} do
    assert {:ok, branches} = GitBranches.list_branches(repo_path)
    by_name = Map.new(branches, &{&1.name, &1})

    assert %{current: true, local: true, remote: "origin"} = by_name["main"]
    assert %{current: false, local: true, remote: nil} = by_name["feature-local"]
    assert %{current: false, local: false, remote: "origin"} = by_name["feature-remote"]
    refute Map.has_key?(by_name, "HEAD")
  end

  test "returns an error for a path that isn't a git repository" do
    assert {:error, _reason} = GitBranches.list_branches(System.tmp_dir!())
  end
end
