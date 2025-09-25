export interface Tree {
  container: HTMLDivElement;
  timesWatered: number;
  treeScale?: number;
  seed: number;
  decayProgress: number; // Add this new property
  witheredLevel: number;
  apples?: number;
}
export type Planet = "Земля" | "Юпитер" | "Марс";
export interface Forest {
  trees: Tree[];
  isLoading: boolean;
  isMainTree?: boolean;
  currentUserTree?: Tree;
  simulation?: boolean;
  planet?: Planet;
}

export interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lineWidth: number;
  depth: number;
}
