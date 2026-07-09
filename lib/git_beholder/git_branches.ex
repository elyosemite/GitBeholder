defmodule GitBeholder.GitBranches do
  def list_branches(repo_path) do
    if File.dir?(Path.join(repo_path, ".git")) do
      args = [
        "for-each-ref",
        "--format=%(HEAD)|%(refname:short)|%(upstream)",
        "refs/heads"
      ]

      case System.cmd("git", args, cd: repo_path, stderr_to_stdout: true) do
        {output, 0} ->
          branches =
            output
            |> String.trim()
            |> String.split("\n", trim: true)
            |> Enum.map(fn line ->
              [head, name, upstream] = String.split(line, "|", parts: 3)

              %{
                name: name,
                current: head == "*",
                origin: upstream != ""
              }
            end)

          {:ok, branches}

        {error_msg, _exit_code} ->
          {:error, error_msg}
      end
    else
      {:error, "Not a valid Git repository"}
    end
  end
end
