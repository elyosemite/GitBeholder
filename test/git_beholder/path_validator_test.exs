defmodule GitBeholder.PathValidatorTest do
  use ExUnit.Case, async: false

  alias GitBeholder.PathValidator

  setup do
    tmp_dir = System.tmp_dir!()
    root = Path.join(tmp_dir, "test_repos_#{:erlang.unique_integer([:positive])}")
    repo = Path.join(root, "my_repo")
    File.mkdir_p!(repo)

    prev_loader = Application.get_env(:git_beholder, :property_loader)

    Application.put_env(:git_beholder, :property_loader, GitBeholder.PathValidatorTest.MockLoader)
    Process.put(:test_root, root)

    on_exit(fn ->
      File.rm_rf!(root)

      if prev_loader do
        Application.put_env(:git_beholder, :property_loader, prev_loader)
      else
        Application.delete_env(:git_beholder, :property_loader)
      end
    end)

    %{root: root, repo: repo}
  end

  describe "validate_repo_path/1" do
    test "accepts paths within root directory", %{repo: repo} do
      assert {:ok, ^repo} = PathValidator.validate_repo_path(repo)
    end

    test "rejects paths outside root directory", %{root: _root} do
      assert {:error, "Path is outside the allowed repository root"} =
               PathValidator.validate_repo_path("/etc")
    end

    test "rejects path traversal attempts", %{root: root} do
      traversal = Path.join(root, "../../../etc")

      assert {:error, _} = PathValidator.validate_repo_path(traversal)
    end

    test "rejects non-existent paths", %{root: root} do
      non_existent = Path.join(root, "does_not_exist")

      assert {:error, "Path does not exist or is not a directory"} =
               PathValidator.validate_repo_path(non_existent)
    end

    test "rejects non-string input" do
      assert {:error, "Path must be a string"} = PathValidator.validate_repo_path(123)
    end
  end

  describe "validate_file_path/2" do
    test "accepts relative paths within repo", %{repo: repo} do
      assert {:ok, "src/main.ex"} = PathValidator.validate_file_path(repo, "src/main.ex")
    end

    test "accepts nested relative paths", %{repo: repo} do
      assert {:ok, "lib/module/file.ex"} = PathValidator.validate_file_path(repo, "lib/module/file.ex")
    end

    test "rejects traversal out of repo", %{repo: repo} do
      assert {:error, "File path escapes the repository directory"} =
               PathValidator.validate_file_path(repo, "../../etc/passwd")
    end

    test "rejects absolute paths", %{repo: repo} do
      assert {:error, "File path escapes the repository directory"} =
               PathValidator.validate_file_path(repo, "/etc/passwd")
    end

    test "rejects hidden traversal via ..", %{repo: repo} do
      assert {:error, "File path escapes the repository directory"} =
               PathValidator.validate_file_path(repo, "subdir/../../../etc/shadow")
    end
  end

  defmodule MockLoader do
    def get_root_directory do
      Process.get(:test_root) || "./repos"
    end
  end
end
