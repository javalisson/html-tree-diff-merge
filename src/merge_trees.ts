import type { Node, ElementNode, TextNode } from "./types.js";

/**
 * merge_trees(tree1, tree2)
 *
 * Rules:
 * - If only one side exists → return a deep clone of it.
 * - Text vs Text → { text: tree2.text }.
 * - Element vs Element →
 *     • tag := tree2.tag
 *     • attributes := { ...tree1.attributes, ...tree2.attributes } (tree2 wins)
 *     • children := map over tree2.children (its length/order win):
 *           if same identity at index (same tag for elements, or both text) → merge recursively
 *           else → clone tree2 child
 * - Element vs Text (or vice versa) → clone tree2 node.
 * - Never mutate inputs.
 */

function isObj(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}
function isEl(n: Node | undefined): n is ElementNode {
  return isObj(n) && typeof (n as any).tag === "string";
}
function isTxt(n: Node | undefined): n is TextNode {
  return (
    isObj(n) && !("tag" in (n as any)) && typeof (n as any).text === "string"
  );
}
function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}
function sameId(a?: Node, b?: Node): boolean {
  return (isEl(a) && isEl(b) && a.tag === b.tag) || (isTxt(a) && isTxt(b));
}

function mergeNode(a?: Node, b?: Node): Node {
  if (b == null) return clone(a as Node);
  if (a == null) return clone(b as Node);

  if (isTxt(b)) {
    return isTxt(a) ? { text: b.text } : clone(b);
  }

  if (isEl(b)) {
    if (!isEl(a)) return clone(b);

    const attrsA = a.attributes ?? {};
    const attrsB = b.attributes ?? {};
    const mergedAttrs = { ...attrsA, ...attrsB };

    const result: ElementNode = { tag: b.tag };
    if (Object.keys(mergedAttrs).length) result.attributes = mergedAttrs;

    const ac = Array.isArray(a.children) ? (a.children as Node[]) : [];
    const bc = Array.isArray(b.children) ? (b.children as Node[]) : [];

    if (bc.length) {
      result.children = bc.map((childB, i) => {
        const childA = ac[i];
        return sameId(childA, childB)
          ? mergeNode(childA, childB)
          : clone(childB);
      });
    }

    return result;
  }

  return clone(b as Node);
}

export function merge_trees(tree1: Node, tree2: Node): Node {
  return mergeNode(tree1, tree2);
}
