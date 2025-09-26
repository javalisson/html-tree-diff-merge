// tests/merge.test.ts
import { describe, it, expect } from "vitest";
import { merge_trees } from "../src/merge_trees.js";

// Helper to ensure we don't mutate inputs
function deepFreeze(obj) {
  if (obj && typeof obj === "object") {
    Object.freeze(obj);
    for (const key of Object.keys(obj)) {
      deepFreeze(obj[key]);
    }
  }
  return obj;
}

describe("merge_trees — attributes", () => {
  it("merges attributes with tree2 taking precedence", () => {
    const t1 = { tag: "div", attributes: { class: "a", id: "root" } };
    const t2 = { tag: "div", attributes: { class: "b", "data-x": "1" } };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "div",
      attributes: { id: "root", class: "b", "data-x": "1" },
    });
  });

  it("handles missing/null attributes and children as empty", () => {
    const t1 = { tag: "div" }; // no attributes, no children
    const t2 = {
      tag: "div",
      attributes: { id: "x" },
      children: [{ text: "hi" }],
    };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "div",
      attributes: { id: "x" },
      children: [{ text: "hi" }],
    });
  });
});

describe("merge_trees — children layout & deep merge", () => {
  it("uses tree2 structure and length for children", () => {
    const t1 = {
      tag: "ul",
      children: [{ tag: "li", children: [{ text: "A" }] }],
    };
    const t2 = {
      tag: "ul",
      children: [
        { tag: "li", children: [{ text: "B" }] },
        { tag: "li", children: [{ text: "C" }] }, // extra in tree2
      ],
    };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "ul",
      children: [
        { tag: "li", children: [{ text: "B" }] },
        { tag: "li", children: [{ text: "C" }] },
      ],
    });
  });

  it("deep-merges aligned children (same tag at same index)", () => {
    const t1 = {
      tag: "div",
      children: [
        { tag: "p", attributes: { class: "old" }, children: [{ text: "One" }] },
        { tag: "span", children: [{ text: "Two (old)" }] },
      ],
    };
    const t2 = {
      tag: "div",
      children: [
        {
          tag: "p",
          attributes: { class: "new" },
          children: [{ text: "One (new)" }],
        },
        { tag: "span", children: [{ text: "Two (new)" }] },
        { tag: "em", children: [{ text: "Three" }] }, // extra
      ],
    };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "div",
      children: [
        // child[0]: same tag 'p' => deep merge; attributes merged, text from tree2
        {
          tag: "p",
          attributes: { class: "new" },
          children: [{ text: "One (new)" }],
        },
        // child[1]: same tag 'span' => take tree2 content
        { tag: "span", children: [{ text: "Two (new)" }] },
        // child[2]: only in tree2 => included
        { tag: "em", children: [{ text: "Three" }] },
      ],
    });
  });
});

describe("merge_trees — identity mismatch replaces child", () => {
  it("element ↔ text at same index: takes tree2 child verbatim", () => {
    const t1 = { tag: "span", children: [{ text: "plain" }] };
    const t2 = {
      tag: "span",
      children: [{ tag: "strong", children: [{ text: "bold" }] }],
    };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "span",
      children: [{ tag: "strong", children: [{ text: "bold" }] }],
    });
  });

  it("different tags at same index: takes tree2 child verbatim", () => {
    const t1 = {
      tag: "div",
      children: [{ tag: "em", children: [{ text: "x" }] }],
    };
    const t2 = {
      tag: "div",
      children: [{ tag: "strong", children: [{ text: "y" }] }],
    };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "div",
      children: [{ tag: "strong", children: [{ text: "y" }] }],
    });
  });
});

describe("merge_trees — tag at root follows tree2", () => {
  it("root tag change: result tag equals tree2 tag", () => {
    const t1 = { tag: "section", attributes: { "data-x": "1" } };
    const t2 = { tag: "article", attributes: { id: "a" } };

    const merged = merge_trees(t1, t2);
    expect(merged).toEqual({
      tag: "article",
      attributes: { "data-x": "1", id: "a" },
    });
  });
});

describe("merge_trees — immutability", () => {
  it("does not mutate inputs (attributes & children)", () => {
    const t1 = deepFreeze({
      tag: "div",
      attributes: { class: "a", id: "x" },
      children: [{ tag: "p", children: [{ text: "A" }] }],
    });
    const t2 = deepFreeze({
      tag: "div",
      attributes: { class: "b" },
      children: [
        { tag: "p", children: [{ text: "B" }] },
        { tag: "em", children: [{ text: "C" }] },
      ],
    });

    const merged = merge_trees(t1, t2);

    // Inputs must remain unchanged
    expect(t1).toEqual({
      tag: "div",
      attributes: { class: "a", id: "x" },
      children: [{ tag: "p", children: [{ text: "A" }] }],
    });
    expect(t2).toEqual({
      tag: "div",
      attributes: { class: "b" },
      children: [
        { tag: "p", children: [{ text: "B" }] },
        { tag: "em", children: [{ text: "C" }] },
      ],
    });

    // Merged content should reflect the strategy
    expect(merged).toEqual({
      tag: "div",
      attributes: { class: "b", id: "x" },
      children: [
        { tag: "p", children: [{ text: "B" }] },
        { tag: "em", children: [{ text: "C" }] },
      ],
    });
  });
});

describe("merge_trees — edge cases", () => {
  it("tree1 only (tree2 undefined-like): returns clone of tree1", () => {
    const t1 = { tag: "div", attributes: { id: "x" } };
    // @ts-expect-error intentionally passing undefined to simulate missing input
    const merged = merge_trees(t1, undefined);
    expect(merged).toEqual({ tag: "div", attributes: { id: "x" } });
    expect(merged).not.toBe(t1); // should be a new object
  });

  it("tree2 only (tree1 undefined-like): returns clone of tree2", () => {
    // @ts-expect-error intentionally passing undefined to simulate missing input
    const merged = merge_trees(undefined, {
      tag: "div",
      attributes: { id: "x" },
    });
    expect(merged).toEqual({ tag: "div", attributes: { id: "x" } });
  });

  it("keeps children order exactly as in tree2", () => {
    const t1 = {
      tag: "ol",
      children: [
        { tag: "li", children: [{ text: "1" }] },
        { tag: "li", children: [{ text: "2" }] },
      ],
    };
    const t2 = {
      tag: "ol",
      children: [
        { tag: "li", children: [{ text: "A" }] },
        { tag: "li", children: [{ text: "B" }] },
        { tag: "li", children: [{ text: "C" }] },
      ],
    };

    const merged = merge_trees(t1, t2);
    expect(merged.children).toEqual([
      { tag: "li", children: [{ text: "A" }] },
      { tag: "li", children: [{ text: "B" }] },
      { tag: "li", children: [{ text: "C" }] },
    ]);
  });
});
