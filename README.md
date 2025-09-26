# HTML Tree Diff & Merge

This project provides two core functions for working with HTML-like trees:

- **`find_differences`** — compare two trees and list all differences.
- **`merge_trees`** — merge two trees, where tree2 overrides tree1 on conflicts.

Both functions are implemented in TypeScript with a focus on simplicity, legibility, correctness, and recursion.

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd html-tree-diff-merge
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Test

```bash
npm test
```

### 4. Format

Format all files under `src/`, `tests/`, and `examples/`:

```bash
npm run format
```

Check formatting without modifying:

```bash
npm run format:check
```

### 5. Clean build artifacts

```bash
npm run clean
```

---

## Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run build`        | Compile TypeScript to JavaScript             |
| `npm test`             | Run test suite with Vitest                   |
| `npm run format`       | Format code in `src/`, `tests/`, `examples/` |
| `npm run format:check` | Verify formatting without writing changes    |
| `npm run clean`        | Remove build artifacts (`dist/`)             |

---

## Core Functions

### `find_differences(old_tree, new_tree)`

- Compares two HTML-like trees.
- Reports **added**, **removed**, or **modified** nodes.
- Deterministic: diffs always come in the same order.

### `merge_trees(tree1, tree2)`

- Merges two HTML-like trees.
- **tree2 wins** on conflicts (tags, attributes, children).
- **tree1 contributes** only where tree2 does not override.
- Children are merged by index; aligned nodes are merged recursively.

---

## Guides & Examples

This project includes step-by-step guides for both tree operations:

- `examples/diff_guide.ts` → illustrates the 12 steps of the `find_differences` algorithm.
- `examples/merge_guide.ts` → illustrates the 10 steps of the `merge_trees` algorithm.

Each file walks through progressively more complex cases with inputs, outputs, and expected behavior.
They are designed to be read alongside the detailed step-by-step guides in this README.

### Running the examples

```bash
# Run the differences guide
npx tsx examples/diff_guide.ts

# Run the merge guide
npx tsx examples/merge_guide.ts
```

---

## Development Notes

- Written in TypeScript (strict mode disabled for boilerplate clarity).
- Uses Vitest for testing.
- Uses Prettier + ESLint for formatting and linting.
- Source files are under `src/`, tests under `tests/`, and runnable examples under `examples/`.
