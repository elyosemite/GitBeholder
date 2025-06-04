defmodule GitBeholder.PropertyLoader do
    @json_path Path.join(:code.priv_dir(:git_beholder), "properties.json")

    def get_property(key) when is_binary(key) do
      with {:ok, body} <- File.read(@json_path),
           {:ok, props} <- Jason.decode(body) do
        Map.get(props, key)
      else
        _ -> nil
      end
    end

    def get_root_directory do
      case get_property("rootDirectory") do
        dir when is_binary(dir) and dir != "" ->
          dir

        _ ->
          "./repositories"
      end
    end
  end
