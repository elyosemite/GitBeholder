defmodule GitBeholder.GitCommitDetailsTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitCommitDetails

  setup do
    repo_path = Path.join(System.tmp_dir!(), "commit_details_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    git(repo_path, ["init", "-q"])
    git(repo_path, ["config", "user.email", "ada@example.com"])
    git(repo_path, ["config", "user.name", "Ada Lovelace"])

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp git(repo_path, args, env \\ []) do
    {output, 0} = System.cmd("git", args, cd: repo_path, env: env, stderr_to_stdout: true)
    String.trim(output)
  end

  defp commit(repo_path, message, env \\ []) do
    File.write!(Path.join(repo_path, "file.txt"), message)
    git(repo_path, ["add", "file.txt"])
    git(repo_path, ["commit", "-q", "-m", message], env)
    git(repo_path, ["rev-parse", "HEAD"])
  end

  test "returns author, committer, subject and body", %{repo_path: repo_path} do
    hash =
      commit(repo_path, "feat: add parser\n\nHandles nested blocks.\nSecond line.", [
        {"GIT_COMMITTER_NAME", "Grace Hopper"},
        {"GIT_COMMITTER_EMAIL", "grace@example.com"}
      ])

    assert {:ok, details} = GitCommitDetails.get(repo_path, hash)

    assert details.hash == hash
    assert details.subject == "feat: add parser"
    assert details.body == "Handles nested blocks.\nSecond line."
    assert %{name: "Ada Lovelace", email: "ada@example.com", date: author_date} = details.author
    assert %{name: "Grace Hopper", email: "grace@example.com"} = details.committer
    assert {:ok, _, _} = DateTime.from_iso8601(author_date)
  end

  test "a root commit has no parents; the next one has it as parent", %{repo_path: repo_path} do
    root = commit(repo_path, "first")
    child = commit(repo_path, "second")

    assert {:ok, %{parents: []}} = GitCommitDetails.get(repo_path, root)
    assert {:ok, %{parents: [^root]}} = GitCommitDetails.get(repo_path, child)
  end

  test "a subject-only message has an empty body", %{repo_path: repo_path} do
    hash = commit(repo_path, "chore: bump")

    assert {:ok, %{subject: "chore: bump", body: ""}} = GitCommitDetails.get(repo_path, hash)
  end

  test "accepts an abbreviated hash", %{repo_path: repo_path} do
    hash = commit(repo_path, "first")

    assert {:ok, %{hash: ^hash}} = GitCommitDetails.get(repo_path, String.slice(hash, 0, 7))
  end

  test "rejects anything that isn't a hex hash before calling git", %{repo_path: repo_path} do
    assert {:error, :invalid_hash} = GitCommitDetails.get(repo_path, "--output=/tmp/pwned")
    assert {:error, :invalid_hash} = GitCommitDetails.get(repo_path, "HEAD")
  end

  test "reports co-authors and drops their trailers from the body", %{repo_path: repo_path} do
    hash =
      commit(
        repo_path,
        "feat: x\n\nBody text.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nco-authored-by: Grace <grace@example.com>"
      )

    assert {:ok, details} = GitCommitDetails.get(repo_path, hash)

    assert details.co_authors == [
             %{name: "Claude Opus 5.5", email: "noreply@anthropic.com"},
             %{name: "Grace", email: "grace@example.com"}
           ]

    assert details.body == "Body text."
  end

  test "reports files changed, insertions and deletions", %{repo_path: repo_path} do
    File.write!(Path.join(repo_path, "a.txt"), "1\n2\n3\n")
    git(repo_path, ["add", "-A"])
    git(repo_path, ["commit", "-q", "-m", "base"])

    File.write!(Path.join(repo_path, "a.txt"), "1\nTWO\n3\n4\n")
    File.write!(Path.join(repo_path, "b.txt"), "new\n")
    git(repo_path, ["add", "-A"])
    git(repo_path, ["commit", "-q", "-m", "edit"])
    hash = git(repo_path, ["rev-parse", "HEAD"])

    assert {:ok, %{stats: stats}} = GitCommitDetails.get(repo_path, hash)
    assert stats == %{files_changed: 2, insertions: 3, deletions: 1}
  end

  test "lists local (current or not) and remote branches containing the commit", %{repo_path: repo_path} do
    hash = commit(repo_path, "first")
    current = git(repo_path, ["rev-parse", "--abbrev-ref", "HEAD"])
    git(repo_path, ["branch", "feature"])
    git(repo_path, ["update-ref", "refs/remotes/origin/#{current}", hash])
    git(repo_path, ["symbolic-ref", "refs/remotes/origin/HEAD", "refs/remotes/origin/#{current}"])

    assert {:ok, %{branches: branches}} = GitCommitDetails.get(repo_path, hash)

    assert Enum.sort_by(branches, & &1.name) ==
             Enum.sort_by(
               [
                 %{name: current, remote: false, current: true},
                 %{name: "feature", remote: false, current: false},
                 %{name: "origin/#{current}", remote: true, current: false}
               ],
               & &1.name
             )
  end

  test "returns an error for an unknown commit", %{repo_path: repo_path} do
    commit(repo_path, "first")

    assert {:error, reason} = GitCommitDetails.get(repo_path, "deadbeef")
    assert is_binary(reason)
  end
end
