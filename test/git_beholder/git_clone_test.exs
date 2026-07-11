defmodule GitBeholder.GitCloneTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitClone

  setup do
    remote_path =
      Path.join(
        System.tmp_dir!(),
        "git_clone_test_remote_#{System.unique_integer([:positive])}.git"
      )

    seed_path =
      Path.join(System.tmp_dir!(), "git_clone_test_seed_#{System.unique_integer([:positive])}")

    destination =
      Path.join(System.tmp_dir!(), "git_clone_test_dest_#{System.unique_integer([:positive])}")

    File.mkdir_p!(remote_path)
    System.cmd("git", ["init", "-q", "--bare"], cd: remote_path)

    File.mkdir_p!(seed_path)
    System.cmd("git", ["init", "-q"], cd: seed_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: seed_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: seed_path)
    File.write!(Path.join(seed_path, "file.txt"), "hello\n")
    System.cmd("git", ["add", "file.txt"], cd: seed_path)
    System.cmd("git", ["commit", "-q", "-m", "initial"], cd: seed_path)
    System.cmd("git", ["remote", "add", "origin", remote_path], cd: seed_path)
    System.cmd("git", ["push", "-q", "origin", "HEAD:refs/heads/main"], cd: seed_path)
    # The bare repo's own HEAD may still point at whatever
    # init.defaultBranch was (often "master"), which was never pushed —
    # point it at the branch we actually pushed so clone checks it out.
    System.cmd("git", ["symbolic-ref", "HEAD", "refs/heads/main"], cd: remote_path)

    File.mkdir_p!(destination)

    on_exit(fn ->
      File.rm_rf!(remote_path)
      File.rm_rf!(seed_path)
      File.rm_rf!(destination)
    end)

    %{remote_path: remote_path, destination: destination}
  end

  test "clones into a new folder named after the repo", %{
    remote_path: remote_path,
    destination: destination
  } do
    assert {:ok, target_path} = GitClone.clone(remote_path, destination)

    expected_name = Path.basename(remote_path, ".git")
    assert target_path == Path.join(destination, expected_name)
    assert File.dir?(Path.join(target_path, ".git"))
    assert File.exists?(Path.join(target_path, "file.txt"))
  end

  test "returns an error when the destination folder doesn't exist", %{remote_path: remote_path} do
    missing =
      Path.join(System.tmp_dir!(), "git_clone_test_missing_#{System.unique_integer([:positive])}")

    assert {:error, _reason} = GitClone.clone(remote_path, missing)
  end

  test "returns an error when the target folder already exists", %{
    remote_path: remote_path,
    destination: destination
  } do
    expected_name = Path.basename(remote_path, ".git")
    File.mkdir_p!(Path.join(destination, expected_name))

    assert {:error, _reason} = GitClone.clone(remote_path, destination)
  end

  test "returns an error for a URL that doesn't resolve to a repo", %{destination: destination} do
    assert {:error, _reason} = GitClone.clone("/nonexistent/remote/for/sure.git", destination)
  end
end
