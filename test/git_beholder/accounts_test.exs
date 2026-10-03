defmodule GitBeholder.AccountsTest do
  use GitBeholder.DataCase, async: false

  alias GitBeholder.Accounts

  @identity %{name: "Ada Lovelace", email: "ada@example.com"}

  describe "default_team!/0" do
    test "returns the default team seeded by the migration" do
      assert Accounts.default_team!().name == "default"
    end
  end

  describe "create_team/1" do
    test "creates a team with a valid name" do
      assert {:ok, team} = Accounts.create_team(%{name: "Platform"})
      assert team.name == "Platform"
    end

    test "rejects a duplicate name" do
      assert {:error, changeset} = Accounts.create_team(%{name: "default"})
      assert %{name: ["has already been taken"]} = errors_on(changeset)
    end

    test "requires a name" do
      assert {:error, changeset} = Accounts.create_team(%{})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "create_user/1" do
    test "puts a user without a team in the default team" do
      assert {:ok, user} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})
      assert user.team.name == "default"
    end

    test "puts the user in the given team, with string-keyed params" do
      {:ok, team} = Accounts.create_team(%{name: "Platform"})

      assert {:ok, user} =
               Accounts.create_user(%{
                 "name" => "Grace",
                 "email" => "grace@example.com",
                 "team_id" => team.id
               })

      assert user.team.id == team.id
    end

    test "rejects an invalid or duplicate email" do
      assert {:error, changeset} = Accounts.create_user(%{name: "Grace", email: "not-an-email"})
      assert %{email: ["must be a valid email"]} = errors_on(changeset)

      {:ok, _} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})
      assert {:error, changeset} = Accounts.create_user(%{name: "Other", email: "grace@example.com"})
      assert %{email: ["has already been taken"]} = errors_on(changeset)
    end

    test "accepts an image data URL or http(s) avatar, rejects anything else" do
      assert {:ok, _} =
               Accounts.create_user(%{
                 name: "A",
                 email: "a@example.com",
                 avatar_url: "data:image/png;base64,iVBORw0KGgo="
               })

      assert {:ok, _} =
               Accounts.create_user(%{
                 name: "B",
                 email: "b@example.com",
                 avatar_url: "https://avatars.example.com/b.png"
               })

      assert {:error, changeset} =
               Accounts.create_user(%{name: "C", email: "c@example.com", avatar_url: "javascript:alert(1)"})

      assert %{avatar_url: [_]} = errors_on(changeset)
    end
  end

  describe "update_user/2" do
    test "updates name, email and avatar" do
      {:ok, user} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})

      assert {:ok, updated} =
               Accounts.update_user(user, %{
                 name: "Grace Hopper",
                 email: "hopper@example.com",
                 avatar_url: "data:image/jpeg;base64,/9j/"
               })

      assert updated.name == "Grace Hopper"
      assert updated.email == "hopper@example.com"
      assert updated.avatar_url == "data:image/jpeg;base64,/9j/"
    end

    test "moves the user to another team" do
      {:ok, user} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})
      {:ok, team} = Accounts.create_team(%{name: "Platform"})

      assert {:ok, updated} = Accounts.update_user(user, %{team_id: team.id})
      assert updated.team.name == "Platform"
    end
  end

  describe "list_users/0" do
    test "returns users with their team" do
      {:ok, _} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})

      assert [%{name: "Grace", team: %{name: "default"}}] = Accounts.list_users()
    end
  end

  describe "local_user/1" do
    test "creates the local user from the identity on first call, in the default team" do
      assert {:ok, user} = Accounts.local_user(fn -> @identity end)
      assert user.is_local
      assert user.name == "Ada Lovelace"
      assert user.email == "ada@example.com"
      assert user.team.name == "default"
    end

    test "returns the same user afterwards, ignoring the identity" do
      {:ok, first} = Accounts.local_user(fn -> @identity end)

      assert {:ok, again} =
               Accounts.local_user(fn -> flunk("identity should not be read again") end)

      assert again.id == first.id
    end

    test "other users are not the local user" do
      {:ok, _} = Accounts.create_user(%{name: "Grace", email: "grace@example.com"})

      assert {:ok, local} = Accounts.local_user(fn -> @identity end)
      assert local.email == "ada@example.com"
    end
  end
end
