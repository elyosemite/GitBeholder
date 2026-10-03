defmodule GitBeholder.GitCommitDetails do
  @moduledoc """
  Full metadata of one commit, for the commit panel and the commit hover
  card: parents, author and committer (each with their own date — they
  differ after a rebase or cherry-pick), co-authors, the complete message,
  change stats and the branch(es) the commit is on.
  """

  @field_sep "\x1f"
  @record_sep "\x1e"
  @hash_format ~r/^[0-9a-fA-F]{4,40}$/
  @co_author_line ~r/^co-authored-by:\s*(.+?)\s*<([^>]+)>\s*$/im

  @doc """
  Returns:
    * `{:ok, details}` with
      - `hash`, `parents` (empty for a root commit, two for a merge)
      - `author`, `committer`: `%{name, email, date}`, ISO 8601 dates
      - `co_authors`: `[%{name, email}]` from `Co-authored-by:` trailers
        (e.g. an AI pair like Claude)
      - `subject`, `body` — the body without the co-author trailers,
        which are reported in `co_authors` instead
      - `stats`: `%{files_changed, insertions, deletions}` (all 0 for a
        merge, which git shows without a diff)
      - `branches`: `[%{name, remote, current}]`, the branch(es) the
        commit is on — usually one local and its remote (see branches/2)
    * `{:error, :invalid_hash}` — not a (possibly abbreviated) hex hash;
      checked before reaching git so a value like `--output=…` can never
      be read as an option.
    * `{:error, reason}` — git failed (unknown commit, not a repository)
  """
  def get(repo_path, hash) do
    if Regex.match?(@hash_format, hash) do
      run(repo_path, hash)
    else
      {:error, :invalid_hash}
    end
  end

  defp run(repo_path, hash) do
    # The branch lookup walks history: run it alongside `git show`.
    branches_task = Task.async(fn -> branches(repo_path, hash) end)
    show_result = show(repo_path, hash)
    branches = Task.await(branches_task, :infinity)

    with {:ok, details} <- show_result do
      {:ok, Map.put(details, :branches, branches)}
    end
  end

  # One call for the metadata and the --shortstat line that follows it.
  defp show(repo_path, hash) do
    format = Enum.join(~w(%H %P %an %ae %aI %cn %ce %cI %B), "%x1f") <> "%x1e"

    case System.cmd("git", ["show", "--shortstat", "--format=#{format}", hash],
           cd: repo_path,
           stderr_to_stdout: true
         ) do
      {output, 0} -> {:ok, parse(output)}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end

  defp parse(output) do
    [meta, shortstat] =
      case String.split(output, @record_sep, parts: 2) do
        [meta, shortstat] -> [meta, shortstat]
        [meta] -> [meta, ""]
      end

    [hash, parents, an, ae, ad, cn, ce, cd, message] = String.split(meta, @field_sep, parts: 9)
    {subject, body} = split_message(message)

    %{
      hash: hash,
      parents: String.split(parents, " ", trim: true),
      author: %{name: an, email: ae, date: ad},
      committer: %{name: cn, email: ce, date: cd},
      co_authors: co_authors(message),
      subject: subject,
      body: strip_co_authors(body),
      stats: parse_shortstat(shortstat)
    }
  end

  # First line is the subject; everything after the first blank line is
  # the body (git's own convention).
  defp split_message(message) do
    case message |> String.trim() |> String.split("\n", parts: 2) do
      [subject] -> {subject, ""}
      [subject, rest] -> {subject, String.trim(rest)}
    end
  end

  defp co_authors(message) do
    @co_author_line
    |> Regex.scan(message, capture: :all_but_first)
    |> Enum.map(fn [name, email] -> %{name: name, email: email} end)
    |> Enum.uniq()
  end

  defp strip_co_authors(body) do
    @co_author_line |> Regex.replace(body, "") |> String.trim()
  end

  # " 3 files changed, 10 insertions(+), 2 deletions(-)" — either count
  # may be missing when it's zero.
  defp parse_shortstat(text) do
    count = fn pattern ->
      case Regex.run(pattern, text) do
        [_, n] -> String.to_integer(n)
        nil -> 0
      end
    end

    %{
      files_changed: count.(~r/(\d+) files? changed/),
      insertions: count.(~r/(\d+) insertions?\(\+\)/),
      deletions: count.(~r/(\d+) deletions?\(-\)/)
    }
  end

  # The branch(es) the commit is *on* — not every branch whose history
  # contains it, which for an old commit is nearly all of them:
  #   1. branches whose tip is exactly this commit (local and remote), else
  #   2. the nearest branch that contains it (`git name-rev`: "main~3" ->
  #      main) plus its same-named remote branches that contain it too.
  # Git doesn't record where a commit was made, so (2) is the usual
  # approximation clients like Fork or GitKraken make.
  defp branches(repo_path, hash) do
    case list_branches(repo_path, ["--points-at", hash]) do
      [] -> nearest_branches(repo_path, hash)
      tips -> tips
    end
  end

  defp nearest_branches(repo_path, hash) do
    case nearest_branch_name(repo_path, hash, "refs/heads/*") ||
           nearest_branch_name(repo_path, hash, "refs/remotes/*") do
      nil ->
        []

      short_name ->
        repo_path
        |> list_branches(["--contains", hash])
        |> Enum.filter(&same_branch?(&1, short_name))
    end
  end

  # "main~3" / "remotes/origin/main^2" -> "main"
  defp nearest_branch_name(repo_path, hash, refs) do
    args = ["name-rev", "--name-only", "--no-undefined", "--refs=#{refs}", hash]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {name, 0} ->
        name = name |> String.trim() |> String.replace(~r/[~^].*$/, "")

        case name do
          "remotes/" <> remote_ref -> remote_ref |> String.split("/", parts: 2) |> List.last()
          local -> local
        end

      _ ->
        nil
    end
  end

  defp same_branch?(%{remote: false, name: name}, short_name), do: name == short_name

  defp same_branch?(%{remote: true, name: name}, short_name),
    do: String.ends_with?(name, "/" <> short_name)

  defp list_branches(repo_path, filter_args) do
    # `git branch --format` doesn't expand %x1f; refnames can't contain a
    # space, so the first character is the HEAD marker ("*" or " ").
    args = ["branch", "--all"] ++ filter_args ++ ["--format=%(HEAD)%(refname)"]

    case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
      {output, 0} ->
        output
        |> String.split("\n", trim: true)
        |> Enum.flat_map(&parse_branch_line/1)

      # A branch lookup failure shouldn't hide the rest of the details.
      _ ->
        []
    end
  end

  defp parse_branch_line(<<head::binary-size(1), refname::binary>>) do
    case refname do
      "refs/heads/" <> name ->
        [%{name: name, remote: false, current: head == "*"}]

      "refs/remotes/" <> name ->
        # origin/HEAD only points at another remote branch.
        if String.ends_with?(name, "/HEAD"), do: [], else: [%{name: name, remote: true, current: false}]

      _ ->
        []
    end
  end
end
