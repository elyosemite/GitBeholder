ExUnit.start()
Application.ensure_all_started(:meck)

Ecto.Adapters.SQL.Sandbox.mode(GitBeholder.Repo, :manual)
