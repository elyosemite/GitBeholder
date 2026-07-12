defmodule GitBeholder.GitTagsTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitTags

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_tags_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)
    File.write!(Path.join(repo_path, "file.txt"), "original\n")
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", "initial"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  test "returns an empty list when there are no tags", %{repo_path: repo_path} do
    assert {:ok, []} = GitTags.list_tags(repo_path)
  end

  test "lists a lightweight tag", %{repo_path: repo_path} do
    System.cmd("git", ["tag", "v1.0.0"], cd: repo_path)

    assert {:ok, [%{name: "v1.0.0", date: date}]} = GitTags.list_tags(repo_path)
    assert date =~ ~r/^\d{4}-\d{2}-\d{2}$/
  end

  test "lists an annotated tag", %{repo_path: repo_path} do
    System.cmd("git", ["tag", "-a", "v1.1.0", "-m", "release"], cd: repo_path)

    assert {:ok, [%{name: "v1.1.0", date: date}]} = GitTags.list_tags(repo_path)
    assert date =~ ~r/^\d{4}-\d{2}-\d{2}$/
  end

  test "lists multiple tags, most recently created first", %{repo_path: repo_path} do
    System.cmd("git", ["tag", "-a", "v1.0.0", "-m", "first"],
      cd: repo_path,
      env: [{"GIT_COMMITTER_DATE", "2026-01-01T12:00:00"}]
    )

    System.cmd("git", ["tag", "-a", "v2.0.0", "-m", "second"],
      cd: repo_path,
      env: [{"GIT_COMMITTER_DATE", "2026-02-01T12:00:00"}]
    )

    assert {:ok, [%{name: "v2.0.0"}, %{name: "v1.0.0"}]} = GitTags.list_tags(repo_path)
  end
end
