defmodule GitBeholder.CommitGraphTest do
  use ExUnit.Case, async: true

  alias GitBeholder.CommitGraph

  # A decade-wide window around today, formatted as the "YYYY-MM-DD" the
  # module expects. Deliberately not a hardcoded far-future sentinel like
  # "2100-01-01" — this git build's --until parser silently returns an
  # empty result for dates that far out (~2090+), so the window has to
  # stay comfortably inside git's actual working range.
  defp wide_range do
    today = Date.utc_today()
    {Date.add(today, -3650) |> Date.to_iso8601(), Date.add(today, 3650) |> Date.to_iso8601()}
  end

  setup do
    repo_path = Path.join(System.tmp_dir!(), "commit_graph_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp write_commit(repo_path, files, message, opts \\ []) do
    for {name, content} <- files do
      File.write!(Path.join(repo_path, name), content)
    end

    System.cmd("git", ["add" | Map.keys(files)], cd: repo_path)

    date = Keyword.get(opts, :date)
    env = if date, do: [{"GIT_AUTHOR_DATE", date}, {"GIT_COMMITTER_DATE", date}], else: []

    System.cmd("git", ["commit", "-q", "-m", message], cd: repo_path, env: env)
  end

  test "builds a bipartite graph: commit and file nodes, commit->file edges only", %{
    repo_path: repo_path
  } do
    write_commit(repo_path, %{"a.txt" => "1"}, "add a")
    {start_date, end_date} = wide_range()

    assert {:ok, %{nodes: nodes, edges: edges, truncated: false}} =
             CommitGraph.build(repo_path, "master", start_date, end_date)

    assert [commit_node] = Enum.filter(nodes, &(&1.type == "commit"))
    assert [file_node] = Enum.filter(nodes, &(&1.type == "file"))

    assert %{name: "a.txt", id: "file:a.txt"} = file_node
    assert %{author: "Test", id: "commit:" <> hash} = commit_node
    assert String.match?(hash, ~r/^[0-9a-f]+$/)

    assert [%{source: commit_node.id, target: file_node.id}] == edges
  end

  test "dedups a file touched by multiple commits into a single node with one edge each", %{
    repo_path: repo_path
  } do
    write_commit(repo_path, %{"a.txt" => "1"}, "add a")
    write_commit(repo_path, %{"a.txt" => "2"}, "update a")
    {start_date, end_date} = wide_range()

    assert {:ok, %{nodes: nodes, edges: edges}} =
             CommitGraph.build(repo_path, "master", start_date, end_date)

    file_nodes = Enum.filter(nodes, &(&1.type == "file"))
    commit_nodes = Enum.filter(nodes, &(&1.type == "commit"))

    assert length(file_nodes) == 1
    assert length(commit_nodes) == 2
    assert length(edges) == 2
    assert Enum.all?(edges, &(&1.target == "file:a.txt"))
  end

  test "excludes commits outside the given date range", %{repo_path: repo_path} do
    write_commit(repo_path, %{"old.txt" => "1"}, "old", date: "2020-01-01T12:00:00")
    write_commit(repo_path, %{"new.txt" => "1"}, "new", date: "2024-06-15T12:00:00")

    assert {:ok, %{nodes: nodes}} =
             CommitGraph.build(repo_path, "master", "2024-01-01", "2024-12-31")

    file_names = nodes |> Enum.filter(&(&1.type == "file")) |> Enum.map(& &1.name)
    assert file_names == ["new.txt"]
  end

  test "includes commits reachable only through a merged-in branch", %{repo_path: repo_path} do
    write_commit(repo_path, %{"base.txt" => "1"}, "base")
    System.cmd("git", ["checkout", "-q", "-b", "feature"], cd: repo_path)
    write_commit(repo_path, %{"feature.txt" => "1"}, "on feature")
    System.cmd("git", ["checkout", "-q", "master"], cd: repo_path)
    System.cmd("git", ["merge", "-q", "--no-ff", "-m", "merge feature", "feature"], cd: repo_path)
    {start_date, end_date} = wide_range()

    assert {:ok, %{nodes: nodes}} =
             CommitGraph.build(repo_path, "master", start_date, end_date)

    commit_nodes = Enum.filter(nodes, &(&1.type == "commit"))
    file_names = nodes |> Enum.filter(&(&1.type == "file")) |> Enum.map(& &1.name) |> Enum.sort()

    assert length(commit_nodes) == 3
    assert file_names == ["base.txt", "feature.txt"]
  end

  test "a merge commit with divergent changes on both sides is a single node with both files", %{
    repo_path: repo_path
  } do
    write_commit(repo_path, %{"base.txt" => "1"}, "base")
    System.cmd("git", ["checkout", "-q", "-b", "feature"], cd: repo_path)
    write_commit(repo_path, %{"feature.txt" => "1"}, "on feature")
    System.cmd("git", ["checkout", "-q", "master"], cd: repo_path)
    write_commit(repo_path, %{"master.txt" => "1"}, "on master")
    System.cmd("git", ["merge", "-q", "--no-ff", "-m", "merge feature", "feature"], cd: repo_path)
    {start_date, end_date} = wide_range()

    assert {:ok, %{nodes: nodes, edges: edges}} =
             CommitGraph.build(repo_path, "master", start_date, end_date)

    commit_nodes = Enum.filter(nodes, &(&1.type == "commit"))
    commit_ids = commit_nodes |> Enum.map(& &1.id) |> Enum.uniq()

    # 4 commits total: base, on feature, on master, merge — merge must
    # collapse to exactly one node (unique ids) even though `-m` logs it
    # twice (once per parent's diff).
    assert length(commit_nodes) == 4
    assert length(commit_ids) == 4

    # 5 edges (base->base.txt, on feature->feature.txt, on master->master.txt,
    # merge->feature.txt, merge->master.txt) across 3 unique file targets —
    # the merge commit keeps both of its parent-diff file associations.
    assert length(edges) == 5
    assert edges |> Enum.map(& &1.target) |> Enum.uniq() |> Enum.sort() ==
             ["file:base.txt", "file:feature.txt", "file:master.txt"]
  end

  test "returns an error for an invalid date format", %{repo_path: repo_path} do
    assert {:error, _reason} = CommitGraph.build(repo_path, "master", "01-01-2024", "2024-12-31")
    assert {:error, _reason} = CommitGraph.build(repo_path, "master", "2024-01-01", "not-a-date")
  end

  test "returns an error when start_date is after end_date", %{repo_path: repo_path} do
    assert {:error, _reason} = CommitGraph.build(repo_path, "master", "2024-12-31", "2024-01-01")
  end

  test "sets truncated when the commit count exceeds the cap", %{repo_path: repo_path} do
    write_commit(repo_path, %{"a.txt" => "1"}, "first")
    write_commit(repo_path, %{"a.txt" => "2"}, "second")
    write_commit(repo_path, %{"a.txt" => "3"}, "third")
    {start_date, end_date} = wide_range()

    assert {:ok, %{truncated: false}} =
             CommitGraph.build(repo_path, "master", start_date, end_date, 3)

    assert {:ok, %{truncated: true} = graph} =
             CommitGraph.build(repo_path, "master", start_date, end_date, 2)

    assert length(Enum.filter(graph.nodes, &(&1.type == "commit"))) == 2
  end

  test "returns :error for a path that isn't a git repository" do
    {start_date, end_date} = wide_range()
    assert {:error, _reason} = CommitGraph.build(System.tmp_dir!(), "master", start_date, end_date)
  end
end
