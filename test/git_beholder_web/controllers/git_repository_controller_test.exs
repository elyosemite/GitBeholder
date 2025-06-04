defmodule GitBeholder.PropertyLoaderMock do
  @behaviour GitBeholder.PropertyLoaderBehaviour

  def get_root_directory, do: Application.get_env(:git_beholder, :test_root_directory)
end

defmodule GitBeholderWeb.GitRepositoryControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  @test_root Path.expand("./test_repos", __DIR__)

  setup do
    File.rm_rf!(@test_root)
    File.mkdir_p!(@test_root)

    repo1 = Path.join(@test_root, "repo1")
    repo2 = Path.join(@test_root, "repo2")
    non_git = Path.join(@test_root, "not_a_repo")
    File.mkdir_p!(repo1)
    File.mkdir_p!(repo2)
    File.mkdir_p!(non_git)
    File.mkdir_p!(Path.join(repo1, ".git"))
    File.mkdir_p!(Path.join(repo2, ".git"))

    # Set environment variable to use PropertyLoaderMock in the test environment
    Application.put_env(:git_beholder, :test_root_directory, @test_root)
    Application.put_env(:git_beholder, :property_loader, GitBeholder.PropertyLoaderMock)

    on_exit(fn ->
      File.rm_rf!(@test_root)
      Application.delete_env(:git_beholder, :test_root_directory)
      Application.delete_env(:git_beholder, :property_loader)
    end)

    :ok
  end

  test "GET /repositories lists only git repositories", %{conn: conn} do
    conn = get(conn, "/api/git/repositories")
    assert json_response(conn, 200) == %{
             "status" => "ok",
             "repositories" => ["repo1", "repo2"]
           }
  end
end
