defmodule GitBeholder.Integrations.AzureDevOpsTest do
  use ExUnit.Case, async: true

  import Mox

  alias GitBeholder.Integrations.AzureDevOps
  alias GitBeholder.Integrations.HTTPClientMock

  setup :verify_on_exit!

  @connection %{
    config: %{"org_url" => "https://dev.azure.com/acme", "project" => "Widgets"},
    credentials: "valid-pat"
  }

  describe "list_types/1" do
    test "returns {:ok, types} for a valid PAT" do
      expect(HTTPClientMock, :request, fn :get, url, headers, "" ->
        assert url ==
                 "https://dev.azure.com/acme/Widgets/_apis/wit/workitemtypes?api-version=7.1"

        assert {"authorization", "Basic " <> _encoded} =
                 List.keyfind(headers, "authorization", 0)

        body =
          Jason.encode!(%{
            "count" => 2,
            "value" => [%{"name" => "Bug"}, %{"name" => "User Story"}]
          })

        {:ok, %{status: 200, body: body}}
      end)

      assert {:ok, [%{"name" => "Bug"}, %{"name" => "User Story"}]} =
               AzureDevOps.list_types(@connection)
    end

    test "returns {:error, :invalid_token} for an invalid/expired PAT" do
      expect(HTTPClientMock, :request, fn :get, _url, _headers, "" ->
        {:ok, %{status: 401, body: ""}}
      end)

      assert {:error, :invalid_token} = AzureDevOps.list_types(@connection)
    end

    test "returns {:error, :invalid_token} for Azure DevOps's 203 sign-in redirect quirk" do
      expect(HTTPClientMock, :request, fn :get, _url, _headers, "" ->
        {:ok, %{status: 203, body: "<html>sign in</html>"}}
      end)

      assert {:error, :invalid_token} = AzureDevOps.list_types(@connection)
    end

    test "returns {:error, :connection_failed} for an unreachable org URL" do
      expect(HTTPClientMock, :request, fn :get, _url, _headers, "" ->
        {:error, :timeout}
      end)

      assert {:error, :connection_failed} = AzureDevOps.list_types(@connection)
    end
  end
end
