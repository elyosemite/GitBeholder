defmodule GitBeholder.Integrations.FinchClient do
  @moduledoc """
  Real `HTTPClient` implementation, backed by the `GitBeholder.Finch`
  pool already started in the application supervision tree.
  """

  @behaviour GitBeholder.Integrations.HTTPClient

  @impl true
  def request(method, url, headers, body) do
    method
    |> Finch.build(url, headers, body)
    |> Finch.request(GitBeholder.Finch)
    |> case do
      {:ok, %Finch.Response{status: status, body: body}} -> {:ok, %{status: status, body: body}}
      {:error, reason} -> {:error, reason}
    end
  end
end
