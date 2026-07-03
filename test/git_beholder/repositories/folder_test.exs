defmodule GitBeholder.Repositories.FolderTest do
  use ExUnit.Case, async: true

  import Ecto.Changeset, only: [get_change: 2]

  alias GitBeholder.Repositories.Folder

  describe "changeset/2" do
    test "is valid with a name and workspace_id" do
      changeset = Folder.changeset(%Folder{}, %{name: "Backend", workspace_id: 1})
      assert changeset.valid?
    end

    test "is valid nested under a parent folder" do
      changeset =
        Folder.changeset(%Folder{}, %{name: "Payments", workspace_id: 1, parent_folder_id: 5})

      assert changeset.valid?
      assert get_change(changeset, :parent_folder_id) == 5
    end

    test "is invalid without a name" do
      changeset = Folder.changeset(%Folder{}, %{workspace_id: 1})
      refute changeset.valid?
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end

    test "is invalid without a workspace_id" do
      changeset = Folder.changeset(%Folder{}, %{name: "Backend"})
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
