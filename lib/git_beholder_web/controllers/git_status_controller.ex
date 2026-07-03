defmodule GitBeholderWeb.GitStatusController do
  use GitBeholderWeb, :controller
  import GitBeholderWeb.ControllerHelpers

  alias GitBeholder.GitStatus

  def status(conn, %{"path" => path}) do
    respond_with_result(conn, GitStatus.git_status(path))
  end
end
