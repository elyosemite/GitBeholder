defmodule GitBeholderWeb.FolderControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  alias GitBeholder.Repositories

  setup do
    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
    %{workspace: workspace}
  end

  describe "GET /api/v1/workspaces/:workspace_id/folders" do
    test "lists only folders belonging to the workspace", %{conn: conn, workspace: workspace} do
      {:ok, folder} = Repositories.create_folder(%{name: "Backend", workspace_id: workspace.id})
      {:ok, other_workspace} = Repositories.create_workspace(%{name: "Sales"})
      {:ok, _other} = Repositories.create_folder(%{name: "Pricing", workspace_id: other_workspace.id})

      conn = get(conn, "/api/v1/workspaces/#{workspace.id}/folders")

      assert %{"folders" => folders} = json_response(conn, 200)
      assert [%{"id" => id, "name" => "Backend"}] = folders
      assert id == folder.id
    end

    test "returns 400 for a non-numeric workspace id", %{conn: conn} do
      conn = get(conn, "/api/v1/workspaces/abc/folders")

      assert json_response(conn, 400)
    end
  end

  describe "POST /api/v1/workspaces/:workspace_id/folders" do
    test "creates a top-level folder", %{conn: conn, workspace: workspace} do
      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/folders", %{"name" => "Backend"})

      assert %{"id" => id, "name" => "Backend", "workspace_id" => workspace_id, "parent_folder_id" => nil} =
               json_response(conn, 201)

      assert is_integer(id)
      assert workspace_id == workspace.id
    end

    test "creates a nested folder", %{conn: conn, workspace: workspace} do
      {:ok, parent} = Repositories.create_folder(%{name: "Backend", workspace_id: workspace.id})

      conn =
        post(conn, "/api/v1/workspaces/#{workspace.id}/folders", %{
          "name" => "Payments",
          "parent_folder_id" => parent.id
        })

      assert %{"parent_folder_id" => parent_id} = json_response(conn, 201)
      assert parent_id == parent.id
    end

    test "returns 422 without a name", %{conn: conn, workspace: workspace} do
      conn = post(conn, "/api/v1/workspaces/#{workspace.id}/folders", %{})

      assert %{"errors" => %{"name" => ["can't be blank"]}} = json_response(conn, 422)
    end
  end
end
