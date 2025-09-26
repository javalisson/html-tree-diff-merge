import { describe, it, expect } from "vitest";
import { find_differences } from "../src/find_differences.js";
import type { Node, Difference } from "../src/types.js";

/** Small helper to compare only the path sequence ordering */
function extractPaths(diffs: Difference[]): string[] {
  return diffs.map((d) => JSON.stringify(d.path));
}

describe("find_differences – basic behavior", () => {
  it("returns empty array for identical trees", () => {
    const a: Node = {
      tag: "div",
      attributes: { class: "box" },
      children: [{ text: "Hi" }],
    };
    const b: Node = {
      tag: "div",
      attributes: { class: "box" },
      children: [{ text: "Hi" }],
    };

    expect(find_differences(a, b)).toEqual<Difference[]>([]);
  });

  it("detects attribute modification", () => {
    const a: Node = { tag: "div", attributes: { class: "a" } };
    const b: Node = { tag: "div", attributes: { class: "b" } };

    const diffs = find_differences(a, b);
    const expected: Difference[] = [
      {
        type: "modified",
        path: ["attributes", "class"],
        oldValue: "a",
        newValue: "b",
      },
    ];
    expect(diffs).toEqual(expected);
  });

  it("detects attribute add and remove", () => {
    const a: Node = { tag: "div", attributes: { id: "x" } };
    const b: Node = { tag: "div", attributes: { class: "y" } };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        { type: "removed", path: ["attributes", "id"], oldValue: "x" },
        { type: "added", path: ["attributes", "class"], newValue: "y" },
      ]),
    );
    expect(diffs.length).toBe(2);
  });

  it("detects text modification (same position)", () => {
    const a: Node = { tag: "p", children: [{ text: "Hello" }] };
    const b: Node = { tag: "p", children: [{ text: "Hello, world!" }] };

    const diffs = find_differences(a, b);
    const expected: Difference[] = [
      {
        type: "modified",
        path: ["children", 0, "text"],
        oldValue: "Hello",
        newValue: "Hello, world!",
      },
    ];
    expect(diffs).toEqual(expected);
  });

  it("represents tag change as removed+added at tag path", () => {
    const a: Node = {
      tag: "div",
      children: [{ tag: "p", children: [{ text: "T" }] }],
    };
    const b: Node = {
      tag: "div",
      children: [{ tag: "h1", children: [{ text: "T" }] }],
    };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        { type: "removed", path: ["children", 0, "tag"], oldValue: "p" },
        { type: "added", path: ["children", 0, "tag"], newValue: "h1" },
      ]),
    );
  });

  it("child added and removed by position", () => {
    const a: Node = {
      tag: "ul",
      children: [{ tag: "li", children: [{ text: "One" }] }],
    };
    const b: Node = {
      tag: "ul",
      children: [
        { tag: "li", children: [{ text: "One" }] },
        { tag: "li", children: [{ text: "Two" }] }, // new
      ],
    };

    const diffsAdd = find_differences(a, b);
    expect(diffsAdd).toEqual(
      expect.arrayContaining<Difference>([
        {
          type: "added",
          path: ["children", 1],
          newValue: { tag: "li", children: [{ text: "Two" }] },
        },
      ]),
    );

    const diffsRemove = find_differences(b, a);
    expect(diffsRemove).toEqual(
      expect.arrayContaining<Difference>([
        {
          type: "removed",
          path: ["children", 1],
          oldValue: { tag: "li", children: [{ text: "Two" }] },
        },
      ]),
    );
  });

  it("element ↔ text at same index => removed + added at most specific leaf", () => {
    const a: Node = { tag: "span", children: [{ text: "plain" }] };
    const b: Node = {
      tag: "span",
      children: [{ tag: "strong", children: [{ text: "plain" }] }],
    };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        { type: "removed", path: ["children", 0, "text"], oldValue: "plain" },
        { type: "added", path: ["children", 0, "tag"], newValue: "strong" },
      ]),
    );
  });
});

describe("find_differences – real-world scenario from README", () => {
  it("detects class, p->h1, and text changes", () => {
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

    const diffs = find_differences(beforeEdit, afterEdit);

    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        {
          type: "modified",
          path: ["attributes", "class"],
          oldValue: "container",
          newValue: "container updated",
        },
        { type: "removed", path: ["children", 0, "tag"], oldValue: "p" },
        { type: "added", path: ["children", 0, "tag"], newValue: "h1" },
        {
          type: "modified",
          path: ["children", 0, "children", 0, "text"],
          oldValue: "Hello World",
          newValue: "Welcome!",
        },
      ]),
    );
  });
});

