defmodule GitBeholderWeb.Plugs.ServerTimingTest do
  use GitBeholderWeb.ConnCase, async: true

  test "adds the backend duration as a Server-Timing header", %{conn: conn} do
    conn = get(conn, "/api/v1/workspaces")

    assert [header] = get_resp_header(conn, "server-timing")
    assert header =~ ~r/^app;dur=\d+\.\d$/
  end

  test "exposes Server-Timing to the webview origin", %{conn: conn} do
    conn =
      conn
      |> put_req_header("origin", "http://localhost:1420")
      |> get("/api/v1/workspaces")

    assert [exposed] = get_resp_header(conn, "access-control-expose-headers")
    assert exposed =~ "server-timing"
  end
end
