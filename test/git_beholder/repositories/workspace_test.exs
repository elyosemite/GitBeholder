defmodule GitBeholder.Repositories.WorkspaceTest do
  use ExUnit.Case, async: true

  alias GitBeholder.Repositories.Workspace

  describe "changeset/2" do
    test "is valid with a name" do
      changeset = Workspace.changeset(%Workspace{}, %{name: "Engineering"})
      assert changeset.valid?
    end

    test "is invalid without a name" do
      changeset = Workspace.changeset(%Workspace{}, %{})
      refute changeset.valid?
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end

    test "is invalid with a blank name" do
      changeset = Workspace.changeset(%Workspace{}, %{name: ""})
      refute changeset.valid?
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end

    test "is invalid when the name is too long" do
      changeset = Workspace.changeset(%Workspace{}, %{name: String.duplicate("a", 256)})
      refute changeset.valid?
      assert %{name: ["should be at most 255 character(s)"]} = errors_on(changeset)
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
