defmodule GitBeholder.GitPushTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitPush

  setup do
    remote_path =
      Path.join(System.tmp_dir!(), "git_push_test_remote_#{System.unique_integer([:positive])}")

    repo_path =
      Path.join(System.tmp_dir!(), "git_push_test_repo_#{System.unique_integer([:positive])}")

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

  defp commit_file(repo_path, name, content) do
    File.write!(Path.join(repo_path, name), content)
    System.cmd("git", ["add", name], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "add #{name}"], cd: repo_path)
  end

  test "reports zero ahead/behind right after pushing", %{repo_path: repo_path} do
    assert {:ok, %{ahead: 0, behind: 0}} = GitPush.status(repo_path)
  end

  test "reports ahead count for unpushed local commits", %{repo_path: repo_path} do
    commit_file(repo_path, "new.txt", "content\n")

    assert {:ok, %{ahead: 1, behind: 0}} = GitPush.status(repo_path)
  end

  test "reports behind count for commits only on the remote", %{
    repo_path: repo_path,
    remote_path: remote_path
  } do
    clone_path =
      Path.join(System.tmp_dir!(), "git_push_test_clone_#{System.unique_integer([:positive])}")

    System.cmd("git", ["clone", "-q", remote_path, clone_path])
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: clone_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: clone_path)
    commit_file(clone_path, "remote_only.txt", "content\n")
    System.cmd("git", ["push", "-q"], cd: clone_path)
    on_exit(fn -> File.rm_rf!(clone_path) end)

    System.cmd("git", ["fetch", "-q"], cd: repo_path)

    assert {:ok, %{ahead: 0, behind: 1}} = GitPush.status(repo_path)
  end

  test "reports zero ahead/behind when there's no upstream" do
    repo_path =
      Path.join(System.tmp_dir!(), "git_push_test_no_upstream_#{System.unique_integer([:positive])}")

    File.mkdir_p!(repo_path)
    System.cmd("git", ["init", "-q"], cd: repo_path)
    on_exit(fn -> File.rm_rf!(repo_path) end)

    assert {:ok, %{ahead: 0, behind: 0}} = GitPush.status(repo_path)
  end

  test "push sends local commits to the remote", %{repo_path: repo_path, remote_path: remote_path} do
    commit_file(repo_path, "new.txt", "content\n")

    assert {:ok, _output} = GitPush.push(repo_path)
    assert {:ok, %{ahead: 0, behind: 0}} = GitPush.status(repo_path)

    {log, 0} = System.cmd("git", ["log", "-1", "--pretty=%s"], cd: remote_path)
    assert String.trim(log) == "add new.txt"
  end

  test "push returns an error when there's no remote configured" do
    repo_path =
      Path.join(System.tmp_dir!(), "git_push_test_no_remote_#{System.unique_integer([:positive])}")

    File.mkdir_p!(repo_path)
    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
    File.write!(Path.join(repo_path, "f.txt"), "x")
    System.cmd("git", ["add", "f.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "c"], cd: repo_path)
    on_exit(fn -> File.rm_rf!(repo_path) end)

    assert {:error, _reason} = GitPush.push(repo_path)
  end
end
