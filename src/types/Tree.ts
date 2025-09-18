export interface TreeOptions {
  container: HTMLDivElement;
  depth: number;
  growthSpeed: number;
  treeScale: number;
  branchWidth: number;
  colorMode: "gradient" | "solid";
  color: string;
  gradientColorStart: string;
  gradientColorEnd: string;
  leafColor: string;
  leafSize: number;
  seed: number;
  shouldAnimate?: boolean;
  mainTree?: boolean;
}

export interface Forest {
  trees: TreeOptions[];
}

export interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lineWidth: number;
  depth: number;
}
