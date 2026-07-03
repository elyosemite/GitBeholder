defmodule GitBeholder.Repositories.RepositoryTest do
  use ExUnit.Case, async: true

  alias GitBeholder.Repositories.Repository

  describe "changeset/2" do
    test "is valid with name, path and workspace_id" do
      changeset =
        Repository.changeset(%Repository{}, %{
          name: "payment_service",
          path: "/repos/payment_service",
          workspace_id: 1
        })

      assert changeset.valid?
    end

    test "is valid when placed inside a folder" do
      changeset =
        Repository.changeset(%Repository{}, %{
          name: "payment_service",
          path: "/repos/payment_service",
          workspace_id: 1,
          folder_id: 3
        })

      assert changeset.valid?
    end

    test "is invalid without a name" do
      changeset = Repository.changeset(%Repository{}, %{path: "/repos/x", workspace_id: 1})
      refute changeset.valid?
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end

    test "is invalid without a path" do
      changeset = Repository.changeset(%Repository{}, %{name: "x", workspace_id: 1})
      refute changeset.valid?
      assert %{path: ["can't be blank"]} = errors_on(changeset)
    end

    test "is invalid without a workspace_id" do
      changeset = Repository.changeset(%Repository{}, %{name: "x", path: "/repos/x"})
      refute changeset.valid?
      assert %{workspace_id: ["can't be blank"]} = errors_on(changeset)
    end
  end

  defp errors_on(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
