/**
 * Minimal demo runner
 *
 * Note: Keep .js extensions in imports for NodeNext ESM.
 */
import { find_differences } from "./find_differences.js";
import { merge_trees } from "./merge_trees.js";
import type { Node } from "./types.js";

const beforeEdit: Node = {
  tag: "div",
  attributes: { class: "container" },
  children: [{ tag: "p", children: [{ text: "Hello World" }] }],
};

const afterEdit: Node = {
  tag: "div",
  attributes: { class: "container updated" },
  children: [{ tag: "h1", children: [{ text: "Welcome!" }] }],
};

console.log("Diff (beforeEdit → afterEdit):");
console.log(JSON.stringify(find_differences(beforeEdit, afterEdit), null, 2));

console.log("\nMerged (tree2 wins):");
console.log(JSON.stringify(merge_trees(beforeEdit, afterEdit), null, 2));
