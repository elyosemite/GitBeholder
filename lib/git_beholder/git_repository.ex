defmodule GitBeholder.GitRepository do
  def root_path do
    try do
      loader = Application.get_env(:git_beholder, :property_loader, GitBeholder.PropertyLoader)
      root_dir = loader.get_root_directory()

      repos =
        root_dir
        |> File.ls!()
        |> Enum.map(&Path.join(root_dir, &1))
        |> Enum.filter(&File.dir?/1)
        |> Enum.filter(fn dir -> File.dir?(Path.join(dir, ".git")) end)
        |> Enum.map(&Path.basename/1)

      {:ok, repos, root_dir}
    rescue
      e in File.Error ->
        {:error, "File system error: #{Exception.message(e)}"}
      e ->
        {:error, "Unknown error: #{Exception.message(e)}"}
    end
  end
end
