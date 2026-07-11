defmodule GitBeholder.GitClone do
  @doc """
  Clones `url` into a new folder named after the repo, inside `destination`.

  Returns:
    * `{:ok, target_path}`
    * `{:error, reason}` — destination missing, target already exists, or
      the `git clone` itself failed (bad URL, network, auth, ...)
  """
  def clone(url, destination) do
    repo_name = repo_name_from_url(url)
    target_path = Path.join(destination, repo_name)

    cond do
      not File.dir?(destination) ->
        {:error, "Pasta de destino não existe: #{destination}"}

      File.exists?(target_path) ->
        {:error, "Já existe uma pasta em #{target_path}"}

      true ->
        run_clone(url, target_path)
    end
  end

  defp run_clone(url, target_path) do
    # GIT_TERMINAL_PROMPT=0 makes git fail fast instead of hanging the
    # request when a private repo would otherwise prompt for credentials.
    case System.cmd("git", ["clone", url, target_path],
           stderr_to_stdout: true,
           env: [{"GIT_TERMINAL_PROMPT", "0"}]
         ) do
      {_output, 0} -> {:ok, target_path}
      {error_output, _exit_code} -> {:error, error_output}
    end
  end

  defp repo_name_from_url(url) do
    url
    |> String.trim_trailing("/")
    |> String.split(~r/[\/:]/)
    |> List.last()
    |> String.trim_trailing(".git")
  end
end
