defmodule GitBeholder.Integrations.HTTPClient do
  @moduledoc """
  Thin HTTP client behaviour so provider modules (like `AzureDevOps`)
  can be tested with `Mox` instead of hitting the network or mocking
  Finch internals directly.
  """

  @type method :: :get | :post | :patch | :delete
  @type headers :: [{String.t(), String.t()}]
  @type response :: %{status: non_neg_integer(), body: binary()}

  @callback request(method, url :: String.t(), headers, body :: binary()) ::
              {:ok, response} | {:error, term()}
end
