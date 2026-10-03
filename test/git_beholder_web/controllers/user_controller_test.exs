defmodule GitBeholderWeb.UserControllerTest do
  use GitBeholderWeb.ConnCase, async: false

  alias GitBeholder.Accounts

  describe "GET /api/v1/teams" do
    test "lists teams, including the default one", %{conn: conn} do
      conn = get(conn, "/api/v1/teams")

      assert %{"teams" => teams} = json_response(conn, 200)
      assert Enum.any?(teams, &(&1["name"] == "default"))
    end
  end

  describe "POST /api/v1/teams" do
    test "creates a team", %{conn: conn} do
      conn = post(conn, "/api/v1/teams", %{"name" => "Platform"})

      assert %{"id" => id, "name" => "Platform"} = json_response(conn, 201)
      assert is_integer(id)
    end

    test "returns 422 for a duplicate name", %{conn: conn} do
      conn = post(conn, "/api/v1/teams", %{"name" => "default"})

      assert %{"errors" => %{"name" => ["has already been taken"]}} = json_response(conn, 422)
    end
  end

  describe "POST /api/v1/users" do
    test "creates a user in the default team when no team is given", %{conn: conn} do
      conn = post(conn, "/api/v1/users", %{"name" => "Grace", "email" => "grace@example.com"})

      assert %{"name" => "Grace", "email" => "grace@example.com", "team" => %{"name" => "default"}} =
               json_response(conn, 201)
    end

    test "returns 422 for an invalid email", %{conn: conn} do
      conn = post(conn, "/api/v1/users", %{"name" => "Grace", "email" => "nope"})

      assert %{"errors" => %{"email" => ["must be a valid email"]}} = json_response(conn, 422)
    end
  end

  describe "GET and PATCH /api/v1/users/:id" do
    test "shows and updates a user", %{conn: conn} do
      {:ok, user} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})

      assert %{"id" => id, "name" => "Grace"} = conn |> get("/api/v1/users/#{user.id}") |> json_response(200)
      assert id == user.id

      conn = patch(conn, "/api/v1/users/#{user.id}", %{"name" => "Grace Hopper"})
      assert %{"name" => "Grace Hopper"} = json_response(conn, 200)
    end

    test "returns 404 for an unknown user", %{conn: conn} do
      conn = get(conn, "/api/v1/users/999999")

      assert %{"error" => "User not found"} = json_response(conn, 404)
    end
  end

  describe "GET /api/v1/users" do
    test "lists users", %{conn: conn} do
      {:ok, _} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})

      conn = get(conn, "/api/v1/users")

      assert %{"users" => [%{"name" => "Grace"}]} = json_response(conn, 200)
    end
  end

  describe "/api/v1/me" do
    test "GET creates the local user on first access, in the default team", %{conn: conn} do
      conn = get(conn, "/api/v1/me")

      assert %{"is_local" => true, "team" => %{"name" => "default"}, "email" => email} =
               json_response(conn, 200)

      assert is_binary(email)
    end

    test "GET returns the same local user every time", %{conn: conn} do
      %{"id" => first} = conn |> get("/api/v1/me") |> json_response(200)
      %{"id" => second} = conn |> get("/api/v1/me") |> json_response(200)

      assert first == second
    end

    test "PATCH updates name, email and photo", %{conn: conn} do
      conn =
        patch(conn, "/api/v1/me", %{
          "name" => "Ada Lovelace",
          "email" => "ada@example.com",
          "avatar_url" => "data:image/png;base64,iVBORw0KGgo="
        })

      assert %{
               "name" => "Ada Lovelace",
               "email" => "ada@example.com",
               "avatar_url" => "data:image/png;base64,iVBORw0KGgo="
             } = json_response(conn, 200)
    end

    test "PATCH returns 422 for an invalid email", %{conn: conn} do
      conn = patch(conn, "/api/v1/me", %{"email" => "nope"})

      assert %{"errors" => %{"email" => ["must be a valid email"]}} = json_response(conn, 422)
    end
  end
end
