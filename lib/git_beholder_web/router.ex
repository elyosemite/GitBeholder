defmodule GitBeholderWeb.Router do
  use GitBeholderWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :repository do
    plug GitBeholderWeb.Plugs.FetchRepository
  end

  scope "/api/v1", GitBeholderWeb do
    pipe_through :api

    get  "/workspaces", WorkspaceController, :index
    post "/workspaces", WorkspaceController, :create

    get  "/workspaces/:workspace_id/folders", FolderController, :index
    post "/workspaces/:workspace_id/folders", FolderController, :create

    get  "/workspaces/:workspace_id/repositories", RepositoryController, :index
    post "/workspaces/:workspace_id/repositories", RepositoryController, :create
    post "/workspaces/:workspace_id/repositories/open-local", RepositoryController, :open_local
    post "/workspaces/:workspace_id/repositories/clone", RepositoryController, :clone
  end

  scope "/api/v1/workspaces/:workspace_id/repositories/:repository_id", GitBeholderWeb do
    pipe_through [:api, :repository]

    get "/status", GitStatusController, :index
    post "/commit", GitCommitController, :create
    post "/stage", GitStagingController, :stage
    post "/unstage", GitStagingController, :unstage
    get "/commits", GitLogController, :index
    get "/commits/:hash/files", GitDiffController, :index
    get "/commits/:hash/diff", GitDiffController, :show
    get "/branches", GitBranchController, :index
    post "/branches/checkout", GitBranchController, :checkout
    get "/push/status", GitPushController, :status
    post "/push", GitPushController, :create
    post "/pull", GitPullController, :create
    get "/stashes", GitStashController, :index
    get "/tags", GitTagController, :index
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:git_beholder, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: GitBeholderWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
