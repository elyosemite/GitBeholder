defmodule GitBeholder.GitCheckout do
  @doc """
  Checks out `name`. If no local branch by that name exists but exactly
  one remote has it (e.g. "feature-x" only as "origin/feature-x"), git's
  own DWIM behavior creates a local tracking branch and checks it out.

  Returns:
    * `{:ok, output}`
    * `{:error, reason}` — bad ref, ambiguous across remotes, or
      uncommitted changes that would be overwritten by the checkout
  """
  def checkout(repo_path, name) do
    case System.cmd("git", ["checkout", name], cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {error_output, _exit_code} -> {:error, error_output}
    end
  end
end
