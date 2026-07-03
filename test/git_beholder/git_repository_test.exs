defmodule GitBeholder.GitRepositoryTest do
  use ExUnit.Case, async: false

  alias GitBeholder.GitRepository

  @test_root Path.expand("./test_repos_gitrepo", __DIR__)

  setup do
    File.rm_rf!(@test_root)
    File.mkdir_p!(@test_root)

    repo1 = Path.join(@test_root, "alpha")
    repo2 = Path.join(@test_root, "beta")
    non_git = Path.join(@test_root, "plain_dir")

    File.mkdir_p!(repo1)
    File.mkdir_p!(repo2)
    File.mkdir_p!(non_git)
    File.mkdir_p!(Path.join(repo1, ".git"))
    File.mkdir_p!(Path.join(repo2, ".git"))

    Application.put_env(:git_beholder, :test_root_directory, @test_root)
    Application.put_env(:git_beholder, :property_loader, GitBeholder.PropertyLoaderMock)

    on_exit(fn ->
      File.rm_rf!(@test_root)
      Application.delete_env(:git_beholder, :test_root_directory)
      Application.delete_env(:git_beholder, :property_loader)
    end)

    :ok
  end

  test "root_path/0 returns only directories containing .git" do
    assert {:ok, repos, _root} = GitRepository.root_path()
    assert Enum.sort(repos) == ["alpha", "beta"]
  end

  test "root_path/0 returns the root directory" do
    assert {:ok, _repos, root_dir} = GitRepository.root_path()
    assert root_dir == @test_root
  end

  test "root_path/0 returns error for non-existent root directory" do
    Application.put_env(:git_beholder, :test_root_directory, "/tmp/nonexistent_dir_#{:rand.uniform(999999)}")

    assert {:error, msg} = GitRepository.root_path()
    assert msg =~ "File system error"
  end
end
