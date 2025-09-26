import { merge_trees } from "../src/merge_trees.js";
import type { Node } from "../src/types.js";

function print(title: string, result: Node) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(result, null, 2));
}

// 1) Identity
const sameA: Node = {
  tag: "div",
  attributes: { class: "box" },
  children: [{ text: "Hi" }],
};
const sameB: Node = {
  tag: "div",
  attributes: { class: "box" },
  children: [{ text: "Hi" }],
};
print("Identity (same nodes)", merge_trees(sameA, sameB));

// 2) Only one side present
const onlyLeft: Node = { tag: "p", children: [{ text: "solo" }] };
// @ts-expect-error simulate missing right side
print("Only left (clone)", merge_trees(onlyLeft, undefined));
// @ts-expect-error simulate missing left side
print(
  "Only right (clone)",
  merge_trees(undefined, { tag: "p", children: [{ text: "solo" }] }),
);

// 3) Text nodes
const t1: Node = { text: "old" };
const t2: Node = { text: "new" };
print("Text nodes (tree2 wins)", merge_trees(t1, t2));

// 4) Elements
const e1: Node = {
  tag: "div",
  attributes: { id: "root", class: "old" },
  children: [{ tag: "p", children: [{ text: "One" }] }],
};
const e2: Node = {
  tag: "div",
  attributes: { class: "new", "data-x": "1" },
  children: [{ tag: "p", children: [{ text: "One (updated)" }] }],
};
print("Elements merged", merge_trees(e1, e2));

// 5) Mismatched types
const m1: Node = { tag: "span", children: [{ text: "plain" }] };
const m2: Node = {
  tag: "span",
  children: [{ tag: "strong", children: [{ text: "bold" }] }],
};
print("Mismatched (element ↔ text)", merge_trees(m1, m2));

// 6) Children merging
const c1: Node = {
  tag: "ul",
  children: [
    { tag: "li", children: [{ text: "A" }] },
    { tag: "li", children: [{ text: "B(old)" }] },
  ],
};
const c2: Node = {
  tag: "ul",
  children: [
    { tag: "li", children: [{ text: "A" }] },
    { tag: "li", children: [{ text: "B(new)" }] },
    { tag: "li", children: [{ text: "C" }] },
  ],
};
print("Children merged", merge_trees(c1, c2));

// 7) Root tag change
const r1: Node = { tag: "section", attributes: { "data-x": "1" } };
const r2: Node = { tag: "article", attributes: { id: "a" } };
print("Root tag change", merge_trees(r1, r2));

// 8) Immutability (inputs unchanged)
const im1: Node = {
  tag: "div",
  attributes: { class: "a", id: "x" },
  children: [{ tag: "p", children: [{ text: "A" }] }],
};
const im2: Node = {
  tag: "div",
  attributes: { class: "b" },
  children: [
    { tag: "p", children: [{ text: "B" }] },
    { tag: "em", children: [{ text: "C" }] },
  ],
};
print("Immutability", merge_trees(im1, im2));
console.log("\nOriginal inputs remain the same:");
console.log(JSON.stringify(im1, null, 2));
console.log(JSON.stringify(im2, null, 2));
