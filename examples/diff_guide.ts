import { find_differences } from "../src/find_differences.js";
import type { Node, Difference } from "../src/types.js";

function print(title: string, diffs: Difference[]) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(diffs, null, 2));
}

/* --------------------------------------------------
   1) Both missing → no diffs
-------------------------------------------------- */
const noneA: Node | undefined = undefined;
const noneB: Node | undefined = undefined;
print("1) Both missing", find_differences(noneA as any, noneB as any));
/*
[]
*/

/* --------------------------------------------------
   2) Only right present → added
-------------------------------------------------- */
const onlyRight: Node = { tag: "p", children: [{ text: "new" }] };
print("2) Only right present", find_differences(undefined as any, onlyRight));
/*
[
  { "type": "added", "path": [], "newValue": { "tag": "p", "children": [{ "text": "new" }] } }
]
*/

/* --------------------------------------------------
   3) Only left present → removed
-------------------------------------------------- */
const onlyLeft: Node = { tag: "p", children: [{ text: "old" }] };
print("3) Only left present", find_differences(onlyLeft, undefined as any));
/*
[
  { "type": "removed", "path": [], "oldValue": { "tag": "p", "children": [{ "text": "old" }] } }
]
*/

/* --------------------------------------------------
   4) Text nodes (equal) → no diffs
-------------------------------------------------- */
const tEqA: Node = { text: "same" };
const tEqB: Node = { text: "same" };
print("4) Text equal", find_differences(tEqA, tEqB));
/*
[]
*/

/* --------------------------------------------------
   5) Text nodes (different) → modified at `text`
-------------------------------------------------- */
const tA: Node = { text: "Hello" };
const tB: Node = { text: "Hello, world!" };
print("5) Text modified", find_differences(tA, tB));
/*
[
  { "type": "modified", "path": ["text"], "oldValue": "Hello", "newValue": "Hello, world!" }
]
*/

/* --------------------------------------------------
   6) Mismatched types (element ↔ text) → remove + add
-------------------------------------------------- */
const misA: Node = { tag: "span", children: [{ text: "plain" }] };
const misB: Node = {
  tag: "span",
  children: [{ tag: "strong", children: [{ text: "plain" }] }],
};
print("6) Mismatch (text ↔ element)", find_differences(misA, misB));
/*
[
  { "type": "removed", "path": ["children", 0, "text"], "oldValue": "plain" },
  { "type": "added",   "path": ["children", 0, "tag"],  "newValue": "strong" }
]
*/

/* --------------------------------------------------
   7) Elements with same tag → continue
-------------------------------------------------- */
const sameTagA: Node = { tag: "div", children: [{ text: "X" }] };
const sameTagB: Node = { tag: "div", children: [{ text: "X" }] };
print(
  "7) Elements with same tag (no diff yet)",
  find_differences(sameTagA, sameTagB),
);
/*
[]
*/

/* --------------------------------------------------
   8) Elements with different tags → removed + added at `tag`
-------------------------------------------------- */
const tagA: Node = {
  tag: "div",
  children: [{ tag: "p", children: [{ text: "T" }] }],
};
const tagB: Node = {
  tag: "div",
  children: [{ tag: "h1", children: [{ text: "T" }] }],
};
print("8) Tag change p → h1", find_differences(tagA, tagB));
/*
[
  { "type": "removed", "path": ["children", 0, "tag"], "oldValue": "p" },
  { "type": "added",   "path": ["children", 0, "tag"], "newValue": "h1" }
]
*/

/* --------------------------------------------------
   9) Attributes → added / removed / modified
-------------------------------------------------- */
const attrsA: Node = { tag: "div", attributes: { class: "a", title: "old" } };
const attrsB: Node = { tag: "div", attributes: { class: "b", id: "x" } };
print("9) Attributes add/remove/modify", find_differences(attrsA, attrsB));
/*
[
  { "type": "modified", "path": ["attributes","class"], "oldValue": "a", "newValue": "b" },
  { "type": "removed",  "path": ["attributes","title"], "oldValue": "old" },
  { "type": "added",    "path": ["attributes","id"],    "newValue": "x" }
]
*/

/* --------------------------------------------------
   10) Children (presence by index) → added / removed
-------------------------------------------------- */
const childA1: Node = {
  tag: "ul",
  children: [{ tag: "li", children: [{ text: "One" }] }],
};
const childB1: Node = {
  tag: "ul",
  children: [
    { tag: "li", children: [{ text: "One" }] },
    { tag: "li", children: [{ text: "Two" }] },
  ],
};
print("10) Children presence (added)", find_differences(childA1, childB1));
/*
[
  { "type": "added", "path": ["children", 1], "newValue": { "tag": "li", "children": [{ "text": "Two" }] } }
]
*/

print("10) Children presence (removed)", find_differences(childB1, childA1));
/*
[
  { "type": "removed", "path": ["children", 1], "oldValue": { "tag": "li", "children": [{ "text": "Two" }] } }
]
*/

/* --------------------------------------------------
   11) Recursion into paired children
-------------------------------------------------- */
const recA: Node = {
  tag: "div",
  children: [{ tag: "p", children: [{ text: "A" }] }],
};
const recB: Node = {
  tag: "div",
  children: [{ tag: "p", children: [{ text: "B" }] }],
};
print("11) Recursion (diff inside child[0])", find_differences(recA, recB));
/*
[
  { "type": "modified", "path": ["children",0,"children",0,"text"], "oldValue": "A", "newValue": "B" }
]
*/

/* --------------------------------------------------
   12) Combined nested scenario (ordering visible)
-------------------------------------------------- */
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
print(
  "12) Combined: class + tag + text",
  find_differences(beforeEdit, afterEdit),
);
/*
[
  { "type": "modified", "path": ["attributes","class"], "oldValue": "container", "newValue": "container updated" },
  { "type": "removed",  "path": ["children",0,"tag"], "oldValue": "p" },
  { "type": "added",    "path": ["children",0,"tag"], "newValue": "h1" },
  { "type": "modified", "path": ["children",0,"children",0,"text"], "oldValue": "Hello World", "newValue": "Welcome!" }
]
*/
