defmodule GitBeholderWeb.RepositoryControllerTest do
  use GitBeholderWeb.ConnCase, async: true

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

      assert %{"repositories" => repositories} = json_response(conn, 200)
      assert [%{"id" => id, "name" => "payment_service"}] = repositories
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
end
