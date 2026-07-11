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
end
