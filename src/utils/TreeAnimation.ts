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
class TreeAnimation {
  trees: TreeOptions[];
  container: HTMLDivElement;
  maxDepth: number;
  depth?: number;
  shouldAnimate?: boolean;
  pixelRatio?: number;
  growthSpeed?: number;
  treeScale?: number;
  branchWidth?: number;
  colorMode?: "gradient" | "solid";
  color?: string;
  gradientColorStart?: string;
  gradientColorEnd?: string;
  leafColor?: string;
  leafSize?: number;
  seed?: number;
  randSeq?: number[];
  randCounter?: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  branches?: Branch[][];
  animation?: number | null;
  currentDepth?: number;
  stageWidth: number;
  stageHeight: number;
  treeTop?: number;
  treeX?: number;
  treeY?: number;
  viewportTransform: { x: number; y: number; scale: number };
  previousX: number;
  previousY: number;
  hasCentered: boolean;

  constructor(options: Forest & { container: HTMLDivElement }) {
    this.trees = options.trees;
    this.container = options.container;
    this.stageWidth = this.container.clientWidth;
    this.stageHeight = this.container.clientHeight;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.stageWidth;
    this.canvas.height = this.stageHeight;
    this.container.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    this.ctx = ctx;
    this.previousX = 0;
    this.previousY = 0;
    this.maxDepth = 11;
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

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const rowHeight = 450;
    const treesPerRow = 500;
    const distanceBetween = 500;
    // const treeScale = 0.3725;
    const treeScale = 1;

    if (this.trees) {
      for (let i = 0; i < this.trees.length; i++) {
        const treeX = (i % treesPerRow) * distanceBetween;
        const treeY = Math.floor(i / treesPerRow) * rowHeight;
        const tree = this.trees[i];
        tree.treeScale = treeScale;
        const size = tree.treeScale * this.maxDepth;

        minX = Math.min(minX, treeX - size);
        maxX = Math.max(maxX, treeX + size);
        minY = Math.min(minY, treeY - size);
        maxY = Math.max(maxY, treeY + size);
      }

      if (!this.hasCentered && this.trees.length > 1) {
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.viewportTransform.x =
          this.stageWidth / 2 - centerX * this.viewportTransform.scale;
        this.viewportTransform.y =
          this.stageHeight / 2 - centerY * this.viewportTransform.scale;

        this.hasCentered = true;
      } else if (!this.hasCentered && this.trees.length == 1) {
        const centerX = (minX + maxX) / 2;
        this.viewportTransform.x =
          this.stageWidth / 2 - centerX * this.viewportTransform.scale;
        this.viewportTransform.y = this.stageHeight;
        this.hasCentered = true;
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

          const treeX = (i % treesPerRow) * distanceBetween; // horizontal spacing
          const treeY = Math.floor(i / treesPerRow) * rowHeight; // vertical spacing per row
          const tree = this.trees[i];
          tree.treeScale = treeScale;
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
            this.ctx.fillStyle = tree.color;
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
    const trunkHeight = tree.treeScale * 5 * this.maxDepth;
    ctx.moveTo(tree.treeX, tree.treeY);
    ctx.lineTo(tree.treeX, tree.treeY - trunkHeight);
    ctx.lineWidth = tree.branchWidth * 1.5;
    ctx.strokeStyle =
      tree.colorMode === "gradient" ? tree.gradientColorStart : tree.color;
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

  startTree(
    posX: number,
    posY: number,
    tree: ModifiedTreeOptions,
    clear = true,
  ) {
    if (clear) this.clearCanvas(); // only clear if needed
    const treeX = posX;
    const treeY = posY;

    const maxScale =
      Math.min(this.stageWidth, this.stageHeight) / (13 * this.maxDepth);
    if (tree.treeScale > maxScale) tree.treeScale = maxScale;

    this.createBranch(treeX, treeY, -90, 0, tree);
    // instantly draw the whole tree in one pass
    this.animate(tree.depth, tree);
  }

  growOneLevel(tree: TreeOptions) {
    const t = this.trees?.find((tr) => tr.seed === tree.seed);
    if (t && t.depth < this.maxDepth) {
      t.depth++;
      t.leafSize++;
      this.updateZooming({
        preventDefault: () => {},
        clientX: this.stageWidth / 2,
        clientY: this.stageHeight,
        deltaY: 40, // negative = zoom in
      } as unknown as WheelEvent);
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

    const scale = tree.treeScale;
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
    this.ctx.strokeStyle =
      tree.colorMode === "gradient" ? tree.gradientColorStart : tree.color;
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
    this.ctx.fillStyle = tree.leafColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawFullTree(tree: ModifiedTreeOptions) {
    // Reset tree top
    tree.treeTop = Infinity;

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
          this.random(0, 1, tree) < 0.05
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

  animate(currentDepth: number, tree: ModifiedTreeOptions) {
    // this.clearCanvas();

    // collect terminal-leaf positions so we can draw apples afterwards (on top)
    const leafQueue: {
      sx: number;
      sy: number;
      ex: number;
      ey: number;
      depth: number;
    }[] = [];
    const fruitType = this.random(0, 1, tree) > 0.5 ? "red" : "orange";

    // draw fully-grown depths (0 .. currentDepth-1)
    for (let d = 0; d < currentDepth; d++) {
      if (d >= tree.depth) break;
      for (let k = 0; k < tree.branches[d].length; k++) {
        const branch = tree.branches[d][k];
        this.ctx.beginPath();
        this.ctx.moveTo(branch.startX, branch.startY);
        this.ctx.lineTo(branch.endX, branch.endY);
        this.ctx.lineWidth = branch.lineWidth;
        if (this.colorMode === "gradient") {
          const grad = this.ctx.createLinearGradient(
            tree.treeX,
            tree.treeY,
            tree.treeX,
            tree.treeTop,
          );
          grad.addColorStop(0, tree.gradientColorStart);
          grad.addColorStop(1, tree.gradientColorEnd);
          this.ctx.strokeStyle = grad;
        } else {
          this.ctx.strokeStyle = tree.color;
        }
        this.ctx.stroke();
        this.ctx.closePath();

        // queue terminal leaves for later drawing
        if (branch.depth === tree.depth - 1) {
          leafQueue.push({
            sx: branch.startX,
            sy: branch.startY,
            ex: branch.endX,
            ey: branch.endY,
            depth: branch.depth,
          });
        }
      }
    }

    // handle the currently growing depth
    let stillGrowing = false;
    if (tree.currentDepth < tree.depth) {
      const currentDone = true;
      for (let k = 0; k < tree.branches[tree.currentDepth].length; k++) {
        const branch = tree.branches[tree.currentDepth][k];
        // finished this frame — draw it fully and queue its leaf if terminal
        this.ctx.beginPath();
        this.ctx.moveTo(branch.startX, branch.startY);
        this.ctx.lineTo(branch.endX, branch.endY);
        this.ctx.lineWidth = branch.lineWidth;
        if (this.colorMode === "gradient") {
          const grad = this.ctx.createLinearGradient(
            tree.treeX,
            tree.treeY,
            tree.treeX,
            tree.treeTop,
          );
          grad.addColorStop(0, tree.gradientColorStart);
          grad.addColorStop(1, tree.gradientColorEnd);
          this.ctx.strokeStyle = grad;
        } else {
          this.ctx.strokeStyle = tree.color;
        }
        this.ctx.stroke();
        this.ctx.closePath();

        if (branch.depth === tree.depth - 1) {
          leafQueue.push({
            sx: branch.startX,
            sy: branch.startY,
            ex: branch.endX,
            ey: branch.endY,
            depth: branch.depth,
          });
        }
      }
      if (currentDone) {
        tree.currentDepth++;
        stillGrowing = true;
      }
    }

    // --- Draw all leaves (so apples can be drawn on top) ---
    for (const leaf of leafQueue) {
      this.drawLeaf(leaf.ex, leaf.ey, tree);
    }
    // --- Draw fruits on top of leaves ---
    for (const leaf of leafQueue) {
      // only add fruits when tree is fully grown
      if (tree.depth === this.maxDepth && this.random(0, 1, tree) < 0.03) {
        const dx = leaf.ex - leaf.sx;
        const dy = leaf.ey - leaf.sy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const offset = Math.min(tree.leafSize * 0.35, 8);
        const ax = leaf.ex + nx * offset;
        const ay = leaf.ey + ny * offset;

        const fruitRadius = Math.max(3, Math.floor(tree.leafSize * 0.2));
        this.ctx.beginPath();
        this.ctx.arc(ax, ay, fruitRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = fruitType;
        this.ctx.fill();
        this.ctx.closePath();

        // highlight
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

    if (stillGrowing) {
      this.animation = requestAnimationFrame(
        this.animate.bind(this, currentDepth, tree),
      );
    } else {
      if (this.animation) cancelAnimationFrame(this.animation);
    }
  }
}

export default TreeAnimation;
