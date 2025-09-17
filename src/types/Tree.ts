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
  seed: number | string;
}

export interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lineWidth: number;
  frame: number;
  cntFrame: number;
  depth: number;
  draw: (ctx: CanvasRenderingContext2D, speed: number) => boolean;
}
