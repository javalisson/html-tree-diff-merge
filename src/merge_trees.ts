/**
 * Merges two HTML trees with tree2 taking precedence in conflicts.
 *
 * MERGE STRATEGY:
 * – Use tree2’s structure (tag, children array structure)
 * – Merge attributes from both trees (tree2 wins on conflicts)
 * – For children: length follows tree2; when nodes at the same index
 *   share identity (same tag for elements, both text nodes), merge recursively.
 *   Otherwise, take tree2’s child.
 * – Handle null/undefined gracefully: attributes -> {}, children -> []
 */
export function merge_trees(tree1, tree2) {
  // TODO: Implement this function
  // Hint: Recurse through children
  // Hint: Combine attributes with spread { ...tree1, ...tree2 }
  // Hint: Do not mutate inputs; always return a new object
  return tree2;
}
