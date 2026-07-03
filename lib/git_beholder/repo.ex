defmodule GitBeholder.Repo do
  use Ecto.Repo,
    otp_app: :git_beholder,
    adapter: Ecto.Adapters.SQLite3
end
