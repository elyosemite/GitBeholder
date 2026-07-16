ExUnit.start()
Application.ensure_all_started(:meck)

Mox.defmock(GitBeholder.Integrations.HTTPClientMock, for: GitBeholder.Integrations.HTTPClient)

Ecto.Adapters.SQL.Sandbox.mode(GitBeholder.Repo, :manual)
