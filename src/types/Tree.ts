export interface Tree {
  leafSize: number;
  container: HTMLDivElement;
  depth: number;
  treeScale?: number;
  seed: number;
  decayProgress: number; // Add this new property
  witheredLevel: number;
}
export type Planet = "Земле" | "Юпитере" | "Марсе";
export interface Forest {
  trees: Tree[];
  isLoading: boolean;
  isMainTree?: boolean;
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
