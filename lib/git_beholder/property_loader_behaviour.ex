defmodule GitBeholder.PropertyLoaderBehaviour do
  @callback get_root_directory() :: String.t()
end
