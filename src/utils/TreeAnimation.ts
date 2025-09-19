import type { Branch, TreeOptions } from "../types/Tree";
import type { Forest } from "../types/Tree";
import throttle from "./throttle";

type ModifiedTreeOptions = TreeOptions & {
  branches: Branch[][];
  animation: null | number;
  currentDepth: number;
  treeTop: number;
  treeX: number;
  treeY: number;
  randCounter: number;
  randSeq: number[];
  rng: () => number;
};
type Colors = typeof colors;

const colors = {
  sky: "#00C0F0",
  leaf: "#30B700",
  grass: "#009A17",
  trunk: "#8B4513",
  witheredTrunk: "#5A4634",
  witheredLeaf: "#A48B56",
  dyingTrunk: "#602020",
  dyingLeaf: "#A1372F",
} as const;
class TreeAnimation {
  trees: TreeOptions[];
  container: HTMLDivElement;
  maxDepth: number;
  treeScale: number;
  colorMode?: "gradient" | "solid";
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  stageWidth: number;
  stageHeight: number;
  viewportTransform: { x: number; y: number; scale: number };
  previousX: number;
  previousY: number;
  hasCentered: boolean;
  isMainTree: boolean;
  rowHeight: number;
  treesPerRow: number;
  distanceBetween: number;
  colors: Colors;

