import type { Node, ElementNode, TextNode, Difference, Path } from "./types.js";

/**
 * find_differences(old_tree, new_tree)
 *
 * Rules:
 * - Identity: same index AND
 *     • element↔element with same tag, or
 *     • text↔text
 * - Tag change => two entries at ['…','tag']: removed (old) + added (new)
 * - Text change => one 'modified' at ['…','text']
 * - Attributes: add/remove/modify at ['…','attributes', key] (keys sorted)
 * - Children: compared by index; missing side = added/removed entire subtree
 * - We still recurse after a tag change to surface deeper diffs
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

function diffAttrs(
  aAttrs: ElementNode["attributes"],
  bAttrs: ElementNode["attributes"],
  path: Path,
  out: Difference[],
): void {
  const a = aAttrs ?? {};
  const b = bAttrs ?? {};
  const keys = Array.from(
    new Set([...Object.keys(a), ...Object.keys(b)]),
  ).sort();

  for (const k of keys) {
    const inA = Object.prototype.hasOwnProperty.call(a, k);
    const inB = Object.prototype.hasOwnProperty.call(b, k);
    if (inA && !inB) {
      out.push({
        type: "removed",
        path: [...path, "attributes", k],
        oldValue: (a as any)[k],
      });
    } else if (!inA && inB) {
      out.push({
        type: "added",
        path: [...path, "attributes", k],
        newValue: (b as any)[k],
      });
    } else if (inA && inB && (a as any)[k] !== (b as any)[k]) {
      out.push({
        type: "modified",
        path: [...path, "attributes", k],
        oldValue: (a as any)[k],
        newValue: (b as any)[k],
      });
    }
  }
}

function diffText(
  a: TextNode | undefined,
  b: TextNode | undefined,
  path: Path,
  out: Difference[],
): void {
  const ta = a?.text;
  const tb = b?.text;
  if (ta !== tb) {
    out.push({
      type: "modified",
      path: [...path, "text"],
      oldValue: ta,
      newValue: tb,
    });
  }
}

function diff(
  a: Node | undefined,
  b: Node | undefined,
  path: Path,
  out: Difference[],
): void {
  // Text ↔ Text
  if (isTxt(a) && isTxt(b)) {
    diffText(a, b, path, out);
    return;
  }

  // Element ↔ Element
  if (isEl(a) && isEl(b)) {
    // 1) Tag (first for stable ordering)
    if (a.tag !== b.tag) {
      out.push({ type: "removed", path: [...path, "tag"], oldValue: a.tag });
      out.push({ type: "added", path: [...path, "tag"], newValue: b.tag });
    }

    // 2) Attributes (alphabetical)
    diffAttrs(a.attributes, b.attributes, path, out);

    // 3) Children (by index, ascending)
    const ac = Array.isArray(a.children) ? (a.children as Node[]) : [];
    const bc = Array.isArray(b.children) ? (b.children as Node[]) : [];
    const n = Math.max(ac.length, bc.length);

    for (let i = 0; i < n; i++) {
      const left = ac[i];
      const right = bc[i];
      const base: Path = [...path, "children", i];

      if (left === undefined && right !== undefined) {
        out.push({ type: "added", path: base, newValue: right });
        continue;
      }
      if (left !== undefined && right === undefined) {
        out.push({ type: "removed", path: base, oldValue: left });
        continue;
      }

      // both exist
      if (isEl(left) && isEl(right)) {
        if (left.tag !== right.tag) {
          // represent swap at most specific leaf
          out.push({
            type: "removed",
            path: [...base, "tag"],
            oldValue: left.tag,
          });
          out.push({
            type: "added",
            path: [...base, "tag"],
            newValue: right.tag,
          });
        }
        // recurse regardless to surface nested diffs
        diff(left, right, base, out);
      } else if (isTxt(left) && isTxt(right)) {
        diffText(left, right, base, out);
      } else {
        // element ↔ text (or mismatch)
        if (isEl(left))
          out.push({
            type: "removed",
            path: [...base, "tag"],
            oldValue: left.tag,
          });
        if (isTxt(left))
          out.push({
            type: "removed",
            path: [...base, "text"],
            oldValue: left.text,
          });
        if (isEl(right))
          out.push({
            type: "added",
            path: [...base, "tag"],
            newValue: right.tag,
          });
        if (isTxt(right))
          out.push({
            type: "added",
            path: [...base, "text"],
            newValue: right.text,
          });
      }
    }
    return;
  }

  // Mismatch at this level (element vs text, or one missing)
  if (a === undefined && b !== undefined) {
    out.push({ type: "added", path, newValue: b });
  } else if (a !== undefined && b === undefined) {
    out.push({ type: "removed", path, oldValue: a });
  } else if (a !== undefined && b !== undefined) {
    // element vs text at the root (or other shape mismatch)
    if (isEl(a))
      out.push({ type: "removed", path: [...path, "tag"], oldValue: a.tag });
    if (isTxt(a))
      out.push({ type: "removed", path: [...path, "text"], oldValue: a.text });
    if (isEl(b))
      out.push({ type: "added", path: [...path, "tag"], newValue: b.tag });
    if (isTxt(b))
      out.push({ type: "added", path: [...path, "text"], newValue: b.text });
  }
}

export function find_differences(old_tree: Node, new_tree: Node): Difference[] {
  const out: Difference[] = [];
  diff(old_tree, new_tree, [], out);
  return out;
}
