defmodule GitBeholderWeb.RepositoryControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Repositories

  setup do
    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
    %{workspace: workspace}
  end

  describe "GET /api/v1/workspaces/:workspace_id/repositories" do
    test "lists only repositories belonging to the workspace", %{conn: conn, workspace: workspace} do
      {:ok, repository} =
        Repositories.create_repository(%{
          name: "payment_service",
          path: "/repos/payment_service",
          workspace_id: workspace.id
        })

      {:ok, other_workspace} = Repositories.create_workspace(%{name: "Sales"})

      {:ok, _other} =
        Repositories.create_repository(%{
          name: "pricing_service",
          path: "/repos/pricing_service",
          workspace_id: other_workspace.id
        })

      conn = get(conn, "/api/v1/workspaces/#{workspace.id}/repositories")

      assert [%{"id" => id, "name" => "payment_service"}] = json_response(conn, 200)
      assert id == repository.id
    end

    test "returns 400 for a non-numeric workspace id", %{conn: conn} do
      conn = get(conn, "/api/v1/workspaces/abc/repositories")

      assert json_response(conn, 400)
    end
  end

  describe "POST /api/v1/workspaces/:workspace_id/repositories" do
    test "registers a repository at the workspace root", %{conn: conn, workspace: workspace} do
      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories", %{
          "name" => "payment_service",
          "path" => "/repos/payment_service"
        })

      assert %{
               "id" => id,
               "name" => "payment_service",
               "path" => "/repos/payment_service",
               "workspace_id" => workspace_id,
               "folder_id" => nil
             } = json_response(conn, 201)

      assert is_integer(id)
      assert workspace_id == workspace.id
    end

    test "registers a repository inside a folder", %{conn: conn, workspace: workspace} do
      {:ok, folder} = Repositories.create_folder(%{name: "Backend", workspace_id: workspace.id})

      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories", %{
          "name" => "payment_service",
          "path" => "/repos/payment_service",
          "folder_id" => folder.id
        })

      assert %{"folder_id" => folder_id} = json_response(conn, 201)
      assert folder_id == folder.id
    end

    test "returns 422 without a path", %{conn: conn, workspace: workspace} do
      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories", %{"name" => "x"})

      assert %{"errors" => %{"path" => ["can't be blank"]}} = json_response(conn, 422)
    end
  end

  describe "POST /api/v1/workspaces/:workspace_id/repositories/open-local" do
    test "registers a real Git repository, deriving its name", %{conn: conn, workspace: workspace} do
      project_root = File.cwd!()

      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/open-local", %{
          "path" => project_root
        })

      assert %{"name" => name, "path" => path, "workspace_id" => workspace_id} =
               json_response(conn, 201)

      assert name == Path.basename(project_root)
      assert path == project_root
      assert workspace_id == workspace.id
    end

    test "returns 422 for a folder that isn't a Git repository", %{conn: conn, workspace: workspace} do
      non_git_dir =
        Path.join(System.tmp_dir!(), "open_local_ctrl_test_#{System.unique_integer([:positive])}")

      File.mkdir_p!(non_git_dir)
      on_exit(fn -> File.rm_rf!(non_git_dir) end)

      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/open-local", %{
          "path" => non_git_dir
        })

      assert %{"errors" => %{"path" => [_reason]}} = json_response(conn, 422)
    end

    test "returns 400 for a non-numeric workspace id", %{conn: conn} do
      conn =
        post(conn, "/api/v1/workspaces/abc/repositories/open-local", %{"path" => File.cwd!()})

      assert json_response(conn, 400)
    end
  end

  describe "POST /api/v1/workspaces/:workspace_id/repositories/clone" do
    setup do
      remote_path =
        Path.join(
          System.tmp_dir!(),
          "clone_ctrl_test_remote_#{System.unique_integer([:positive])}.git"
        )

      destination =
        Path.join(System.tmp_dir!(), "clone_ctrl_test_dest_#{System.unique_integer([:positive])}")

      File.mkdir_p!(remote_path)
      System.cmd("git", ["init", "-q", "--bare"], cd: remote_path)
      File.mkdir_p!(destination)

      on_exit(fn ->
        File.rm_rf!(remote_path)
        File.rm_rf!(destination)
      end)

      %{remote_path: remote_path, destination: destination}
    end

    test "clones and registers the repository", %{
      conn: conn,
      workspace: workspace,
      remote_path: remote_path,
      destination: destination
    } do
      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/clone", %{
          "url" => remote_path,
          "destination" => destination
        })

      assert %{"name" => name, "path" => path, "workspace_id" => workspace_id} =
               json_response(conn, 201)

      assert name == Path.basename(remote_path, ".git")
      assert path == Path.join(destination, name)
      assert workspace_id == workspace.id
    end

    test "returns 422 when the destination doesn't exist", %{
      conn: conn,
      workspace: workspace,
      remote_path: remote_path
    } do
      missing =
        Path.join(System.tmp_dir!(), "clone_ctrl_test_missing_#{System.unique_integer([:positive])}")

      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/clone", %{
          "url" => remote_path,
          "destination" => missing
        })

      assert %{"errors" => %{"url" => [_reason]}} = json_response(conn, 422)
    end

    test "returns 400 for a non-numeric workspace id", %{conn: conn, remote_path: remote_path, destination: destination} do
      conn =
        post(conn, "/api/v1/workspaces/abc/repositories/clone", %{
          "url" => remote_path,
          "destination" => destination
        })

      assert json_response(conn, 400)
    end
  end

  describe "GET /api/v1/repositories/recent" do
    test "lists recently opened repositories first", %{conn: conn, workspace: workspace} do
      {:ok, older} =
        Repositories.create_repository(%{name: "older", path: "/repos/older", workspace_id: workspace.id})

      {:ok, newer} =
        Repositories.create_repository(%{name: "newer", path: "/repos/newer", workspace_id: workspace.id})

      {:ok, _} = Repositories.mark_opened(older, ~U[2026-10-01 10:00:00.000000Z])
      {:ok, _} = Repositories.mark_opened(newer, ~U[2026-10-01 11:00:00.000000Z])

      conn = get(conn, "/api/v1/repositories/recent")

      assert [%{"name" => "newer", "last_opened_at" => opened_at}, %{"name" => "older"}] =
               json_response(conn, 200)

      assert is_binary(opened_at)
    end

    test "honors limit", %{conn: conn, workspace: workspace} do
      for n <- 1..3 do
        Repositories.create_repository(%{name: "r#{n}", path: "/repos/r#{n}", workspace_id: workspace.id})
      end

      conn = get(conn, "/api/v1/repositories/recent?limit=2")

      assert length(json_response(conn, 200)) == 2
    end
  end

  describe "POST /api/v1/workspaces/:workspace_id/repositories/:repository_id/opened" do
    test "marks a valid repository as opened", %{conn: conn, workspace: workspace} do
      {:ok, repository} =
        Repositories.create_repository(%{name: "git_beholder", path: File.cwd!(), workspace_id: workspace.id})

      conn = post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/#{repository.id}/opened")

      assert %{"id" => id, "last_opened_at" => opened_at} = json_response(conn, 200)
      assert id == repository.id
      assert is_binary(opened_at)
    end

    test "returns 404 for an unknown repository", %{conn: conn, workspace: workspace} do
      conn = post(conn, "/api/v1/workspaces/#{workspace.id}/repositories/999999/opened")

      assert json_response(conn, 404)
    end
  end
end
