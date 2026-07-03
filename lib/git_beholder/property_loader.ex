defmodule GitBeholder.PropertyLoader do
  require Logger

  @json_path Path.join(:code.priv_dir(:git_beholder), "properties.json")

  @spec get_property(binary()) :: {:ok, any()} | {:error, String.t()}
  def get_property(key) when is_binary(key) do
    with {:ok, body} <- File.read(@json_path),
         {:ok, props} <- Jason.decode(body) do
      {:ok, Map.get(props, key)}
    else
      {:error, reason} when is_atom(reason) ->
        {:error, "Failed to read #{@json_path}: #{reason}"}

      {:error, %Jason.DecodeError{} = err} ->
        {:error, "Failed to parse #{@json_path}: #{Exception.message(err)}"}
    end
  end

  @spec get_root_directory() :: binary()
  def get_root_directory do
    case get_property("rootDirectory") do
      {:ok, dir} when is_binary(dir) and dir != "" ->
        dir

      {:error, reason} ->
        Logger.warning("Could not load rootDirectory from properties: #{reason}, using default")
        "./repositories"

      _ ->
        "./repositories"
    end
  end
end
