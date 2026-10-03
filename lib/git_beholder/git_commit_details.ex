defmodule GitBeholder.GitCommitDetails do
  @moduledoc """
  Full metadata of one commit, for the commit panel: parents, author and
  committer (each with their own date — they differ after a rebase or
  cherry-pick), and the complete message.
  """

  @field_sep "\x1f"
  @hash_format ~r/^[0-9a-fA-F]{4,40}$/

  @doc """
  Returns:
    * `{:ok, %{hash, parents, author, committer, subject, body}}` — `author`
      and `committer` are `%{name, email, date}` with ISO 8601 dates;
      `parents` is empty for a root commit, two entries for a merge.
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
    format = Enum.join(~w(%H %P %an %ae %aI %cn %ce %cI %B), "%x1f")

    case System.cmd("git", ["show", "-s", "--format=#{format}", hash],
           cd: repo_path,
           stderr_to_stdout: true
         ) do
      {output, 0} -> {:ok, parse(output)}
      {error_msg, _exit_code} -> {:error, error_msg}
    end
  end

  defp parse(output) do
    [hash, parents, an, ae, ad, cn, ce, cd, message] = String.split(output, @field_sep, parts: 9)
    {subject, body} = split_message(message)

    %{
      hash: hash,
      parents: String.split(parents, " ", trim: true),
      author: %{name: an, email: ae, date: ad},
      committer: %{name: cn, email: ce, date: cd},
      subject: subject,
      body: body
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
end
