defmodule GitBeholder.GitBranches do
  def list_branches(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      with {:ok, {local, remote}} <- refs(repo_path) do
        {:ok, merge(local, remote)}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end

  # Local and remote branches in a single git spawn (~20 ms each on
  # Windows), told apart by the full refname.
  defp refs(repo_path) do
    args = ["for-each-ref", "--format=%(HEAD)|%(refname)", "refs/heads", "refs/remotes"]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} ->
        parsed =
          output
          |> String.trim()
          |> String.split("\n", trim: true)
          |> Enum.flat_map(&parse_ref_line/1)

        local = for {:local, name, current} <- parsed, do: {name, current}
        remote = for {:remote, remote, name} <- parsed, do: {remote, name}

        {:ok, {local, remote}}

      {error_msg, _exit_code} ->
        {:error, error_msg}
    end
  end

  defp parse_ref_line(line) do
    case String.split(line, "|", parts: 2) do
      [head, "refs/heads/" <> name] -> [{:local, name, head == "*"}]
      [_head, "refs/remotes/" <> short_ref] -> parse_remote_ref(short_ref)
      _ -> []
    end
  end

  # "origin/main" -> {"origin", "main"}; the symbolic "origin/HEAD" ref
  # doesn't name an actual branch, so it's dropped.
  defp parse_remote_ref(short_ref) do
    case String.split(short_ref, "/", parts: 2) do
      [_remote, "HEAD"] -> []
      [remote, name] -> [{:remote, remote, name}]
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
