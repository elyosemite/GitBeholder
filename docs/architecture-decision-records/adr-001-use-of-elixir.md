# ARD 001 - Use of Elixir and Phoenix

**Status**: `Approved`

## Context
GitBeholder is a **Git Management Tool**. To develop this backend system we need a stack that makes it easy to work with distributed systems with file system access capabilities, manipulation of many files through lightweight processes. All system resources can be exported to a local API that will be consumed by a desktop frontend.

## Decision
We chose the combination of Elixir and Phoenix for the development of GitBeholder. This stack was selected for its advanced distributed capabilities and ease of use. It aligns well with the goal of GitBeholder.

## Alternatives Considered
Before deciding to use Elixir + Phoenix, we considered .NET, C++ and TypeScript. While they offer some features, they are not as easy to use and seem less practical for GitBeholder's specific use cases.

## Consequences

**Positive**:
- **Efficiency and Productivity**: This chosen stack makes it easy to manipulate the File System in multiple lightweight processes.

**Negative**:
- **Stack Maintenance**: It would be necessary to maintain a team specialized in this stack, which could present challenges in terms of hiring and training.
- **Learning Curve**: Team members unfamiliar with Elixir and functional programming aspectsmight face an initial learning curve.