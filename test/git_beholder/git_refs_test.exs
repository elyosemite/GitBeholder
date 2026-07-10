defmodule GitBeholder.GitRefsTest do
  use ExUnit.Case, async: true

  alias GitBeholder.GitRefs

  setup do
    repo_path = Path.join(System.tmp_dir!(), "git_refs_test_#{System.unique_integer([:positive])}")
    File.mkdir_p!(repo_path)

    System.cmd("git", ["init", "-q"], cd: repo_path)
    System.cmd("git", ["config", "user.email", "test@test.com"], cd: repo_path)
    System.cmd("git", ["config", "user.name", "Test"], cd: repo_path)

    on_exit(fn -> File.rm_rf!(repo_path) end)

    %{repo_path: repo_path}
  end

  defp commit(repo_path, message) do
    File.write!(Path.join(repo_path, "file.txt"), message)
    System.cmd("git", ["add", "file.txt"], cd: repo_path)
    System.cmd("git", ["commit", "-q", "-m", message], cd: repo_path)
    {sha, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: repo_path)
    String.trim(sha)
  end

  defp current_branch(repo_path) do
    {name, 0} = System.cmd("git", ["rev-parse", "--abbrev-ref", "HEAD"], cd: repo_path)
    String.trim(name)
  end

  test "the tip of the current branch is decorated as local + current", %{repo_path: repo_path} do
    sha = commit(repo_path, "first")
    branch = current_branch(repo_path)

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    assert [%{name: ^branch, type: "branch", current: true, local: true, platform: nil}] =
             decorations[sha]
  end

  test "older commits behind the branch tip have no decorations", %{repo_path: repo_path} do
    older_sha = commit(repo_path, "first")
    commit(repo_path, "second")

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    refute Map.has_key?(decorations, older_sha)
  end

  test "a non-current local branch is decorated without current", %{repo_path: repo_path} do
    sha = commit(repo_path, "first")
    System.cmd("git", ["branch", "feature"], cd: repo_path)

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    names = decorations[sha] |> Enum.map(& &1.name) |> Enum.sort()
    assert names == [current_branch(repo_path), "feature"] |> Enum.sort()

    feature_ref = Enum.find(decorations[sha], &(&1.name == "feature"))
    assert %{current: false, local: true, platform: nil} = feature_ref
  end

  test "lightweight and annotated tags on the same commit are both decorated", %{repo_path: repo_path} do
    sha = commit(repo_path, "first")
    System.cmd("git", ["tag", "v1.0-lightweight"], cd: repo_path)
    System.cmd("git", ["tag", "-a", "v1.0-annotated", "-m", "release"], cd: repo_path)

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    tag_names =
      decorations[sha]
      |> Enum.filter(&(&1.type == "tag"))
      |> Enum.map(& &1.name)
      |> Enum.sort()

    assert tag_names == ["v1.0-annotated", "v1.0-lightweight"]
  end

  test "a remote-tracking branch on a known host resolves its platform", %{repo_path: repo_path} do
    commit(repo_path, "first")
    {head_sha, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: repo_path)
    head_sha = String.trim(head_sha)

    System.cmd("git", ["remote", "add", "origin", "git@github.com:someone/somerepo.git"], cd: repo_path)
    System.cmd("git", ["update-ref", "refs/remotes/origin/main", head_sha], cd: repo_path)

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    main_ref = Enum.find(decorations[head_sha], &(&1.name == "main"))
    assert main_ref.platform == "github"
  end

  test "a remote on an unrecognized host resolves to a nil platform", %{repo_path: repo_path} do
    commit(repo_path, "first")
    {head_sha, 0} = System.cmd("git", ["rev-parse", "HEAD"], cd: repo_path)
    head_sha = String.trim(head_sha)

    System.cmd("git", ["remote", "add", "origin", "https://git.internal.example/team/repo.git"], cd: repo_path)
    System.cmd("git", ["update-ref", "refs/remotes/origin/main", head_sha], cd: repo_path)

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    main_ref = Enum.find(decorations[head_sha], &(&1.name == "main"))
    assert main_ref.platform == nil
  end

  test "a local branch and its same-named remote-tracking ref merge into one CommitRef", %{
    repo_path: repo_path
  } do
    sha = commit(repo_path, "first")
    branch = current_branch(repo_path)

    System.cmd("git", ["remote", "add", "origin", "git@github.com:someone/somerepo.git"], cd: repo_path)
    System.cmd("git", ["update-ref", "refs/remotes/origin/#{branch}", sha], cd: repo_path)

    assert {:ok, decorations} = GitRefs.decorations_by_commit(repo_path)

    assert [%{name: ^branch, type: "branch", current: true, local: true, platform: "github"}] =
             decorations[sha]
  end

  test "returns :error for a path that isn't a git repository" do
    assert {:error, _reason} = GitRefs.decorations_by_commit(System.tmp_dir!())
  end
end
