import type { Branch, Planet, Tree } from "../types/Tree";
import type { Forest } from "../types/Tree";
import throttle from "./throttle";

type ModifiedTreeOptions = Tree & {
  branches: Branch[][];
  currentDepth: number;
  treeTop: number;
  treeX: number;
  treeY: number;
  rng: () => number;
};
type Colors = typeof colors;

const colors = {
  sky: "#00C0F0",
  leaf: "#30B700",
  grass: "#009A17",
  jupiter: "#D2B48C",
  mars: "#D2691E",
  trunk: "#8B4513",
  witheredTrunk: "#5A4634",
  witheredLeaf: "#FFD700",
  dyingTrunk: "#602020",
  dyingLeaf: "#A1372F",
} as const;
class TreeAnimation {
  trees: Tree[];
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
  isLoading: boolean;
  simulation: boolean;
  rowHeight: number;
  treesPerRow: number;
  distanceBetween: number;
  colors: Colors;
  branchWidth: number;
  defaultLeafSize: number;
  gradientOffset: number;
  direction: number;
  planet: Planet;

  constructor(options: Forest & { container: HTMLDivElement }) {
    this.trees = options.trees;
    this.isLoading = options.isLoading;
    this.simulation = options.simulation || false;
    this.planet = options.planet || "Земле";
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

    this.gradientOffset = 0;
    this.direction = 2;

    this.previousX = 0;
    this.previousY = 0;
    this.maxDepth = 11;
    this.rowHeight = 150;
    this.treesPerRow = 500;
    this.distanceBetween = 150;
    // this.treeScale = 0.3725;
    this.treeScale = 1;
    this.branchWidth = 3;
    this.defaultLeafSize = 2;

    this.hasCentered = false;
    this.addEventListeners();
    this.viewportTransform = {
      x: 0,
      y: 0,
      scale: 0.5,
    };

    this.render();
  }
  render() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.isLoading) {
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Check for boundaries and reverse direction
      if ((this.gradientOffset += this.direction) >= w) {
        this.direction = -this.direction;
      } else if (this.gradientOffset <= 0) {
        this.direction = 2;
      }

      // Update the offset based on the current direction
      this.gradientOffset += this.direction;

      const grad = this.ctx.createLinearGradient(
        this.gradientOffset - w / 2, // Adjust start and end to center the gradient
        0,
        this.gradientOffset + w / 2,
        h,
      );
      grad.addColorStop(0, "rgb(40,58,151)");
      grad.addColorStop(1, "rgb(0,174,239)");

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);

      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 48px FuturaPTBook,sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("Загрузка...", w / 2, h / 2);

      requestAnimationFrame(() => this.render());
      return;
    }

    if (this.isMainTree) {
      const horizonY = (this.canvas.height / 2) * this.viewportTransform.scale;

      // fill sky
      this.ctx.fillStyle = this.colors.sky;
      this.ctx.fillRect(0, 0, this.canvas.width, horizonY);

      // fill grass
      this.ctx.fillStyle = this.colors.grass;
      this.ctx.fillRect(
        0,
        horizonY,
        this.canvas.width,
        this.canvas.height - horizonY,
      );
    } else {
      console.log(this.planet);
      this.ctx.fillStyle = this.colors.grass;
      if (this.planet === "Земле") {
        this.ctx.fillStyle = this.colors.grass;
      } else if (this.planet === "Юпитере") {
        this.ctx.fillStyle = this.colors.jupiter;
      } else if (this.planet === "Марсе") {
        this.ctx.fillStyle = this.colors.mars;
      }

      // Apply the chosen color and draw the background
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
          tree.leafSize = tree.depth * 1.5;
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
            currentDepth: 0,
            treeTop: Infinity,
            treeX,
            treeY,
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
    ctx.lineWidth = this.branchWidth * 1.5;
    ctx.strokeStyle = this.getTrunkColor(tree);
    ctx.stroke();
    ctx.closePath();

    // optional: one or two main branches
    ctx.beginPath();
    ctx.moveTo(tree.treeX, tree.treeY - trunkHeight / 2);
    ctx.lineTo(tree.treeX - trunkHeight / 4, tree.treeY - trunkHeight);
    ctx.moveTo(tree.treeX, tree.treeY - trunkHeight / 2);
    ctx.lineTo(tree.treeX + trunkHeight / 4, tree.treeY - trunkHeight);
    ctx.lineWidth = this.branchWidth;
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

    const throttledMouseMove = throttle(this.onMouseMove.bind(this), 20);
    const throttledMouseWheel = throttle(this.onMouseWheel.bind(this), 20);

    this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
      this.previousX = e.clientX;
      this.previousY = e.clientY;

      this.canvas.addEventListener("mousemove", throttledMouseMove);
    });

    const removeMouseMove = () => {
      this.canvas.removeEventListener("mousemove", throttledMouseMove);
    };

    this.canvas.addEventListener("mouseup", removeMouseMove);
    this.canvas.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
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

    // automatically adjust scale
    // this.treeScale = Math.min(this.stageWidth, this.stageHeight) / 800;

    this.clearCanvas();
    this.render();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
  }

  growOneLevel(tree: Tree) {
    const t = this.trees?.find((tr) => tr.seed === tree.seed);
    if (t && t.depth < this.maxDepth) {
      t.depth++;
      t.leafSize++;
      if (t.decayProgress > 0) {
        t.decayProgress = Math.max((t.decayProgress || 0) - 1, 0);
      }
      this.updateZooming({
        preventDefault: () => {},
        clientX: this.stageWidth / 2,
        clientY: this.stageHeight,
        deltaY: -20, // negative = zoom in
      } as unknown as WheelEvent);
      this.render();
    }
  }

  simulateGrow() {
    if (this.trees) {
      for (const tree of this.trees) {
        if (tree.depth < this.maxDepth) {
          tree.depth++;
          tree.leafSize++;
        }
      }
    }
    this.render();
  }

  witherTree(tree: Tree) {
    const t = this.trees?.find((tr) => tr.seed === tree.seed);
    if (t) {
      // Increment progress, capping at 2 (fully decayed)
      t.decayProgress = Math.min((t.decayProgress || 0) + 0.1, 2);
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
    // stop recursion
    if (depth >= tree.depth) return;

    const scale = tree.treeScale || 1;
    const remaining = Math.max(1, tree.depth - depth);

    const baseLen = 8 * scale;
    const decay = 0.72; // 0.6-0.85: smaller = rapidly shorter branches
    const jitterPct = this.random(-0.18, 0.18, tree); // +/- ~18% length jitter
    const len =
      baseLen *
      Math.pow(decay, depth) *
      (1 + jitterPct) *
      Math.min(remaining, 6);

    const endX = startX + Math.cos(this.degToRad(angle)) * len;
    const endY = startY + Math.sin(this.degToRad(angle)) * len;

    if (startY < tree.treeTop) tree.treeTop = startY;
    if (endY < tree.treeTop) tree.treeTop = endY;

    const rawWidth =
      (this.branchWidth || 1) *
      (0.9 + (remaining / Math.max(1, tree.depth)) * 1.1);
    const lineWidth = Math.min(Math.max(rawWidth, 0.5), 12);

    const branch = {
      startX,
      startY,
      endX,
      endY,
      lineWidth,
      depth,
    };

    // draw branch
    this.ctx.beginPath();
    this.ctx.moveTo(branch.startX, branch.startY);
    this.ctx.lineTo(branch.endX, branch.endY);
    this.ctx.lineWidth = branch.lineWidth;
    this.ctx.strokeStyle = this.getTrunkColor(tree);
    this.ctx.stroke();
    this.ctx.closePath();

    // store branch
    tree.branches[depth].push(branch);
    if (depth >= tree.depth - 2 && tree.leafSize > 0) {
      const leavesPerBranch = Math.max(1, Math.floor(tree.leafSize / 6));
      for (let i = 0; i < leavesPerBranch; i++) {
        const jitterX = this.random(-tree.leafSize, tree.leafSize, tree);
        const jitterY = this.random(-tree.leafSize, tree.leafSize, tree);
        this.drawLeaf(endX + jitterX, endY + jitterY, tree);
      }
    }

    // Branching
    const alwaysSplitUntil = 2; // top levels always split to give a canopy
    const baseSplitChance = 0.86 - depth * 0.12; // decreases with depth
    const splitChance =
      depth <= alwaysSplitUntil ? 1 : Math.max(0.25, baseSplitChance);

    // angle jitter helper
    const angleJitter = () => this.random(-6, 6, tree); // degrees

    const leftOffset = 14 + this.random(0, 10, tree) + angleJitter();
    const rightOffset = 14 + this.random(0, 10, tree) + angleJitter();

    const doLeft = this.random(0, 1, tree) < splitChance;
    const doRight = this.random(0, 1, tree) < splitChance;

    if (doLeft) {
      this.createBranch(endX, endY, angle - leftOffset, depth + 1, tree);
    }
    if (doRight) {
      this.createBranch(endX, endY, angle + rightOffset, depth + 1, tree);
    }
    const didSplit = doLeft || doRight;
    let didContinue = false;

    // If neither side split, give it a chance to continue straight
    if (!didSplit) {
      if (this.random(0, 1, tree) < 0.8 && depth < tree.depth - 1) {
        this.createBranch(
          endX,
          endY,
          angle + this.random(-4, 4, tree),
          depth + 1,
          tree,
        );
        didContinue = true;
      }
    }
    if (!didSplit && !didContinue && tree.leafSize > 0) {
      const numLeaves = this.random(3, 6, tree);
      for (let i = 0; i < numLeaves; i++) {
        // Place leaves near the end of the branch
        const t = this.random(0.7, 1, tree);
        const x =
          startX +
          (endX - startX) * t +
          this.random(-tree.leafSize, tree.leafSize, tree);
        const y =
          startY +
          (endY - startY) * t +
          this.random(-tree.leafSize, tree.leafSize, tree);
        this.drawLeaf(x, y, tree);
      }
    }
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

    const leafDecayThreshold = tree.rng(); // A value from 0.0 to 1.0
    const currentDecay = tree.decayProgress || 0;

    if (currentDecay < leafDecayThreshold) {
      this.ctx.fillStyle = this.colors.leaf; // Green
    } else if (currentDecay < leafDecayThreshold + 1) {
      this.ctx.fillStyle = this.colors.witheredLeaf; // Yellow
    } else {
      this.ctx.fillStyle = this.colors.dyingLeaf; // Red
    }

    this.ctx.fill();
    this.ctx.closePath();
  }
  getTrunkColor(tree: Tree) {
    const stage = Math.floor(tree.decayProgress || 0);
    switch (stage) {
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
  drawFullTree(tree: ModifiedTreeOptions) {
    // Reset tree top
    tree.treeTop = Infinity;
    if (tree.decayProgress > 0) {
      tree.treeScale = (tree.treeScale || 1) * (1 - tree.decayProgress * 0.1);
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
    if (this.isMainTree) {
      console.log(tree.branches);
    }

    // Draw fruits
    const fruitType = this.random(0, 1, tree) > 0.5 ? "red" : "orange";
    for (let d = 0; d < tree.branches.length; d++) {
      for (const branch of tree.branches[d]) {
        if (
          branch.depth >= this.maxDepth - 1 &&
          this.random(0, 1, tree) < 0.8 && // 80% chance
          tree.decayProgress < 1
        ) {
          const dx = branch.endX - branch.startX;
          const dy = branch.endY - branch.startY;
          const len = Math.hypot(dx, dy) || 1;
          const nx = dx / len;
          const ny = dy / len;
          const offset = Math.min(3, tree.leafSize * 0.35);
          const ax = branch.endX + nx * offset;
          const ay = branch.endY + ny * offset;

          const fruitRadius = Math.max(1, Math.floor(tree.leafSize * 0.2));
          this.ctx.beginPath();
          this.ctx.arc(ax, ay, fruitRadius, 0, Math.PI * 2);
          this.ctx.fillStyle = fruitType;
          this.ctx.fill();
          this.ctx.closePath();

          // tiny highlight
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
