defmodule GitBeholder.CommitGraph do
  @moduledoc """
  Builds a bipartite Commit/File graph for a repository within a date
  range, for the Graph visualization (d3-force on the frontend).

  A single `git log --name-only` call returns, per commit, every file it
  touched — avoiding one `git show`/`git diff` per commit. Nodes are
  deduplicated (one node per file path, regardless of how many commits
  touched it) and ids are prefixed (`commit:`/`file:`) so a file whose
  name happens to look like a hash can never collide with a commit node.

  Uses `-m` (not `-m --first-parent`) so merge commits still get a file
  list: with plain `-m`, git logs a merge commit once per parent that has
  a non-trivial diff against it, each with its own name-only listing.
  `--first-parent` would additionally restrict the whole walk to
  mainline-only history, silently dropping every commit only reachable
  through a merged-in branch — the opposite of what a commit graph needs.
  The tradeoff: a merge with divergent changes on both sides logs the
  same commit hash twice (once per parent's diff), so records are
  re-merged by hash in `assemble/2` before turning them into nodes.
  """

  @date_format ~r/^\d{4}-\d{2}-\d{2}$/
  @field_sep "\x1f"
  @record_sep "\x1e"
  @max_commits 500

  def build(repo_path, branch, start_date, end_date, max_commits \\ @max_commits) do
    with :ok <- validate_date(start_date),
         :ok <- validate_date(end_date),
         :ok <- validate_range(start_date, end_date) do
      run_git_log(repo_path, branch, start_date, end_date, max_commits)
    end
  end

  defp run_git_log(repo_path, branch, start_date, end_date, max_commits) do
    args = [
      "log",
      branch,
      "-m",
      "-n",
      Integer.to_string(max_commits + 1),
      "--since=#{start_date}",
      "--until=#{end_date} 23:59:59",
      "--pretty=format:#{@record_sep}%H#{@field_sep}%an#{@field_sep}%ad",
      "--date=format:%Y-%m-%d %H:%M",
      "--name-only"
    ]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} -> {:ok, assemble(output, max_commits)}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end

  defp assemble(output, max_commits) do
    commits =
      output
      |> String.split(@record_sep)
      |> Enum.map(&String.trim/1)
      |> Enum.reject(&(&1 == ""))
      |> Enum.map(&parse_commit/1)
      |> merge_by_hash()

    {commits, truncated} =
      if length(commits) > max_commits do
        {Enum.take(commits, max_commits), true}
      else
        {commits, false}
      end

    {commit_nodes, file_nodes, edges} = Enum.reduce(commits, {[], %{}, []}, &accumulate/2)

    %{
      nodes: Enum.reverse(commit_nodes) ++ Map.values(file_nodes),
      edges: Enum.reverse(edges),
      truncated: truncated
    }
  end

  defp parse_commit(record) do
    [header | file_lines] = String.split(record, "\n")
    [hash, author, timestamp] = String.split(header, @field_sep, parts: 3)

    files =
      file_lines
      |> Enum.map(&String.trim/1)
      |> Enum.reject(&(&1 == ""))

    %{hash: hash, author: author, timestamp: timestamp, files: files}
  end

  # `-m` logs a merge commit once per parent with a non-trivial diff, so
  # the same hash can appear as two separate records — collapse those
  # into one, combining their file lists, preserving first-seen order.
  defp merge_by_hash(records) do
    {order, by_hash} =
      Enum.reduce(records, {[], %{}}, fn record, {order, by_hash} ->
        case Map.fetch(by_hash, record.hash) do
          {:ok, existing} ->
            {order, Map.put(by_hash, record.hash, %{existing | files: existing.files ++ record.files})}

          :error ->
            {[record.hash | order], Map.put(by_hash, record.hash, record)}
        end
      end)

    order |> Enum.reverse() |> Enum.map(&Map.fetch!(by_hash, &1))
  end

  defp accumulate(commit, {commit_nodes, file_nodes, edges}) do
    commit_id = "commit:" <> commit.hash

    commit_node = %{
      id: commit_id,
      type: "commit",
      hash: commit.hash,
      author: commit.author,
      timestamp: commit.timestamp
    }

    {file_nodes, edges} =
      Enum.reduce(commit.files, {file_nodes, edges}, fn path, {file_nodes, edges} ->
        file_id = "file:" <> path
        file_nodes = Map.put_new(file_nodes, file_id, %{id: file_id, type: "file", name: path})
        {file_nodes, [%{source: commit_id, target: file_id} | edges]}
      end)

    {[commit_node | commit_nodes], file_nodes, edges}
  end

  defp validate_date(date) do
    if Regex.match?(@date_format, date) do
      :ok
    else
      {:error, "invalid date format, expected YYYY-MM-DD"}
    end
  end

  defp validate_range(start_date, end_date) do
    if start_date <= end_date do
      :ok
    else
      {:error, "start_date must be before end_date"}
    end
  end
end
