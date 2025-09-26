import { merge_trees } from "../src/merge_trees.js";
import type { Node } from "../src/types.js";

function print(title: string, result: Node) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(result, null, 2));
}

/* --------------------------------------------------
   1) Both missing → nothing
-------------------------------------------------- */
// (Demonstration only; your public API usually won’t call this)
const mNoneA: Node | undefined = undefined;
const mNoneB: Node | undefined = undefined;
// @ts-expect-error demo
// print('1) Both missing', merge_trees(mNoneA, mNoneB));

/* --------------------------------------------------
   2) Only one side present → return that side (clone)
-------------------------------------------------- */
const mOnlyLeft: Node = { tag: "p", children: [{ text: "left" }] };
const mOnlyRight: Node = { tag: "p", children: [{ text: "right" }] };
// @ts-expect-error simulate missing right
print("2) Only left present", merge_trees(mOnlyLeft, undefined));
// @ts-expect-error simulate missing left
print("2) Only right present", merge_trees(undefined, mOnlyRight));

/* --------------------------------------------------
   3) Both text nodes → take text from right
-------------------------------------------------- */
const mtA: Node = { text: "old" };
const mtB: Node = { text: "new" };
print("3) Text nodes", merge_trees(mtA, mtB));
/*
{ "text": "new" }
*/

/* --------------------------------------------------
   4) Mismatched types (element ↔ text) → take right verbatim
-------------------------------------------------- */
const mmA: Node = { tag: "span", children: [{ text: "plain" }] };
const mmB: Node = { text: "replaced" };
print("4) Mismatch (take right)", merge_trees(mmA, mmB));
/*
{ "text": "replaced" }
*/

/* --------------------------------------------------
   5) Both elements → result tag from right
-------------------------------------------------- */
const tagLeft: Node = { tag: "section", attributes: { "data-x": "1" } };
const tagRight: Node = { tag: "article", attributes: { id: "a" } };
print("5) Result tag = right", merge_trees(tagLeft, tagRight));
/*
{ "tag": "article", "attributes": { "data-x": "1", "id": "a" } }
*/

/* --------------------------------------------------
   6) Attributes → shallow merge (right overrides)
-------------------------------------------------- */
const attrLeft: Node = { tag: "div", attributes: { class: "old", id: "root" } };
const attrRight: Node = {
  tag: "div",
  attributes: { class: "new", "data-x": "1" },
};
print("6) Attributes merged", merge_trees(attrLeft, attrRight));
/*
{ "tag": "div", "attributes": { "class": "new", "id": "root", "data-x": "1" } }
*/

/* --------------------------------------------------
   7) Children → follow right’s order/length (align or replace)
-------------------------------------------------- */
const chLeft: Node = {
  tag: "ul",
  children: [
    { tag: "li", children: [{ text: "A" }] },
    { tag: "li", children: [{ text: "B(old)" }] },
  ],
};
const chRight: Node = {
  tag: "ul",
  children: [
    { tag: "li", children: [{ text: "A" }] }, // aligned with left[0] (same tag) → deep merge
    { tag: "li", children: [{ text: "B(new)" }] }, // aligned with left[1] → deep merge text
    { tag: "li", children: [{ text: "C" }] }, // extra → taken verbatim from right
  ],
};
print("7) Children merged", merge_trees(chLeft, chRight));
/*
{
  "tag": "ul",
  "children": [
    { "tag": "li", "children": [{ "text": "A" }] },
    { "tag": "li", "children": [{ "text": "B(new)" }] },
    { "tag": "li", "children": [{ "text": "C" }] }
  ]
}
*/

/* --------------------------------------------------
   8) Return element result
-------------------------------------------------- */
const retLeft: Node = {
  tag: "div",
  attributes: { class: "a" },
  children: [{ tag: "p", children: [{ text: "X" }] }],
};
const retRight: Node = {
  tag: "div",
  attributes: { class: "b" },
  children: [
    { tag: "p", children: [{ text: "Y" }] },
    { tag: "em", children: [{ text: "Z" }] },
  ],
};
print("8) Returned element", merge_trees(retLeft, retRight));

/* --------------------------------------------------
   9) Fallback (unusual shapes) → clone right
-------------------------------------------------- */
const weirdLeft: any = { weird: true };
const weirdRight: Node = { tag: "div" };
// @ts-expect-error demo unusual left shape
print("9) Fallback to right clone", merge_trees(weirdLeft, weirdRight));
/*
{ "tag": "div" }
*/

/* --------------------------------------------------
   10) Immutability & determinism (inputs unchanged)
-------------------------------------------------- */
const imLeft: Node = {
  tag: "div",
  attributes: { class: "a", id: "x" },
  children: [{ tag: "p", children: [{ text: "A" }] }],
};
const imRight: Node = {
  tag: "div",
  attributes: { class: "b" },
  children: [
    { tag: "p", children: [{ text: "B" }] },
    { tag: "em", children: [{ text: "C" }] },
  ],
};
const merged = merge_trees(imLeft, imRight);
print("10) Immutability result", merged);
console.log("10) Inputs unchanged?");
console.log(JSON.stringify(imLeft, null, 2));
console.log(JSON.stringify(imRight, null, 2));
