defmodule GitBeholder.GitPull do
  def pull(repo_path) do
    # GIT_TERMINAL_PROMPT=0 makes git fail fast instead of hanging the
    # request when it would otherwise prompt for credentials.
    case System.cmd("git", ["pull"],
           cd: repo_path,
           stderr_to_stdout: true,
           env: [{"GIT_TERMINAL_PROMPT", "0"}]
         ) do
      {output, 0} -> {:ok, output}
      {error_output, _exit_code} -> {:error, error_output}
    end
  end
end
