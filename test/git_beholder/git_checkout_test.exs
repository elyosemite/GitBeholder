defmodule GitBeholder.GitCheckoutTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitCheckout

  defp current_branch(repo_path) do
    {branch, 0} = System.cmd("git", ["rev-parse", "--abbrev-ref", "HEAD"], cd: repo_path)
    String.trim(branch)
  end

  setup do
    remote_path =
      Path.join(
        System.tmp_dir!(),
        "git_checkout_test_remote_#{System.unique_integer([:positive])}"
      )

    repo_path =
      Path.join(System.tmp_dir!(), "git_checkout_test_repo_#{System.unique_integer([:positive])}")

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
    System.cmd("git", ["symbolic-ref", "HEAD", "refs/heads/main"], cd: remote_path)

    System.cmd("git", ["checkout", "-q", "-b", "feature-local"], cd: repo_path)
    System.cmd("git", ["checkout", "-q", "main"], cd: repo_path)

    on_exit(fn ->
      File.rm_rf!(remote_path)
      File.rm_rf!(repo_path)
    end)

    %{repo_path: repo_path, remote_path: remote_path}
  end

  test "checks out an existing local branch", %{repo_path: repo_path} do
    assert current_branch(repo_path) == "main"

    assert {:ok, _output} = GitCheckout.checkout(repo_path, "feature-local")

    assert current_branch(repo_path) == "feature-local"
  end

  test "creates and checks out a local tracking branch for a remote-only branch", %{
    repo_path: repo_path,
    remote_path: remote_path
  } do
    clone_path =
      Path.join(System.tmp_dir!(), "git_checkout_test_clone_#{System.unique_integer([:positive])}")

    System.cmd("git", ["clone", "-q", remote_path, clone_path])
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: clone_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: clone_path)
    System.cmd("git", ["checkout", "-q", "-b", "feature-remote"], cd: clone_path)
    System.cmd("git", ["push", "-q", "-u", "origin", "feature-remote"], cd: clone_path)
    on_exit(fn -> File.rm_rf!(clone_path) end)

    System.cmd("git", ["fetch", "-q"], cd: repo_path)

    assert {:ok, _output} = GitCheckout.checkout(repo_path, "feature-remote")

    assert current_branch(repo_path) == "feature-remote"
  end

  test "returns an error when uncommitted changes conflict with the checkout", %{
    repo_path: repo_path
  } do
    File.write!(Path.join(repo_path, "file.txt"), "conflicting local edit\n")
    System.cmd("git", ["checkout", "-q", "-b", "other-branch"], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "other branch content\n")
    System.cmd("git", ["commit", "-q", "-am", "diverge file.txt"], cd: repo_path)
    System.cmd("git", ["checkout", "-q", "main"], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "conflicting local edit\n")

    assert {:error, _reason} = GitCheckout.checkout(repo_path, "other-branch")
  end

  test "returns an error for a ref that doesn't exist", %{repo_path: repo_path} do
    assert {:error, _reason} = GitCheckout.checkout(repo_path, "no-such-branch")
  end
end
