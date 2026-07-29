defmodule GitBeholder.CommitActivityTest do
  use ExUnit.Case, async: true

  alias GitBeholder.CommitActivity

  defp wide_range do
    today = Date.utc_today()
    {Date.add(today, -3650) |> Date.to_iso8601(), Date.add(today, 3650) |> Date.to_iso8601()}
  end

  setup do
    repo_path = Path.join(System.tmp_dir!(), "commit_activity_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp write_commit(repo_path, files, message, opts) do
    for {name, content} <- files do
      File.write!(Path.join(repo_path, name), content)
    end

    System.cmd("git", ["add" | Map.keys(files)], cd: repo_path)

    author = Keyword.get(opts, :author)
    date = Keyword.get(opts, :date)

    env =
      (if date, do: [{"GIT_AUTHOR_DATE", date}, {"GIT_COMMITTER_DATE", date}], else: []) ++
        if author, do: [{"GIT_AUTHOR_NAME", author}], else: []

    System.cmd("git", ["commit", "-q", "-m", message], cd: repo_path, env: env)
  end

  test "buckets commits by day with commit/file/line counts and authors", %{repo_path: repo_path} do
    write_commit(repo_path, %{"a.txt" => "one\n"}, "add a", date: "2024-06-01T10:00:00")
    write_commit(repo_path, %{"a.txt" => "one\ntwo\n"}, "update a", date: "2024-06-01T11:00:00")
    write_commit(repo_path, %{"b.txt" => "hi\n"}, "add b", date: "2024-06-02T09:00:00")

    assert {:ok, %{buckets: buckets, truncated: false}} =
             CommitActivity.build(repo_path, "master", "2024-06-01", "2024-06-02")

    assert [
             %{date: "2024-06-01", commit_count: 2, file_count: 1, authors: ["Test"]},
             %{date: "2024-06-02", commit_count: 1, file_count: 1, authors: ["Test"]}
           ] = buckets

    [day1, _day2] = buckets
    assert day1.lines_changed > 0
  end

  test "sums lines_changed across additions and deletions", %{repo_path: repo_path} do
    write_commit(repo_path, %{"a.txt" => "one\ntwo\nthree\n"}, "add a", date: "2024-06-01T10:00:00")
    write_commit(repo_path, %{"a.txt" => "one\n"}, "shrink a", date: "2024-06-01T11:00:00")

    assert {:ok, %{buckets: [bucket]}} =
             CommitActivity.build(repo_path, "master", "2024-06-01", "2024-06-01")

    # 3 additions on the first commit (new file) + 2 deletions on the second
    assert bucket.lines_changed == 5
  end

  test "only a branch-tip commit is decorated with branches", %{repo_path: repo_path} do
    write_commit(repo_path, %{"a.txt" => "1"}, "first", date: "2024-06-01T10:00:00")
    write_commit(repo_path, %{"a.txt" => "2"}, "second (tip)", date: "2024-06-01T11:00:00")
    {start_date, end_date} = wide_range()

    assert {:ok, %{buckets: [bucket]}} =
             CommitActivity.build(repo_path, "master", start_date, end_date)

    assert bucket.branches == ["master"]
  end

  test "a merge commit counts toward commit_count but not file/line stats", %{repo_path: repo_path} do
    write_commit(repo_path, %{"base.txt" => "1"}, "base", date: "2024-06-01T09:00:00")
    System.cmd("git", ["checkout", "-q", "-b", "feature"], cd: repo_path)
    write_commit(repo_path, %{"feature.txt" => "1"}, "on feature", date: "2024-06-01T10:00:00")
    System.cmd("git", ["checkout", "-q", "master"], cd: repo_path)

    System.cmd(
      "git",
      ["merge", "-q", "--no-ff", "-m", "merge feature", "feature"],
      cd: repo_path,
      env: [{"GIT_AUTHOR_DATE", "2024-06-01T12:00:00"}, {"GIT_COMMITTER_DATE", "2024-06-01T12:00:00"}]
    )

    assert {:ok, %{buckets: [bucket]}} =
             CommitActivity.build(repo_path, "master", "2024-06-01", "2024-06-01")

    assert bucket.commit_count == 3
    # base.txt + feature.txt only - the merge commit contributes no
    # numstat lines of its own (see moduledoc), so file_count stays 2.
    assert bucket.file_count == 2
  end

  test "handles binary files (numstat reports '-' for both counts)", %{repo_path: repo_path} do
    write_commit(repo_path, %{"image.bin" => <<0, 1, 2, 255>>}, "add binary", date: "2024-06-01T10:00:00")

    assert {:ok, %{buckets: [bucket]}} =
             CommitActivity.build(repo_path, "master", "2024-06-01", "2024-06-01")

    assert bucket.file_count == 1
    assert bucket.lines_changed == 0
  end

  test "returns an error for an invalid date format", %{repo_path: repo_path} do
    assert {:error, _reason} = CommitActivity.build(repo_path, "master", "01-01-2024", "2024-12-31")
  end

  test "returns an error when start_date is after end_date", %{repo_path: repo_path} do
    assert {:error, _reason} = CommitActivity.build(repo_path, "master", "2024-12-31", "2024-01-01")
  end

  test "sets truncated when the commit count exceeds the cap", %{repo_path: repo_path} do
    write_commit(repo_path, %{"a.txt" => "1"}, "first", date: "2024-06-01T09:00:00")
    write_commit(repo_path, %{"a.txt" => "2"}, "second", date: "2024-06-01T10:00:00")
    write_commit(repo_path, %{"a.txt" => "3"}, "third", date: "2024-06-01T11:00:00")

    assert {:ok, %{truncated: true}} =
             CommitActivity.build(repo_path, "master", "2024-06-01", "2024-06-01", 2)
  end

  test "returns :error for a path that isn't a git repository" do
    {start_date, end_date} = wide_range()
    assert {:error, _reason} = CommitActivity.build(System.tmp_dir!(), "master", start_date, end_date)
  end
end
