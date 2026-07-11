defmodule GitBeholder.GitPullTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitPull

  setup do
    remote_path =
      Path.join(System.tmp_dir!(), "git_pull_test_remote_#{System.unique_integer([:positive])}")

    repo_path =
      Path.join(System.tmp_dir!(), "git_pull_test_repo_#{System.unique_integer([:positive])}")

    File.mkdir_p!(remote_path)
    System.cmd("git", ["init", "-q", "--bare"], cd: remote_path)

    File.mkdir_p!(repo_path)
    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
    System.cmd("git", ["remote", "add", "origin", remote_path], cd: repo_path)

    File.write!(Path.join(repo_path, "file.txt"), "hello\n")
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "initial"], cd: repo_path)
    System.cmd("git", ["push", "-q", "-u", "origin", "HEAD"], cd: repo_path)

    on_exit(fn ->
      File.rm_rf!(remote_path)
      File.rm_rf!(repo_path)
    end)

    %{repo_path: repo_path, remote_path: remote_path}
  end

  test "succeeds with nothing new to pull", %{repo_path: repo_path} do
    assert {:ok, _output} = GitPull.pull(repo_path)
  end

  test "brings in commits pushed from elsewhere", %{
    repo_path: repo_path,
    remote_path: remote_path
  } do
    clone_path =
      Path.join(System.tmp_dir!(), "git_pull_test_clone_#{System.unique_integer([:positive])}")

    System.cmd("git", ["clone", "-q", remote_path, clone_path])
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: clone_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: clone_path)
    File.write!(Path.join(clone_path, "new.txt"), "content\n")
    System.cmd("git", ["add", "new.txt"], cd: clone_path)
    System.cmd("git", ["commit", "-q", "-m", "add new.txt"], cd: clone_path)
    System.cmd("git", ["push", "-q"], cd: clone_path)
    on_exit(fn -> File.rm_rf!(clone_path) end)

    refute File.exists?(Path.join(repo_path, "new.txt"))

    assert {:ok, _output} = GitPull.pull(repo_path)

    assert File.exists?(Path.join(repo_path, "new.txt"))
  end

  test "returns an error when there's no remote configured" do
    repo_path =
      Path.join(System.tmp_dir!(), "git_pull_test_no_remote_#{System.unique_integer([:positive])}")

    File.mkdir_p!(repo_path)
    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
    File.write!(Path.join(repo_path, "f.txt"), "x")
    System.cmd("git", ["add", "f.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "c"], cd: repo_path)
    on_exit(fn -> File.rm_rf!(repo_path) end)

    assert {:error, _reason} = GitPull.pull(repo_path)
  end
end
