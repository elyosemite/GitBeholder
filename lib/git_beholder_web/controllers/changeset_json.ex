defmodule GitBeholderWeb.ChangesetJSON do
  @doc """
  Traverses changeset errors into a plain map of field => messages.
  """
  def errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
