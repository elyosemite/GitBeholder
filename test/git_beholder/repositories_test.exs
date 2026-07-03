defmodule GitBeholder.RepositoriesTest do
  use GitBeholder.DataCase, async: true

  alias GitBeholder.Repositories

  describe "list_workspaces/0" do
    test "returns all workspaces" do
      {:ok, workspace_a} = Repositories.create_workspace(%{name: "Engineering"})
      {:ok, workspace_b} = Repositories.create_workspace(%{name: "Sales"})

      ids = Repositories.list_workspaces() |> Enum.map(& &1.id)

      assert workspace_a.id in ids
      assert workspace_b.id in ids
    end
  end

  describe "create_workspace/1" do
    test "creates a workspace with a valid name" do
      assert {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
      assert workspace.name == "Engineering"
    end

    test "returns an error changeset without a name" do
      assert {:error, changeset} = Repositories.create_workspace(%{})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "create_folder/1" do
    setup do
      {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
      %{workspace: workspace}
    end

    test "creates a top-level folder", %{workspace: workspace} do
      assert {:ok, folder} =
               Repositories.create_folder(%{name: "Backend", workspace_id: workspace.id})

      assert folder.parent_folder_id == nil
    end

    test "creates a nested folder", %{workspace: workspace} do
      {:ok, parent} = Repositories.create_folder(%{name: "Backend", workspace_id: workspace.id})

      assert {:ok, child} =
               Repositories.create_folder(%{
                 name: "Payments",
                 workspace_id: workspace.id,
                 parent_folder_id: parent.id
               })

      assert child.parent_folder_id == parent.id
    end
  end

  describe "list_folders/1" do
    test "returns only folders belonging to the given workspace" do
      {:ok, workspace_a} = Repositories.create_workspace(%{name: "Engineering"})
      {:ok, workspace_b} = Repositories.create_workspace(%{name: "Sales"})

      {:ok, folder_a} =
        Repositories.create_folder(%{name: "Backend", workspace_id: workspace_a.id})

      {:ok, _folder_b} =
        Repositories.create_folder(%{name: "Pricing", workspace_id: workspace_b.id})

      assert [%{id: id}] = Repositories.list_folders(workspace_a.id)
      assert id == folder_a.id
    end
  end

  describe "create_repository/1" do
    setup do
      {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
      %{workspace: workspace}
    end

    test "registers a repository at the workspace root", %{workspace: workspace} do
      assert {:ok, repository} =
               Repositories.create_repository(%{
                 name: "payment_service",
                 path: "/tmp/payment_service",
                 workspace_id: workspace.id
               })

      assert repository.folder_id == nil
    end
  end

  describe "list_repositories/1" do
    test "returns only repositories belonging to the given workspace" do
      {:ok, workspace_a} = Repositories.create_workspace(%{name: "Engineering"})
      {:ok, workspace_b} = Repositories.create_workspace(%{name: "Sales"})

      {:ok, repository_a} =
        Repositories.create_repository(%{
          name: "payment_service",
          path: "/tmp/payment_service",
          workspace_id: workspace_a.id
        })

      {:ok, _repository_b} =
        Repositories.create_repository(%{
          name: "pricing_service",
          path: "/tmp/pricing_service",
          workspace_id: workspace_b.id
        })

      assert [%{id: id}] = Repositories.list_repositories(workspace_a.id)
      assert id == repository_a.id
    end
  end

  describe "fetch_repository/2" do
    setup do
      {:ok, workspace} = Repositories.create_workspace(%{name: "Engineering"})
      %{workspace: workspace}
    end

    test "returns :not_found for an unknown repository id", %{workspace: workspace} do
      assert {:error, :not_found} = Repositories.fetch_repository(workspace.id, -1)
    end

    test "returns :not_found when the repository belongs to a different workspace" do
      {:ok, workspace_a} = Repositories.create_workspace(%{name: "Engineering"})
      {:ok, workspace_b} = Repositories.create_workspace(%{name: "Sales"})

      {:ok, repository} =
        Repositories.create_repository(%{
          name: "payment_service",
          path: System.tmp_dir!(),
          workspace_id: workspace_a.id
        })

      assert {:error, :not_found} =
               Repositories.fetch_repository(workspace_b.id, repository.id)
    end

    test "returns :path_unavailable when the registered path no longer exists", %{
      workspace: workspace
    } do
      {:ok, repository} =
        Repositories.create_repository(%{
          name: "ghost_repo",
          path: "/nonexistent/path/for/sure",
          workspace_id: workspace.id
        })

      assert {:error, :path_unavailable} =
               Repositories.fetch_repository(workspace.id, repository.id)
    end

    test "returns {:ok, repository} when the path exists and is a git repo", %{
      workspace: workspace
    } do
      project_root = File.cwd!()

      {:ok, repository} =
        Repositories.create_repository(%{
          name: "git_beholder",
          path: project_root,
          workspace_id: workspace.id
        })

      assert {:ok, ^repository} = Repositories.fetch_repository(workspace.id, repository.id)
    end
  end
end