  constructor(options: Forest & { container: HTMLDivElement }) {
    this.trees = options.trees;
    this.container = options.container;
    this.stageWidth = this.container.clientWidth;
    this.stageHeight = this.container.clientHeight;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.stageWidth;
    this.canvas.height = this.stageHeight;
    this.isMainTree = options.isMainTree ?? false;
    this.container.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    this.ctx = ctx;
    this.colors = colors;

    this.previousX = 0;
    this.previousY = 0;
    this.maxDepth = 11;
    this.rowHeight = 450;
    this.treesPerRow = 500;
    this.distanceBetween = 500;
    // this.treeScale = 0.3725;
    this.treeScale = 1;

    this.hasCentered = false;
    this.addEventListeners();
    this.viewportTransform = {
      x: 0,
      y: 0,
      scale: 1,
    };

    this.render();
  }
  render() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isMainTree) {
      const horizonY = (this.canvas.height / 2) * this.viewportTransform.scale;

      // fill sky: from top of canvas down to horizon
      this.ctx.fillStyle = this.colors.sky;
      this.ctx.fillRect(0, 0, this.canvas.width, horizonY);

      // fill grass: from horizon down to bottom of canvas
      this.ctx.fillStyle = this.colors.grass;
      this.ctx.fillRect(
        0,
        horizonY,
        this.canvas.width,
        this.canvas.height - horizonY,
      );
    } else {
      this.ctx.fillStyle = this.colors.grass;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    if (this.trees) {
      for (let i = 0; i < this.trees.length; i++) {
        const treeX = (i % this.treesPerRow) * this.distanceBetween;
        const treeY = Math.floor(i / this.treesPerRow) * this.rowHeight;
        const tree = this.trees[i];
        tree.treeScale = this.treeScale;
        const size = tree.treeScale * this.maxDepth;

        minX = Math.min(minX, treeX - size);
        maxX = Math.max(maxX, treeX + size);
        minY = Math.min(minY, treeY - size);
        maxY = Math.max(maxY, treeY + size);
      }

      if (!this.hasCentered && !this.isMainTree) {
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.viewportTransform.x =
          this.stageWidth / 2 - centerX * this.viewportTransform.scale;
        this.viewportTransform.y =
          this.stageHeight / 2 - centerY * this.viewportTransform.scale;

        this.hasCentered = true;
      } else if (this.isMainTree) {
        const centerX = (minX + maxX) / 2;
        this.viewportTransform.x =
          this.stageWidth / 2 - centerX * this.viewportTransform.scale;
        this.viewportTransform.y = this.stageHeight;
      }

      // Now apply transform once, after centering
      this.ctx.setTransform(
        this.viewportTransform.scale,
        0,
        0,
        this.viewportTransform.scale,
        this.viewportTransform.x,
        this.viewportTransform.y,
      );
      if (this.trees) {
        for (let i = 0; i < this.trees.length; i++) {
          // thresholds in pixels

          // const FULL_DETAIL = 1; // draw full tree if bigger than 20px
          const MID_DETAIL = 0.5; // draw simplified tree if between 8-20px
          // below 8px, draw as a simple dot

          const treeX = (i % this.treesPerRow) * this.distanceBetween; // horizontal spacing
          const treeY = Math.floor(i / this.treesPerRow) * this.rowHeight; // vertical spacing per row
          const tree = this.trees[i];
          tree.treeScale = this.treeScale;
          const screenX =
            treeX * this.viewportTransform.scale + this.viewportTransform.x;
          const screenY =
            treeY * this.viewportTransform.scale + this.viewportTransform.y;
          const approxSize =
            tree.treeScale * this.maxDepth * this.viewportTransform.scale + 300;
          // Skip completely offscreen trees
          if (
            screenX + approxSize < 0 ||
            screenX - approxSize > this.stageWidth ||
            screenY + approxSize < 0 ||
            screenY - approxSize > this.stageHeight
          ) {
            continue;
          }
          const rng = this.makeSeededRNG(tree.seed);

          const internalTree: ModifiedTreeOptions = {
            ...tree,
            branches: Array.from({ length: this.maxDepth }, () => []),
            animation: null,
            currentDepth: 0,
            treeTop: Infinity,
            treeX,
            treeY,
            randCounter: 0, // no longer needed
            randSeq: [], // no longer needed
            rng,
          };

          // eslint-disable-next-line no-constant-condition
          if (true) {
            // if (approxSize >= FULL_DETAIL) {
            // Full detail tree
            this.drawFullTree(internalTree);
          } else if (approxSize >= MID_DETAIL) {
            // Mid detail: draw simplified
            this.drawSimplifiedTree(internalTree);
          } else {
            // Very small: just a dot
            this.ctx.fillStyle = this.getTrunkColor(tree);
            this.ctx.fillRect(internalTree.treeX, internalTree.treeY, 2, 2);
          }
        }
      }
    }
  }
  drawSimplifiedTree(tree: ModifiedTreeOptions) {
    const ctx = this.ctx;
    ctx.beginPath();
    // simple trunk
    const trunkHeight = (tree.treeScale || 1) * 5 * this.maxDepth;
    ctx.moveTo(tree.treeX, tree.treeY);
    ctx.lineTo(tree.treeX, tree.treeY - trunkHeight);
    ctx.lineWidth = tree.branchWidth * 1.5;
    ctx.strokeStyle = this.getTrunkColor(tree);
    ctx.stroke();
    ctx.closePath();

    // optional: one or two main branches
    ctx.beginPath();
    ctx.moveTo(tree.treeX, tree.treeY - trunkHeight / 2);
    ctx.lineTo(tree.treeX - trunkHeight / 4, tree.treeY - trunkHeight);
    ctx.moveTo(tree.treeX, tree.treeY - trunkHeight / 2);
    ctx.lineTo(tree.treeX + trunkHeight / 4, tree.treeY - trunkHeight);
    ctx.lineWidth = tree.branchWidth;
    ctx.stroke();
    ctx.closePath();
  }
  updateZooming(e: WheelEvent) {
    e.preventDefault();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const { x, y, scale } = this.viewportTransform;

    const zoomFactor = 1.0 - e.deltaY * 0.001; // >1 zoom in, <1 zoom out
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.1), 5);

    // Convert mouse screen coords into world coords before zoom
    const worldX = (mouseX - x) / scale;
    const worldY = (mouseY - y) / scale;

    // Recalculate transform so mouse world coord stays under cursor
    this.viewportTransform.x = mouseX - worldX * newScale;
    this.viewportTransform.y = mouseY - worldY * newScale;
    this.viewportTransform.scale = newScale;
  }
  onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    this.updatePanning(e);
    this.render();
  };
  updatePanning = (e: MouseEvent) => {
    const localX = e.clientX;
    const localY = e.clientY;

    this.viewportTransform.x += localX - this.previousX;
    this.viewportTransform.y += localY - this.previousY;

    this.previousX = localX;
    this.previousY = localY;
  };
  onMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.updateZooming(e);
    this.render();
  };

  addEventListeners() {
    window.addEventListener("resize", this.resize.bind(this));

    // Throttle your methods once, binding `this` properly
    const throttledMouseMove = throttle(this.onMouseMove.bind(this), 20);
    const throttledMouseWheel = throttle(this.onMouseWheel.bind(this), 20);

    this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
      this.previousX = e.clientX;
      this.previousY = e.clientY;

      // Add mousemove once
      this.canvas.addEventListener("mousemove", throttledMouseMove);
    });

    const removeMouseMove = () => {
      this.canvas.removeEventListener("mousemove", throttledMouseMove);
    };

    this.canvas.addEventListener("mouseup", removeMouseMove);
    this.canvas.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault(); // now this will work
        throttledMouseWheel(e);
      },
      { passive: false },
    );
    //phones
    this.canvas.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.previousX = e.touches[0].clientX;
        this.previousY = e.touches[0].clientY;
      }
    });

    let lastDist: number | null = null;

    this.canvas.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          e.preventDefault();
          lastDist = null; // reset pinch distance

          const localX = e.touches[0].clientX;
          const localY = e.touches[0].clientY;

          this.viewportTransform.x += localX - this.previousX;
          this.viewportTransform.y += localY - this.previousY;

          this.previousX = localX;
          this.previousY = localY;

          this.render();
        }

        if (e.touches.length === 2) {
          e.preventDefault();

          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

          if (lastDist !== null) {
            const zoomFactor = dist / lastDist;
            const { x, y, scale } = this.viewportTransform;
            const newScale = Math.min(Math.max(scale * zoomFactor, 0.1), 5);

            const worldX = (midX - x) / scale;
            const worldY = (midY - y) / scale;

            this.viewportTransform.x = midX - worldX * newScale;
            this.viewportTransform.y = midY - worldY * newScale;
            this.viewportTransform.scale = newScale;

            this.render();
          }

          lastDist = dist;

          // update previousX/Y so when one finger lifts, panning continues smoothly
          this.previousX = midX;
          this.previousY = midY;
        }
      },
      { passive: false },
    );
  }

  resize() {
    const newWidth = this.container.clientWidth;
    const newHeight = this.container.clientHeight;
    if (
      newWidth === this.stageWidth &&
      Math.abs(newHeight - this.stageHeight) < 50
    ) {
      return; // probably just the browser bar dancing
    }
    this.stageWidth = this.container.clientWidth;
    this.stageHeight = this.container.clientHeight;
    this.canvas.width = this.stageWidth;
    this.canvas.height = this.stageHeight;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // automatically adjust scale
    this.treeScale = Math.min(this.stageWidth, this.stageHeight) / 800;

    this.clearCanvas();
    this.render();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
  }

  growOneLevel(tree: TreeOptions) {
    const t = this.trees?.find((tr) => tr.seed === tree.seed);
    if (t && t.depth < this.maxDepth) {
      t.depth++;
      t.leafSize++;
      if (t.witheredLevel > 0) {
        t.witheredLevel--;
      }
      this.updateZooming({
        preventDefault: () => {},
        clientX: this.stageWidth / 2,
        clientY: this.stageHeight,
        deltaY: 40, // negative = zoom in
      } as unknown as WheelEvent);
      this.render();
    }
  }

  witherTree(tree: TreeOptions) {
    const t = this.trees?.find((tr) => tr.seed === tree.seed);
    if (t && t.witheredLevel < 2) {
      t.witheredLevel++;
      this.render();
    }
  }
  random(min: number, max: number, tree: ModifiedTreeOptions) {
    if (tree.rng) {
      return min + tree.rng() * (max - min);
    } else {
      return Math.random() * (max - min) + min;
    }
  }

  degToRad(degree: number) {
    return degree * (Math.PI / 180);
  }

  createBranch(
    startX: number,
    startY: number,
    angle: number,
    depth: number,
    tree: ModifiedTreeOptions,
  ) {
    if (depth >= tree.depth) return;

    const scale = tree.treeScale || 1;
    const len = (depth === 0 ? 3 : this.random(0, 11, tree)) * scale;
    const factor = this.maxDepth - depth;
    const endX = startX + Math.cos(this.degToRad(angle)) * len * factor;
    const endY = startY + Math.sin(this.degToRad(angle)) * len * factor;
    if (startY < tree.treeTop) tree.treeTop = startY;
    if (endY < tree.treeTop) tree.treeTop = endY;
    const branchWidthFactor = tree.branchWidth;
    const branch = {
      startX,
      startY,
      endX,
      endY,
      lineWidth: factor * branchWidthFactor,
      depth,
    };
    this.ctx.beginPath();
    this.ctx.moveTo(branch.startX, branch.startY);
    this.ctx.lineTo(branch.endX, branch.endY);
    this.ctx.lineWidth = branch.lineWidth;
    this.ctx.strokeStyle = this.getTrunkColor(tree);
    this.ctx.stroke();
    this.ctx.closePath();
    tree.branches[depth].push(branch);
    this.createBranch(
      endX,
      endY,
      angle - this.random(15, 23, tree),
      depth + 1,
      tree,
    );
    this.createBranch(
      endX,
      endY,
      angle + this.random(15, 23, tree),
      depth + 1,
      tree,
    );
  }
  makeSeededRNG(seed: number) {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  drawLeaf(x: number, y: number, tree: ModifiedTreeOptions) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, tree.leafSize, 0, Math.PI * 2);
    // this.ctx.fillStyle = tree.leafColor;
    this.ctx.fillStyle = this.getLeafColor(tree);
    this.ctx.fill();
    this.ctx.closePath();
  }
  getTrunkColor(tree: TreeOptions) {
    switch (tree.witheredLevel) {
      case 0:
        return this.colors.trunk;
      case 1:
        return this.colors.witheredTrunk;
      case 2:
        return this.colors.dyingTrunk;
      default:
        return this.colors.trunk;
    }
  }
  getLeafColor(tree: TreeOptions) {
    switch (tree.witheredLevel) {
      case 0:
        return this.colors.leaf;
      case 1:
        return this.colors.witheredLeaf;
      case 2:
        return this.colors.dyingLeaf;
      default:
        return this.colors.leaf;
    }
  }

  drawFullTree(tree: ModifiedTreeOptions) {
    // Reset tree top
    tree.treeTop = Infinity;
    if (tree.witheredLevel > 0) {
      tree.treeScale = (tree.treeScale || 1) / (tree.witheredLevel * 1.5);
    }

    // Draw all branches recursively
    this.createBranch(
      // this will populate tree.branches
      tree.treeX,
      tree.treeY,
      -90,
      0,
      tree,
    );

    // Draw leaves
    for (let d = 0; d < tree.branches.length; d++) {
      for (const branch of tree.branches[d]) {
        if (branch.depth === tree.depth - 1) {
          this.drawLeaf(branch.endX, branch.endY, tree);
        }
      }
    }

    // Draw fruits
    const fruitType = this.random(0, 1, tree) > 0.5 ? "red" : "orange";
    for (let d = 0; d < tree.branches.length; d++) {
      for (const branch of tree.branches[d]) {
        if (
          branch.depth === this.maxDepth - 1 &&
          this.random(0, 1, tree) < 0.05 &&
          tree.witheredLevel < 1
        ) {
          const dx = branch.endX - branch.startX;
          const dy = branch.endY - branch.startY;
          const len = Math.hypot(dx, dy) || 1;
          const nx = dx / len;
          const ny = dy / len;
          const offset = Math.min(tree.leafSize * 0.35, 8);
          const ax = branch.endX + nx * offset;
          const ay = branch.endY + ny * offset;

          const fruitRadius = Math.max(3, Math.floor(tree.leafSize * 0.2));
          this.ctx.beginPath();
          this.ctx.arc(ax, ay, fruitRadius, 0, Math.PI * 2);
          this.ctx.fillStyle = fruitType;
          this.ctx.fill();
          this.ctx.closePath();

          this.ctx.beginPath();
          this.ctx.arc(
            ax - fruitRadius * 0.35,
            ay - fruitRadius * 0.35,
            fruitRadius * 0.35,
            0,
            Math.PI * 2,
          );
          this.ctx.fillStyle = "rgba(255,255,255,0.7)";
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }
}

export default TreeAnimation;
