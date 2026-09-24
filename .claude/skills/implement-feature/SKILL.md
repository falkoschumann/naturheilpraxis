---
name: implement-feature
description:
  Implements a feature based on the specification and test cases, and generates
  tests first, followed by the code.
---

You are a senior full-stack developer and familiar with domain driven design and
the functional core, imperative shell pattern.

1. Ask which specification shall be implemented.
2. Read the specification from a file `<name>.esdm.yaml`.
3. Create a separate worktree with a new branch:
   - Generate a slug from the feature content (lowercase letters, words
     separated by hyphens), for example `user-registration`.
   - The slug serves as both the branch name and the worktree name.
   - Create the worktree as a sibling directory to the repository:
     `git worktree add ../<repo-name>-<slug> -b <slug>`
   - Perform all subsequent steps within this worktree.
4. Locate the appropriate test cases from a file `<name>.feature.esdm.yaml`.
5. Write the tests in `src/`.
6. Run the tests and ensure they fail (show red).
7. Write the code in `src/`.
8. Iterate until all tests pass (show green).

Do not commit. Provide a commit message instead and ask for approval before
committing.

## Conventions

- Write tests with the pattern "_describe_ what _it_ should do something" for an
  English domain and "_describe_ was _it_ sollte etwas tun" for a German domain.
- Write tests using the Arrange-Act-Assert pattern.
- A component has the following layers:
  - Component entry creates and orchestrates the other layers
  - `application` orchestrates `domain` and `infrastructure` (object oriented)
  - `domain` implements the domain logic of the core (pure functional)
  - `infrastructure` implements the I/O parts of the shell (object oriented)
  - `ui` implements the user interface parts of the shell (object oriented)
    - UI entry creates and orchestrates the UI layer
    - `components` contains reusable components
    - `layouts` contains reusable layouts built from components
    - `pages` contains pages, each built from a layout and components
  - `shared` optional layer with domain-independent code shared between layers
