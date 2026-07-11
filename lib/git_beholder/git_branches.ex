defmodule GitBeholder.GitBranches do
  def list_branches(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      with {:ok, local} <- local_refs(repo_path),
           {:ok, remote} <- remote_refs(repo_path) do
        {:ok, merge(local, remote)}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end

  defp local_refs(repo_path) do
    args = ["for-each-ref", "--format=%(HEAD)|%(refname:short)", "refs/heads"]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} ->
        refs =
          output
          |> String.trim()
          |> String.split("\n", trim: true)
          |> Enum.map(fn line ->
            [head, name] = String.split(line, "|", parts: 2)
            {name, head == "*"}
          end)

        {:ok, refs}

      {error_msg, _exit_code} ->
        {:error, error_msg}
    end
  end

  defp remote_refs(repo_path) do
    args = ["for-each-ref", "--format=%(refname:short)", "refs/remotes"]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} ->
        refs =
          output
          |> String.trim()
          |> String.split("\n", trim: true)
          |> Enum.flat_map(&parse_remote_ref/1)

        {:ok, refs}

      {error_msg, _exit_code} ->
        {:error, error_msg}
    end
  end

  # "origin/main" -> {"origin", "main"}; the symbolic "origin/HEAD" ref
  # doesn't name an actual branch, so it's dropped.
  defp parse_remote_ref(short_ref) do
    case String.split(short_ref, "/", parts: 2) do
      [_remote, "HEAD"] -> []
      [remote, name] -> [{remote, name}]
      _ -> []
    end
  end

  defp merge(local, remote) do
    local_by_name = Map.new(local)
    remote_by_name = Map.new(Enum.group_by(remote, fn {_remote, name} -> name end, fn {remote, _name} -> remote end))

    names =
      (Map.keys(local_by_name) ++ Map.keys(remote_by_name))
      |> Enum.uniq()

    names
    |> Enum.map(fn name ->
      %{
        name: name,
        current: Map.get(local_by_name, name, false),
        local: Map.has_key?(local_by_name, name),
        remote: remote_by_name |> Map.get(name, []) |> List.first()
      }
    end)
    |> Enum.sort_by(&{!&1.current, &1.name})
  end
end
