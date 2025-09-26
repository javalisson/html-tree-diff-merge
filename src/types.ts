export type Attributes = Record<string, string | number | boolean>;

export type TextNode = {
  text: string;
};

export type ElementNode = {
  tag: string;
  attributes?: Attributes | null;
  children?: Node[] | null;
};

export type Node = ElementNode | TextNode;

export type Path = Array<string | number>;

export type Difference =
  | { type: "added"; path: Path; newValue: unknown }
  | { type: "removed"; path: Path; oldValue: unknown }
  | { type: "modified"; path: Path; oldValue: unknown; newValue: unknown };
