export interface TreeOptions {
  container: HTMLDivElement;
  depth: number;
  treeScale?: number;
  branchWidth: number;
  leafSize: number;
  seed: number;
  witheredLevel: number;
}

export interface Forest {
  trees: TreeOptions[];
  isMainTree?: boolean;
}

export interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lineWidth: number;
  depth: number;
}
