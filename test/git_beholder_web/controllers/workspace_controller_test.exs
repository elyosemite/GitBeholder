defmodule GitBeholderWeb.WorkspaceControllerTest do
  use GitBeholderWeb.ConnCase, async: true

  alias GitBeholder.Repositories

  describe "GET /api/v1/workspaces" do
    test "lists all workspaces", %{conn: conn} do
      {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})

      conn = get(conn, "/api/v1/workspaces")

      assert %{"workspaces" => workspaces} = json_response(conn, 200)
      assert %{"id" => workspace.id, "name" => "Engineering"} in workspaces
    end
  end

  describe "POST /api/v1/workspaces" do
    test "creates a workspace with a valid name", %{conn: conn} do
      conn = post(conn, "/api/v1/workspaces", %{"name" => "Engineering"})

      assert %{"id" => id, "name" => "Engineering"} = json_response(conn, 201)
      assert is_integer(id)
    end

    test "returns 422 without a name", %{conn: conn} do
      conn = post(conn, "/api/v1/workspaces", %{})

      assert %{"errors" => %{"name" => ["can't be blank"]}} = json_response(conn, 422)
    end
  end
end
