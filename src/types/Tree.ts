export interface Tree {
  leafSize: number;
  container: HTMLDivElement;
  depth: number;
  treeScale?: number;
  seed: number;
  decayProgress: number; // Add this new property
  witheredLevel: number;
}

export interface Forest {
  trees: Tree[];
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
