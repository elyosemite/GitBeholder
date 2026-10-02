defmodule GitBeholder.GitRefs do
  # Known SaaS hosts only — self-hosted GitHub Enterprise/GitLab instances
  # won't match and just fall back to platform: nil (no icon), not an error.
  @known_hosts %{
    "github.com" => "github",
    "gitlab.com" => "gitlab",
    "bitbucket.org" => "bitbucket",
    "dev.azure.com" => "azure-devops",
    "visualstudio.com" => "azure-devops"
  }

  # Returns %{commit_sha => [ref]} for every branch/tag currently pointing at
  # a commit, mirroring what `git log --decorate` shows next to each commit.
  def decorations_by_commit(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      case for_each_ref(repo_path) do
        {:ok, output} ->
          raw_refs = parse_refs(output)
          platform_by_remote = resolve_platforms(repo_path, raw_refs)

          grouped =
            raw_refs
            |> Enum.map(&attach_platform(&1, platform_by_remote))
            |> Enum.group_by(& &1.sha)
            |> Map.new(fn {sha, entries} -> {sha, merge_and_sort(entries)} end)

          {:ok, grouped}

        {:error, reason} ->
          {:error, reason}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end

  defp for_each_ref(repo_path) do
    args = [
      "for-each-ref",
      "--format=%(objectname)|%(*objectname)|%(refname)|%(HEAD)",
      "refs/heads",
      "refs/remotes",
      "refs/tags"
    ]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end

  defp parse_refs(output) do
    output
    |> String.trim()
    |> String.split("\n", trim: true)
    |> Enum.flat_map(&parse_ref_line/1)
  end

  defp parse_ref_line(line) do
    [objectname, peeled, refname, head_marker] = String.split(line, "|", parts: 4)
    sha = if peeled != "", do: peeled, else: objectname

    case classify(refname) do
      {:branch, "HEAD", {:remote, _}} ->
        []

      {:branch, name, :local} ->
        [%{sha: sha, type: "branch", name: name, current: head_marker == "*", local: true, remote: nil}]

      {:branch, name, {:remote, remote}} ->
        [%{sha: sha, type: "branch", name: name, current: false, local: false, remote: remote}]

      {:tag, name} ->
        [%{sha: sha, type: "tag", name: name, current: false, local: false, remote: nil}]

      :unknown ->
        []
    end
  end

  defp classify("refs/heads/" <> name), do: {:branch, name, :local}

  defp classify("refs/remotes/" <> rest) do
    case String.split(rest, "/", parts: 2) do
      [remote, name] -> {:branch, name, {:remote, remote}}
      _ -> :unknown
    end
  end

  defp classify("refs/tags/" <> name), do: {:tag, name}
  defp classify(_refname), do: :unknown

  defp resolve_platforms(repo_path, raw_refs) do
    if Enum.any?(raw_refs, & &1.remote) do
      repo_path
      |> remote_urls()
      |> Map.new(fn {remote, url} -> {remote, detect_platform(url)} end)
    else
      %{}
    end
  end

  # One `git config` for every remote instead of a `git remote get-url`
  # per remote — each git spawn costs ~20 ms on Windows. Unlike get-url it
  # skips `url.<base>.insteadOf` rewriting, which only matters for platform
  # detection when a rewrite changes the host.
  defp remote_urls(repo_path) do
    case System.cmd("git", ["config", "--get-regexp", ~S"^remote\..*\.url$"],
           cd: repo_path,
           stderr_to_stdout: true
         ) do
      {output, 0} ->
        output
        |> String.split("\n", trim: true)
        |> Enum.flat_map(&parse_remote_url_line/1)

      # Exit 1 = no remote has a url configured.
      _ ->
        []
    end
  end

  # "remote.origin.url git@github.com:a/b.git" -> {"origin", "git@github.com:a/b.git"}
  defp parse_remote_url_line(line) do
    with [key, url] <- String.split(String.trim(line), " ", parts: 2),
         "remote." <> rest <- key,
         remote when remote != "" <- String.replace_suffix(rest, ".url", "") do
      [{remote, url}]
    else
      _ -> []
    end
  end

  defp detect_platform(url) do
    Enum.find_value(@known_hosts, fn {host, platform} ->
      if String.contains?(url, host), do: platform
    end)
  end

  defp attach_platform(ref, platform_by_remote) do
    platform = if ref.remote, do: Map.get(platform_by_remote, ref.remote), else: nil

    ref
    |> Map.delete(:remote)
    |> Map.put(:platform, platform)
  end

  defp merge_and_sort(entries) do
    entries
    |> Enum.group_by(&{&1.type, &1.name})
    |> Enum.map(fn {{type, name}, group} ->
      %{
        name: name,
        type: type,
        current: Enum.any?(group, & &1.current),
        local: Enum.any?(group, & &1.local),
        platform: Enum.find_value(group, & &1.platform)
      }
    end)
    |> Enum.sort_by(&{priority(&1), &1.name})
  end

  # current > tag > local branch > remote-only branch — CommitRow only ever
  # renders refs[0], so this order decides which single ref actually shows.
  defp priority(%{current: true}), do: 0
  defp priority(%{type: "tag"}), do: 1
  defp priority(%{local: true}), do: 2
  defp priority(_ref), do: 3
end
