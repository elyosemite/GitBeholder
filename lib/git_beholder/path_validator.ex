defmodule GitBeholder.PathValidator do
  @moduledoc """
  Validates and sanitizes filesystem paths to prevent path traversal attacks.

  All user-supplied paths are resolved and checked against the configured
  root directory to ensure they cannot escape the allowed repository tree.
  """

  @doc """
  Validates that the given `path` resolves to a location within the
  configured root directory. Returns `{:ok, resolved_path}` on success
  or `{:error, reason}` if the path escapes the allowed root.
  """
  @spec validate_repo_path(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def validate_repo_path(path) when is_binary(path) do
    root = root_directory()
    resolved_root = Path.expand(root)
    resolved_path = Path.expand(path)

    if String.starts_with?(resolved_path, resolved_root <> "/") or resolved_path == resolved_root do
      if File.dir?(resolved_path) do
        {:ok, resolved_path}
      else
        {:error, "Path does not exist or is not a directory"}
      end
    else
      {:error, "Path is outside the allowed repository root"}
    end
  end

  def validate_repo_path(_), do: {:error, "Path must be a string"}

  @doc """
  Validates that `file_path` does not contain path traversal sequences
  and stays within the given `repo_path`.
  """
  @spec validate_file_path(String.t(), String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def validate_file_path(_repo_path, file_path) when is_binary(file_path) do
    cond do
      String.starts_with?(file_path, "/") ->
        {:error, "File path escapes the repository directory"}

      String.contains?(file_path, "..") ->
        {:error, "File path escapes the repository directory"}

      true ->
        {:ok, file_path}
    end
  end

  def validate_file_path(_, _), do: {:error, "Paths must be strings"}

  defp root_directory do
    loader = Application.get_env(:git_beholder, :property_loader, GitBeholder.PropertyLoader)
    loader.get_root_directory()
  end
end
