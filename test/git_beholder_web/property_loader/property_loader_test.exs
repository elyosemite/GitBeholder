defmodule GitBeholder.PropertyLoaderTest do
  use ExUnit.Case, async: true

  alias GitBeholder.PropertyLoader

  @test_json_path Path.join([:code.priv_dir(:git_beholder), "properties.json"])

  setup do
    # back up properties.json and create properties.json for testing
    if File.exists?(@test_json_path) do
      File.rename!(@test_json_path, @test_json_path <> ".bak")
    end

    on_exit(fn ->
      # Restore the original file after the test
      if File.exists?(@test_json_path <> ".bak") do
        File.rm!(@test_json_path)
        File.rename!(@test_json_path <> ".bak", @test_json_path)
      else
        File.rm_rf!(@test_json_path)
      end
    end)

    :ok
  end

  test "get_property/1 returns value from properties.json" do
    File.write!(@test_json_path, ~s({"rootDirectory": "/tmp/test_repos", "foo": "bar"}))
    assert PropertyLoader.get_property("rootDirectory") == "/tmp/test_repos"
    assert PropertyLoader.get_property("foo") == "bar"
  end

  test "get_property/1 returns nil if key does not exist" do
    File.write!(@test_json_path, ~s({"rootDirectory": "/tmp/test_repos"}))
    assert PropertyLoader.get_property("not_exist") == nil
  end

  test "get_root_directory returns value from properties.json if present" do
    File.write!(@test_json_path, ~s({"rootDirectory": "/tmp/test_repos"}))
    assert PropertyLoader.get_root_directory() == "/tmp/test_repos"
  end

  test "get_root_directory returns default path if rootDirectory is missing" do
    File.write!(@test_json_path, ~s({"foo": "bar"}))
    assert PropertyLoader.get_root_directory() == "./repositories"
  end
end
