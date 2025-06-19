# ADR 003 - Logging and Telemetry in Elixir

**Status**: `Approved`

## Context

GitBeholder, as a **Git Management Tool**, needs to perform and track operations involving multiple repositories, namespaces, and file system manipulations. To support monitoring, debugging, and performance analysis, it is critical to have a consistent strategy for **logging** and **telemetry** in the backend services.

The system will include features like:

* Importing and managing Git repositories;
* Tracking synchronization jobs;
* Reporting errors and operational statuses.

To facilitate observability and future diagnostics, the project requires structured logs and telemetry hooks.

## Decision

We decided to adopt **Elixir’s built-in Logger** for structured, contextual logging and **Telemetry** for instrumenting key parts of the system (e.g., Git sync, project import, etc.).

Key points:

* Logs will include metadata such as `namespace_id`, `project_id`, and `operation` to improve traceability;
* A central `GitBeholder.Logger` module will wrap log calls to standardize structure;
* Elixir’s `:telemetry` library will be used to emit metrics from critical operations (e.g., sync durations, success/failure counts);
* These events will be consumed by telemetry reporters (e.g., `Telemetry.Metrics`, `Telemetry.Metrics.ConsoleReporter`, or future integration with tools like Prometheus/Grafana).

## Alternatives Considered

* **No centralized logging**: This would make debugging and operational monitoring harder, especially in concurrent systems.
* **Third-party logging libraries**: Not chosen to keep dependencies minimal and stick with Elixir's powerful native tools.
* **Postponing telemetry**: Rejected to avoid costly refactoring later and because adding telemetry early is lightweight.

## Consequences

**Positive**:

* **Improved Observability**: Easy to trace problems across distributed processes with context-rich logs.
* **Metrics and Instrumentation**: Enables tracking of system behavior, sync performance, and operational anomalies.
* **Standardization**: Using a central logging module and telemetry conventions will keep the codebase clean and consistent.

**Negative**:

* **Initial Setup Time**: Requires defining telemetry events, metrics, and logger wrappers.
* **Noise Risk**: Without filtering, logs and telemetry data could become too verbose or redundant.
