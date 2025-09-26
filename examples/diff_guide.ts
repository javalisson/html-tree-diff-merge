import { find_differences } from "../src/find_differences.js";
import type { Node, Difference } from "../src/types.js";

function print(title: string, diffs: Difference[]) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(diffs, null, 2));
}

// 1) Identity
const idA: Node = {
  tag: "div",
  attributes: { class: "box" },
  children: [{ text: "Hi" }],
};
const idB: Node = {
  tag: "div",
  attributes: { class: "box" },
  children: [{ text: "Hi" }],
};
print("Identity (no diffs)", find_differences(idA, idB));

// 2) Text
const tA: Node = { text: "Hello" };
const tB: Node = { text: "Hello, world!" };
print("Text modification", find_differences(tA, tB));

// 3) Attributes
const aA: Node = { tag: "div", attributes: { class: "a", title: "old" } };
const aB: Node = { tag: "div", attributes: { class: "b", id: "x" } };
print("Attributes add/remove/modify", find_differences(aA, aB));

// 4) Children
const cA: Node = {
  tag: "ul",
  children: [{ tag: "li", children: [{ text: "One" }] }],
};
const cB: Node = {
  tag: "ul",
  children: [
    { tag: "li", children: [{ text: "One" }] },
    { tag: "li", children: [{ text: "Two" }] },
  ],
};
print("Child added", find_differences(cA, cB));
print("Child removed", find_differences(cB, cA));

// 5) Tag changes
const tagA: Node = {
  tag: "div",
  children: [{ tag: "p", children: [{ text: "T" }] }],
};
const tagB: Node = {
  tag: "div",
  children: [{ tag: "h1", children: [{ text: "T" }] }],
};
print("Tag change p → h1", find_differences(tagA, tagB));

// 6) Type swaps
const swapA: Node = { tag: "span", children: [{ text: "plain" }] };
const swapB: Node = {
  tag: "span",
  children: [{ tag: "strong", children: [{ text: "plain" }] }],
};
print("Type swap (text → element)", find_differences(swapA, swapB));

// 7) Missing fields
const missA: Node = { tag: "div" };
const missB: Node = {
  tag: "div",
  attributes: { id: "root" },
  children: [{ text: "x" }],
};
print("Missing → empty defaults", find_differences(missA, missB));

// 8) Ordering
const ordA: Node = {
  tag: "section",
  attributes: { z: 1, a: 1 },
  children: [
    { tag: "p", children: [{ text: "A" }] },
    { tag: "em", children: [{ text: "x" }] },
  ],
};
const ordB: Node = {
  tag: "article",
  attributes: { a: 2, m: 0 },
  children: [{ tag: "p", children: [{ text: "B" }] }],
};
print("Deterministic order", find_differences(ordA, ordB));

// 9) Combined scenario
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
print("README example", find_differences(beforeEdit, afterEdit));
