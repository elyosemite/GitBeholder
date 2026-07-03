defmodule GitBeholderWeb.FolderControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  alias GitBeholder.Repositories

  setup do
    {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
    %{workspace: workspace}
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
