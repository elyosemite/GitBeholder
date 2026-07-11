defmodule GitBeholderWeb.CORSTest do
  use GitBeholderWeb.ConnCase, async: false

  test "answers a preflight OPTIONS request for a POST-only route" do
    conn =
      Plug.Test.conn(:options, "/api/v1/workspaces/1/repositories/1/stage")
      |> Plug.Conn.put_req_header("origin", "http://localhost:1420")
      |> Plug.Conn.put_req_header("access-control-request-method", "POST")
      |> Plug.Conn.put_req_header("access-control-request-headers", "content-type")
      |> GitBeholderWeb.Endpoint.call(GitBeholderWeb.Endpoint.init([]))

    assert conn.status == 204
    assert get_resp_header(conn, "access-control-allow-origin") == ["http://localhost:1420"]
  end
end
