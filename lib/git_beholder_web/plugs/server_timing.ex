defmodule GitBeholderWeb.Plugs.ServerTiming do
  @moduledoc """
  Adds a `Server-Timing: app;dur=<ms>` header with the time spent inside
  the backend for the request (routing, plugs, controller, git
  subprocesses, JSON encoding).

  The frontend subtracts it from the total time `fetch` waited to tell
  backend work apart from transport, parsing and rendering — see
  `app/src/lib/perf.ts`.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    started_at = System.monotonic_time()

    register_before_send(conn, fn conn ->
      elapsed = System.monotonic_time() - started_at
      ms = System.convert_time_unit(elapsed, :native, :microsecond) / 1000

      put_resp_header(conn, "server-timing", "app;dur=#{:erlang.float_to_binary(ms, decimals: 1)}")
    end)
  end
end
