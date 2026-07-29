defmodule GitBeholder.CommitActivity do
  @moduledoc """
  Aggregates commit history into daily buckets for the Graph view's
  commit-activity bar: commit count, unique file count, total lines
  changed, authors, and branches touched, per day.

  A single `git log --numstat` call carries everything needed — no
  per-commit `git show`. Branches come from `GitRefs.decorations_by_commit`,
  the same source `GitLog` already uses for the commit list — so, like
  the rest of the app, only commits that are currently a branch tip
  carry branch info (a commit reachable from a branch but buried in its
  history isn't attributable to that branch without a much more
  expensive `git branch --contains` per commit).

  Deliberately skips `-m` for merge commits (unlike `CommitGraph`):
  `git log --numstat` gives no file/line stats for a merge commit by
  default, which is standard, well-understood git behavior. Using `-m`
  would fix that but can log a merge twice (once per parent's diff),
  which would double-count that commit's lines/files into the day's
  totals — worse than the commit just not contributing to those two
  numbers. Its `commit_count` is unaffected either way.
  """

  alias GitBeholder.GitRefs

  @date_format ~r/^\d{4}-\d{2}-\d{2}$/
  @field_sep "\x1f"
  @record_sep "\x1e"
  @max_commits 1000

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
      "-n",
      Integer.to_string(max_commits + 1),
      # A bare "--since=2024-06-01" (no time-of-day) silently excludes
      # commits made *on* 2024-06-01 in this git build — it appears to
      # parse the boundary as end-of-day for --since too, not just
      # --until, which excludes everything but the last instant of that
      # day. Spelling out 00:00:00 pins the intended start-of-day.
      "--since=#{start_date} 00:00:00",
      "--until=#{end_date} 23:59:59",
      "--pretty=format:#{@record_sep}%H#{@field_sep}%an#{@field_sep}%ad",
      "--date=format:%Y-%m-%d",
      "--numstat"
    ]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} ->
        with {:ok, decorations} <- GitRefs.decorations_by_commit(repo_path) do
          {:ok, assemble(output, decorations, max_commits)}
        end

      {error_msg, _exit_code} ->
        {:error, error_msg}
    end
  end

  defp assemble(output, decorations, max_commits) do
    commits =
      output
      |> String.split(@record_sep)
      |> Enum.map(&String.trim/1)
      |> Enum.reject(&(&1 == ""))
      |> Enum.map(&parse_commit(&1, decorations))

    {commits, truncated} =
      if length(commits) > max_commits do
        {Enum.take(commits, max_commits), true}
      else
        {commits, false}
      end

    buckets =
      commits
      |> Enum.group_by(& &1.date)
      |> Enum.map(fn {date, day_commits} -> build_bucket(date, day_commits) end)
      |> Enum.sort_by(& &1.date)

    %{buckets: buckets, truncated: truncated}
  end

  defp parse_commit(record, decorations) do
    [header | file_lines] = String.split(record, "\n")
    [hash, author, date] = String.split(header, @field_sep, parts: 3)

    files =
      file_lines
      |> Enum.map(&String.trim/1)
      |> Enum.reject(&(&1 == ""))
      |> Enum.map(&parse_numstat_line/1)

    branches =
      decorations
      |> Map.get(hash, [])
      |> Enum.filter(&(&1.type == "branch"))
      |> Enum.map(& &1.name)
      |> Enum.uniq()

    %{hash: hash, author: author, date: date, files: files, branches: branches}
  end

  defp parse_numstat_line(line) do
    [additions, deletions, path] = String.split(line, "\t", parts: 3)
    %{path: resolve_path(path), additions: parse_count(additions), deletions: parse_count(deletions)}
  end

  # Binary files report "-" for both counts instead of a number.
  defp parse_count("-"), do: 0
  defp parse_count(count), do: String.to_integer(count)

  # Renames print as "old => new" (full rename) or a common-prefix
  # compacted form like "lib/foo/{bar.ex => baz.ex}" — same resolution
  # as GitDiff.file_changes/2, the right-hand side is the current path.
  defp resolve_path(path) do
    cond do
      String.contains?(path, "{") ->
        Regex.replace(~r/\{[^}]* => ([^}]*)\}/, path, "\\1")

      String.contains?(path, " => ") ->
        path |> String.split(" => ") |> List.last()

      true ->
        path
    end
  end

  defp build_bucket(date, day_commits) do
    file_count =
      day_commits
      |> Enum.flat_map(fn commit -> Enum.map(commit.files, & &1.path) end)
      |> Enum.uniq()
      |> length()

    lines_changed =
      day_commits
      |> Enum.flat_map(& &1.files)
      |> Enum.reduce(0, fn file, total -> total + file.additions + file.deletions end)

    authors = day_commits |> Enum.map(& &1.author) |> Enum.uniq()
    branches = day_commits |> Enum.flat_map(& &1.branches) |> Enum.uniq()

    %{
      date: date,
      commit_count: length(day_commits),
      file_count: file_count,
      lines_changed: lines_changed,
      authors: authors,
      branches: branches
    }
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