describe("find_differences – null/undefined handling", () => {
  it("treats missing attributes/children as empty", () => {
    const a: Node = { tag: "div" }; // no attributes/children
    const b: Node = {
      tag: "div",
      attributes: { id: "root" },
      children: [{ text: "x" }],
    };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        { type: "added", path: ["attributes", "id"], newValue: "root" },
        { type: "added", path: ["children", 0], newValue: { text: "x" } },
      ]),
    );
  });

  it("handles removing attributes and children back to empty", () => {
    const a: Node = {
      tag: "div",
      attributes: { id: "root" },
      children: [{ text: "x" }],
    };
    const b: Node = { tag: "div" };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        { type: "removed", path: ["attributes", "id"], oldValue: "root" },
        { type: "removed", path: ["children", 0], oldValue: { text: "x" } },
      ]),
    );
  });
});

describe("find_differences – ordering (deterministic)", () => {
  it("reports tag before attributes before children (preorder)", () => {
    const a: Node = {
      tag: "section",
      attributes: { z: 1, a: 1 },
      children: [
        { tag: "p", children: [{ text: "A" }] },
        { tag: "em", children: [{ text: "x" }] },
      ],
    };
    const b: Node = {
      tag: "article", // tag change
      attributes: { a: 2, m: 0 }, // attr changes
      children: [
        { tag: "p", children: [{ text: "B" }] }, // text change in child[0]
        // child[1] removed
      ],
    };

    const diffs = find_differences(a, b);

    const paths = extractPaths(diffs);
    const expectedPrefixOrder = [
      JSON.stringify(["tag"]), // root tag change
      JSON.stringify(["attributes", "a"]),
      JSON.stringify(["attributes", "m"]),
      JSON.stringify(["attributes", "z"]),
      JSON.stringify(["children", 0, "children", 0, "text"]),
      JSON.stringify(["children", 1]),
    ];

    let lastIndex = -1;
    for (const p of expectedPrefixOrder) {
      const idx = paths.findIndex((x) => x === p);
      expect(idx).toBeGreaterThan(lastIndex);
      lastIndex = idx;
    }
  });

  it("attributes are reported in ascending key order at a node", () => {
    const a: Node = { tag: "div", attributes: { zed: 1, alpha: 1, mid: 1 } };
    const b: Node = { tag: "div", attributes: { zed: 2, alpha: 2, mid: 2 } };

    const diffs = find_differences(a, b);
    const paths = extractPaths(diffs);

    const alpha = paths.indexOf(JSON.stringify(["attributes", "alpha"]));
    const mid = paths.indexOf(JSON.stringify(["attributes", "mid"]));
    const zed = paths.indexOf(JSON.stringify(["attributes", "zed"]));

    expect(alpha).toBeLessThan(mid);
    expect(mid).toBeLessThan(zed);
  });
});

describe("find_differences – deeper nesting / mixed structures", () => {
  it("handles nested elements + text changes", () => {
    const a: Node = {
      tag: "div",
      children: [
        { tag: "h1", children: [{ text: "T" }] },
        { tag: "p", attributes: { class: "x" }, children: [{ text: "A" }] },
      ],
    };
    const b: Node = {
      tag: "div",
      children: [
        { tag: "h1", children: [{ text: "T!" }] }, // text change
        {
          tag: "p",
          attributes: { class: "y", id: "p1" },
          children: [{ text: "A" }],
        }, // attr change+add
      ],
    };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        {
          type: "modified",
          path: ["children", 0, "children", 0, "text"],
          oldValue: "T",
          newValue: "T!",
        },
        {
          type: "modified",
          path: ["children", 1, "attributes", "class"],
          oldValue: "x",
          newValue: "y",
        },
        {
          type: "added",
          path: ["children", 1, "attributes", "id"],
          newValue: "p1",
        },
      ]),
    );
  });

  it("treats different tags at same index as removed+added even if subtrees are similar", () => {
    const a: Node = {
      tag: "div",
      children: [{ tag: "em", children: [{ text: "x" }] }],
    };
    const b: Node = {
      tag: "div",
      children: [{ tag: "strong", children: [{ text: "x" }] }],
    };

    const diffs = find_differences(a, b);
    expect(diffs).toEqual(
      expect.arrayContaining<Difference>([
        { type: "removed", path: ["children", 0, "tag"], oldValue: "em" },
        { type: "added", path: ["children", 0, "tag"], newValue: "strong" },
      ]),
    );
  });
});
