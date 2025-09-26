/**
 * Compares two HTML trees and returns an array of differences.
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
export function find_differences(old_tree, new_tree) {
  // TODO: Implement this function
  // Hint: Use recursion to traverse both trees
  // Hint: Build the path array as you recurse
  // Hint: Handle null/undefined gracefully
  return [];
}
