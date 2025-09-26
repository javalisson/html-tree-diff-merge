# HTML Tree Diffing

## Problem Context

You're building a feature for a demo platform that tracks changes between two versions of the same HTML page and creates merged versions.

---

### Real-World Scenario

```javascript
// Version 1: Original webpage
const beforeEdit = {
  tag: "div",
  attributes: { class: "container" },
  children: [{ tag: "p", children: [{ text: "Hello World" }] }],
};

// Version 2: After user edits
const afterEdit = {
  tag: "div",
  attributes: { class: "container updated" },
  children: [{ tag: "h1", children: [{ text: "Welcome!" }] }],
};

// Your function detects: class changed, p->h1 change, text changed
```

---

# Your Task

Implement these two functions:

---

### 1. `find_differences(old_tree, new_tree)`

Compare two HTML trees and return an array of differences.

```javascript
// Returns: Array of difference objects
[
  {
    type: "added" | "removed" | "modified",
    path: ["children", 0, "attributes", "class"],
    oldValue: "old", // for modified/removed
    newValue: "new", // for modified/added
  },
];
```

---

### 2. `merge_trees(tree1, tree2)`

Merge two HTML trees with tree2 taking precedence in conflicts.

```javascript
// Strategy: tree2 structure wins, but merge attributes from both
// Returns: Merged HTML tree object
```

---

# Input Format & Rules

### Tree Structure

```javascript
const htmlTree = {
  tag: "div", // Element tag name
  attributes: { class: "container" }, // Optional attributes object
  children: [
    // Optional children array
    { tag: "p", children: [{ text: "Hello" }] },
    { text: "Plain text" }, // Text nodes have only 'text'
  ],
};
```

---

### Important: Element Identity Rules

➡ **Same element**: Same tag name at the same position in children array

➡ **Different elements**: Different tag names (p vs h1) OR different positions

➡ **When different**: Treat as removed + added, not modified

➡ **Only modify**: Attributes or text content within the same element

---

```javascript
/**
 * INSTRUCTIONS:
 * 1. Implement find_differences() – detect changes between two HTML trees
 * 2. Implement merge_trees() – merge two trees with conflict resolution
 * 3. Run tests to verify your implementation
 *
 * EVALUATION FOCUS:
 * – Algorithm design and efficiency
 * – Code structure and readability
 * – Edge case handling
 * – Testing and debugging approach
 */

// ====================================================================
// PART 1: find_differences(old_tree, new_tree)
// ====================================================================

/**
 * Compares two HTML trees and returns an array of differences.
 *
 * @param {Object} oldTree – The original HTML tree
 * @param {Object} newTree – The updated HTML tree
 * @returns {Array} Array of difference objects
 *
 * Difference object format:
 * {
 *   type: 'added' | 'removed' | 'modified',
 *   path: ['children', 0, 'attributes', 'class'], // Path to the change
 *   oldValue: any,   // Present for 'removed' and 'modified'
 *   newValue: any    // Present for 'added' and 'modified'
 * }
 *
 * RULES:
 * – Elements are the SAME if: same tag name AND same position
 * – Elements are DIFFERENT if: different tag names OR different positions
 * – When elements differ: treat as removed + added (not modified)
 * – Only attributes and text can be "modified"
 */
```

```javascript
function find_differences(old_tree, new_tree) {
  // TODO: Implement this function
  // Hint: Use recursion to traverse both trees
  // Hint: Build the path array as you recurse
  // Hint: Handle null/undefined gracefully

  const differences = [];

  return differences;
}
```

```javascript
// ====================================================================
// PART 2: merge_trees(tree1, tree2)
// ====================================================================

/**
 * Merges two HTML trees with tree2 taking precedence in conflicts.
 *
 * @param {Object} tree1 – First HTML tree
 * @param {Object} tree2 – Second HTML tree (takes precedence)
 * @returns {Object} Merged HTML tree
 *
 * MERGE STRATEGY:
 * – Use tree2’s structure (tag, children array structure)
 * – Merge attributes from both trees (tree2 wins on conflicts)
 * – For children: length follows tree2; when nodes at the same index
 *   share identity (same tag for elements, both text nodes), merge recursively.
 *   Otherwise, take tree2’s child.
 * – Handle null/undefined gracefully: attributes -> {}, children -> []
 */
function merge_trees(tree1, tree2) {
  // TODO: Implement this function
  // Hint: Recurse through children
  // Hint: Combine attributes with spread { ...tree1, ...tree2 }
  // Hint: Do not mutate inputs; always return a new object
  return {};
}
```

```javascript
// ====================================================================
// EXAMPLES
// ====================================================================

// Example 1: Attribute modification + tag replacement
// Input:
// tree1 = { tag: 'div', attributes: { class: 'box' }, children: [{ tag: 'p', children: [{ text: 'Hello' }] }] }
// tree2 = { tag: 'div', attributes: { class: 'box updated' }, children: [{ tag: 'h1', children: [{ text: 'Hello' }] }] }
// Output:
// { tag: 'div', attributes: { class: 'box updated' }, children: [{ tag: 'h1', children: [{ text: 'Hello' }] }] }

// Example 2: Attribute merging
// Input:
// tree1 = { tag: 'div', attributes: { id: 'main', class: 'a' } }
// tree2 = { tag: 'div', attributes: { class: 'b' } }
// Output:
// { tag: 'div', attributes: { id: 'main', class: 'b' } }

// Example 3: Children merging
// Input:
// tree1 = { tag: 'ul', children: [{ tag: 'li', children: [{ text: 'One' }] }] }
// tree2 = { tag: 'ul', children: [
//   { tag: 'li', children: [{ text: 'Two' }] },
//   { tag: 'li', children: [{ text: 'Three' }] }
// ]}
// Output:
// { tag: 'ul', children: [
//   { tag: 'li', children: [{ text: 'Two' }] },
//   { tag: 'li', children: [{ text: 'Three' }] }
// ]}
```

---

## Getting Started

- Install dependencies:

  ```bash
  npm install
  ```

- Run tests:

  ```bash
  npm test
  ```

- Run in watch mode:

  ```bash
  npm run test:watch
  ```

- Run the demo script:

  ```bash
  npm start
  ```

- Build:

  ```bash
  npm run build
  ```

```

```
