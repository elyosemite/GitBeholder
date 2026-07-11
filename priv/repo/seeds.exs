# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Seeds a single workspace/folder/repository so the desktop app has
# something to select while real repository registration isn't built yet.
# Points at this checkout itself, since the git-backed endpoints
# (branches/log/status) need a real .git directory to shell out against.

alias GitBeholder.Repositories

{:ok, workspace} = Repositories.create_workspace(%{name: "Personal"})
{:ok, folder} = Repositories.create_folder(%{name: "Projects", workspace_id: workspace.id})

{:ok, _repository} =
  Repositories.create_repository(%{
    name: "GitBeholder",
    path: File.cwd!(),
    workspace_id: workspace.id,
    folder_id: folder.id
  })
