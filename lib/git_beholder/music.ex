defmodule GitBeholder.Music do
  def create("ok") do
    {:ok, %{title: "In the End", artist: "Linkin Park", album: "Meteora"}}
  end

  def create("error") do
    {:error, "error while creating music"}
  end
end
