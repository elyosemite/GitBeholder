# ADR 004 - Git Operations Executed via Ports (OS Processes)

**Status**: `Approved`

## Context

GitBeholder, as a **Git Management Tool**, must perform a variety of Git operations such as clone, fetch, pull, checkout, and branch synchronization. To support these actions reliably and with full compatibility with Git itself, we must decide how to execute Git commands within the Elixir backend.

There are two main approaches to interact with Git:

* Using a native Elixir/Erlang Git library (e.g., \[libgit2 bindings]);
* Executing the Git CLI directly as an external OS process.

## Decision

We chose to execute Git operations by invoking the **Git CLI directly via `System.cmd/3` or `Port` processes**.

This decision was made because:

* The Git CLI is the official and most complete interface;
* It guarantees compatibility with all Git features and edge cases;
* It allows better control over standard output, standard error, and exit codes;
* It is easier to debug, as developers are already familiar with the CLI interface.

Each Git command will be executed in a controlled subprocess. We will capture and parse outputs as needed, and errors will be logged and normalized using the project’s error-handling strategy.

## Alternatives Considered

* **Using Git libraries** (e.g., `libgit2` bindings or pure Elixir wrappers):
  Although promising, they are either incomplete, unmaintained, or introduce complexity and dependency management issues.

* **Git over HTTP via GitHub/GitLab APIs**:
  This method is limited to hosted repositories and lacks access to full local Git operations (e.g., offline access, filesystem-level manipulation).

## Consequences

**Positive**:

* **Full Git compatibility**: The CLI reflects the true behavior of Git, ensuring consistent results across platforms.
* **Debuggability**: Easier to test, debug, and reproduce failures using the terminal.
* **Control**: Enables precise handling of timeouts, exit codes, and streaming output.

**Negative**:

* **Error Handling Complexity**: Requires careful parsing of CLI output and handling of edge cases.
* **OS Dependency**: Depends on Git being installed and available in the system path.
* **Security Considerations**: Must ensure proper sanitization of inputs to prevent command injection.