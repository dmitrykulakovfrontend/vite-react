import type { Branch, Planet, Tree } from "../types/Tree";
import type { Forest } from "../types/Tree";
import throttle from "./throttle";

type ModifiedTreeOptions = Tree & {
  branches: Branch[][];
  currentDepth: number;
  treeTop: number;
  treeX: number;
  treeY: number;
  fruitType: "red" | "orange";
  rng: () => number;
  leafPositions: { x: number; y: number }[]; // Add this line
};
type Colors = typeof colors;

const colors = {
  sky: "#00C0F0",
  leaf: "#30B700",
  planets: {
    Земля: "#009A17",
    Марс: "#D2691E",
    Юпитер: "#D2B48C",
  } as Record<Planet, string>,
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
  gradientOffset: number;
  direction: number;
  planet: Planet;
  currentColor: { r: number; g: number; b: number };
  targetColor: { r: number; g: number; b: number };
  colorTransition: { startTime: number | null; duration: number };
  currentUserTree?: Tree | null;
  userTreePosition: { x: number; y: number } | null; // Add this line
  maxTimesWatered: number;
  startingDepth: number;
  maxLeafSize: number;
  startingLeafSize: number;
  maxTreeWidth: number;
  startingTreeWidth: number;

  constructor(options: Forest & { container: HTMLDivElement }) {
    this.trees = options.trees;
    this.isLoading = options.isLoading;
    this.simulation = options.simulation || false;
    this.planet = options.planet || "Земля";
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

    this.maxTimesWatered = 20;
    this.maxDepth = 11;
    this.startingDepth = 1;
    this.maxLeafSize = 50;
    this.startingLeafSize = 7;
    this.maxTreeWidth = 35;
    this.startingTreeWidth = 3;

    this.colors = colors;
    this.currentColor = this.hexToRgb(this.colors.planets[this.planet]);
    this.targetColor = this.hexToRgb(this.colors.planets[this.planet]);
    this.colorTransition = { startTime: null, duration: 2000 }; // 2-second duration

    this.currentUserTree = options.currentUserTree;
    this.userTreePosition = null; // And initialize it here

    this.gradientOffset = 0;
    this.direction = 2;

    this.previousX = 0;
    this.previousY = 0;
    this.rowHeight = 500;
    this.treesPerRow = 500;
    this.distanceBetween = 600;
    // this.treeScale = 0.3725;
    this.treeScale = 1;

    this.hasCentered = false;
    this.addEventListeners();
    this.viewportTransform = {
      x: 0,
      y: 0,
      scale: this.isMainTree ? 1 : 0.1,
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
      // const horizonY = (this.canvas.height / 2) * this.viewportTransform.scale;

      // fill sky
      this.ctx.fillStyle = this.colors.sky;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // fill grass
      this.ctx.fillStyle = this.colors.planets[this.planet];
      this.ctx.fillRect(
        0,
        this.canvas.height / 2,
        this.canvas.width,
        this.canvas.height / 2,
      );

      // START: ================== SINGLE TREE DRAWING LOGIC ==================
      if (this.trees && this.trees.length > 0) {
        const tree = this.trees[0];

        // Center the viewport on the tree's base, which is at world coordinate (0, 0)
        this.viewportTransform.x = this.stageWidth / 2;
        this.viewportTransform.y = this.stageHeight; // Place base at the bottom

        // Apply transformation
        this.ctx.setTransform(
          this.viewportTransform.scale,
          0,
          0,
          this.viewportTransform.scale,
          this.viewportTransform.x,
          this.viewportTransform.y,
        );

        // Prepare and draw the single tree at world origin (0, 0)
        const rng = this.makeSeededRNG(tree.seed);
        const internalTree: ModifiedTreeOptions = {
          ...tree,
          branches: Array.from({ length: this.maxDepth }, () => []),
          currentDepth: 0,
          treeTop: Infinity,
          treeX: 0, // Tree's world X coordinate
          treeY: 0, // Tree's world Y coordinate (origin)
          rng,
          leafPositions: [],
          fruitType: this.random(0, 1, rng) > 0.5 ? "red" : "orange",
        };
        this.drawFullTree(internalTree);
      }
      // END: ================== SINGLE TREE DRAWING LOGIC ==================
    } else {
      // START: ================== FOREST DRAWING LOGIC (EXISTING) ==================
      this.updateBackgroundColor();
      let closestUserTreePosition: { x: number; y: number } | null = null;

      if (this.trees) {
        // Find the user's tree and center the view ONCE.
        if (!this.hasCentered) {
          if (this.currentUserTree) {
            for (let i = 0; i < this.trees.length; i++) {
              if (this.trees[i].seed === this.currentUserTree.seed) {
                const tree = this.trees[i];
                const depth = this.getTreeDepth(tree.timesWatered);
                const frequency = 0.2;
                const amplitude = depth * 5;
                const treeX =
                  (i % this.treesPerRow) * this.distanceBetween +
                  Math.sin(i * frequency) * amplitude;
                const treeY =
                  Math.floor(i / this.treesPerRow) * this.rowHeight +
                  Math.cos(i * frequency) * amplitude;

                this.userTreePosition = { x: treeX, y: treeY };
                this.viewportTransform.x =
                  this.stageWidth / 2 - treeX * this.viewportTransform.scale;
                this.viewportTransform.y =
                  this.stageHeight / 2 - treeY * this.viewportTransform.scale;
                this.hasCentered = true;
                break;
              }
            }
          }
          if (!this.hasCentered) {
            const centerX = (this.treesPerRow * this.distanceBetween) / 2;
            const centerY =
              (Math.ceil(this.trees.length / this.treesPerRow) *
                this.rowHeight) /
              2;
            this.viewportTransform.x =
              this.stageWidth / 2 - centerX * this.viewportTransform.scale;
            this.viewportTransform.y =
              this.stageHeight / 2 - centerY * this.viewportTransform.scale;
            this.hasCentered = true;
          }
        }

        // Logic to find the closest instance of the user's tree on every frame
        if (this.currentUserTree && this.userTreePosition) {
          const centerXWorld =
            (this.stageWidth / 2 - this.viewportTransform.x) /
            this.viewportTransform.scale;
          const centerYWorld =
            (this.stageHeight / 2 - this.viewportTransform.y) /
            this.viewportTransform.scale;
          const worldWidth = this.treesPerRow * this.distanceBetween;
          const numRows = Math.ceil(this.trees.length / this.treesPerRow);
          const worldHeight = numRows * this.rowHeight;

          let minDistanceSq = Infinity;
          const centerTileN = Math.round(
            (centerXWorld - this.userTreePosition.x) / worldWidth,
          );
          const centerTileM = Math.round(
            (centerYWorld - this.userTreePosition.y) / worldHeight,
          );

          for (let m = centerTileM - 1; m <= centerTileM + 1; m++) {
            for (let n = centerTileN - 1; n <= centerTileN + 1; n++) {
              const instanceX = this.userTreePosition.x + n * worldWidth;
              const instanceY = this.userTreePosition.y + m * worldHeight;
              const dx = instanceX - centerXWorld;
              const dy = instanceY - centerYWorld;
              const distanceSq = dx * dx + dy * dy;

              if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestUserTreePosition = { x: instanceX, y: instanceY };
              }
            }
          }
        }

        // Apply transform
        this.ctx.setTransform(
          this.viewportTransform.scale,
          0,
          0,
          this.viewportTransform.scale,
          this.viewportTransform.x,
          this.viewportTransform.y,
        );

        // Infinite drawing loop
        if (this.trees && this.trees.length > 0) {
          const numRows = Math.ceil(this.trees.length / this.treesPerRow);
          const viewLeft =
            -this.viewportTransform.x / this.viewportTransform.scale;
          const viewTop =
            -this.viewportTransform.y / this.viewportTransform.scale;
          const viewRight =
            (this.canvas.width - this.viewportTransform.x) /
            this.viewportTransform.scale;
          const viewBottom =
            (this.canvas.height - this.viewportTransform.y) /
            this.viewportTransform.scale;
          const startCol = Math.floor(viewLeft / this.distanceBetween) - 1;
          const endCol = Math.ceil(viewRight / this.distanceBetween) + 1;
          const startRow = Math.floor(viewTop / this.rowHeight) - 1;
          const endRow = Math.ceil(viewBottom / this.rowHeight) + 1;

          for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
              const wrappedRow = ((row % numRows) + numRows) % numRows;
              const wrappedCol =
                ((col % this.treesPerRow) + this.treesPerRow) %
                this.treesPerRow;
              const treeIndex = wrappedRow * this.treesPerRow + wrappedCol;

              if (treeIndex >= this.trees.length) continue;

              const tree = this.trees[treeIndex];
              const absoluteIndex = row * this.treesPerRow + col;
              const frequency = 0.2;
              const treeX =
                col * this.distanceBetween +
                Math.sin(absoluteIndex * frequency);
              const treeY =
                row * this.rowHeight + Math.cos(absoluteIndex * frequency);
              const rng = this.makeSeededRNG(tree.seed);
              const internalTree: ModifiedTreeOptions = {
                ...tree,
                branches: Array.from({ length: this.maxDepth }, () => []),
                currentDepth: 0,
                treeTop: Infinity,
                treeX,
                treeY,
                leafPositions: [],
                rng,
                fruitType: this.random(0, 1, rng) > 0.5 ? "red" : "orange",
              };
              this.drawFullTree(internalTree);
            }
          }
        }
        if (closestUserTreePosition) {
          this.drawOffscreenIndicator(closestUserTreePosition);
        }
      }
      if (closestUserTreePosition) {
        this.drawHighlight(closestUserTreePosition, this.currentUserTree);
      }
      // Draw planet name on top of everything
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 48px FuturaPTHeavy,sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "top";
      const padding = 30;
      if (this.planet) {
        this.ctx.fillText(this.planet, this.canvas.width / 2, padding);
      }
      // END: ================== FOREST DRAWING LOGIC (EXISTING) ==================
    }
  }

  growthStage(
    start: number,
    goal: number,
    watered: number,
    total = this.maxTimesWatered, // watering once a week during 3 years
  ) {
    if (watered <= 0) return start;
    if (watered >= total) return goal;

    const steps = goal - start;
    if (steps <= 0) return start; // no growth if goal isn’t bigger

    // figure out how many waterings per step
    const wateringsPerStep = total / steps;

    // number of completed integer steps
    const completedSteps = Math.floor(watered / wateringsPerStep);

    return start + completedSteps;
  }

  getTreeDepth(timesWatered: number) {
    return this.growthStage(this.startingDepth, this.maxDepth, timesWatered);
  }
  getLeafSize(timesWatered: number) {
    return this.growthStage(
      this.startingLeafSize,
      this.maxLeafSize,
      timesWatered,
    );
  }
  getTreeWidth(timesWatered: number) {
    return this.growthStage(
      this.startingTreeWidth,
      this.maxTreeWidth,
      timesWatered,
    );
  }

  drawSimplifiedTree(tree: ModifiedTreeOptions) {
    const ctx = this.ctx;
    ctx.beginPath();
    // simple trunk
    const trunkHeight = (tree.treeScale || 1) * 5 * this.maxDepth;
    ctx.moveTo(tree.treeX, tree.treeY);
    ctx.lineTo(tree.treeX, tree.treeY - trunkHeight);
    ctx.lineWidth = this.getTreeWidth(tree.timesWatered) * 1.5;
    ctx.strokeStyle = this.getTrunkColor(tree);
    ctx.stroke();
    ctx.closePath();

    // optional: one or two main branches
    ctx.beginPath();
    ctx.moveTo(tree.treeX, tree.treeY - trunkHeight / 2);
    ctx.lineTo(tree.treeX - trunkHeight / 4, tree.treeY - trunkHeight);
    ctx.moveTo(tree.treeX, tree.treeY - trunkHeight / 2);
    ctx.lineTo(tree.treeX + trunkHeight / 4, tree.treeY - trunkHeight);
    ctx.lineWidth = this.getTreeWidth(tree.timesWatered);
    ctx.stroke();
    ctx.closePath();
  }
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  private lerp(start: number, end: number, amount: number): number {
    return start * (1 - amount) + end * amount;
  }

  private updateBackgroundColor() {
    // Determine the desired color based on the current planet

    const desiredColorRgb = this.hexToRgb(this.colors.planets[this.planet]);

    // If the target color changes, start a new transition
    if (
      desiredColorRgb.r !== this.targetColor.r ||
      desiredColorRgb.g !== this.targetColor.g ||
      desiredColorRgb.b !== this.targetColor.b
    ) {
      this.targetColor = desiredColorRgb;
      this.colorTransition.startTime = Date.now();
    }

    // If a transition is in progress, calculate the interpolated color
    if (this.colorTransition.startTime) {
      const elapsed = Date.now() - this.colorTransition.startTime;
      const progress = Math.min(1, elapsed / this.colorTransition.duration);

      this.currentColor.r = this.lerp(
        this.currentColor.r,
        this.targetColor.r,
        progress,
      );
      this.currentColor.g = this.lerp(
        this.currentColor.g,
        this.targetColor.g,
        progress,
      );
      this.currentColor.b = this.lerp(
        this.currentColor.b,
        this.targetColor.b,
        progress,
      );

      // If the transition is complete, stop it
      if (progress >= 1) {
        this.colorTransition.startTime = null;
      }
    }

    this.ctx.fillStyle = `rgb(${Math.round(this.currentColor.r)}, ${Math.round(
      this.currentColor.g,
    )}, ${Math.round(this.currentColor.b)})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Keep the render loop going if a transition is active
    if (this.colorTransition.startTime && !this.simulation) {
      requestAnimationFrame(() => this.render());
    }
  }
  private drawHighlight(
    treePosition: { x: number; y: number },
    tree: Tree | null | undefined,
  ) {
    if (!this.userTreePosition) return;
    if (!tree) return;

    const { ctx, viewportTransform, canvas, simulation } = this;
    const { x: treeWorldX, y: treeWorldY } = treePosition;
    const { x: viewX, y: viewY, scale } = viewportTransform;

    // Calculate the tree's position on the screen
    const screenX = treeWorldX * scale + viewX;
    const screenY = treeWorldY * scale + viewY;

    const { width: w, height: h } = canvas;
    const padding = 40;

    // Determine if the highlight should be drawn based on the mode
    let shouldDrawHighlight = false;

    if (simulation) {
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(centerX, centerY);
      const distance = Math.hypot(screenX - centerX, screenY - centerY);
      shouldDrawHighlight = distance < radius - padding;
    } else {
      shouldDrawHighlight =
        screenX > padding &&
        screenX < w - padding &&
        screenY > padding &&
        screenY < h - padding;
    }

    // If the highlight should not be drawn, exit early
    if (!shouldDrawHighlight) {
      return;
    }
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, viewX, viewY);

    // Common drawing logic for the highlight pin
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, viewX, viewY);

    const pinBaseX = treeWorldX;
    const pinBaseY = treeWorldY;

    // Draw the "Ваше дерево" text
    ctx.font = `bold ${4 * this.getTreeDepth(tree.timesWatered)}px Arial, sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Ваше дерево",
      pinBaseX - 40,
      pinBaseY - 4 * this.getTreeDepth(tree.timesWatered),
    );

    ctx.restore();
  }
  private drawOffscreenIndicator(treePosition: { x: number; y: number }) {
    const { x: treeWorldX, y: treeWorldY } = treePosition;
    const { x: viewX, y: viewY, scale } = this.viewportTransform;
    const { width: w, height: h } = this.canvas;
    const padding = 40;

    // Calculate the tree's position on the screen
    const screenX = treeWorldX * scale + viewX;
    const screenY = treeWorldY * scale + viewY;

    // Determine if the indicator needs to be drawn and its position
    let indicatorX, indicatorY, angle;

    if (this.simulation) {
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(centerX, centerY);
      const distance = Math.hypot(screenX - centerX, screenY - centerY);

      // If the tree is visible within the simulation circle, do nothing
      if (distance < radius - padding) {
        return;
      }

      angle = Math.atan2(screenY - centerY, screenX - centerX);
      indicatorX = centerX + (radius - padding) * Math.cos(angle);
      indicatorY = centerY + (radius - padding) * Math.sin(angle);
    } else {
      // If the tree is visible on screen, do nothing
      if (
        screenX > padding &&
        screenX < w - padding &&
        screenY > padding &&
        screenY < h - padding
      ) {
        return;
      }

      const centerX = w / 2;
      const centerY = h / 2;
      angle = Math.atan2(screenY - centerY, screenX - centerX);
      const boundX = w - padding;
      const boundY = h - padding;
      const tan = Math.tan(angle);

      if (Math.abs((boundY - centerY) / tan) < boundX - centerX) {
        // It intersects with the top or bottom edge first
        indicatorY = screenY > centerY ? boundY : padding;
        indicatorX = centerX + (indicatorY - centerY) / tan;
      } else {
        // It intersects with the left or right edge first
        indicatorX = screenX > centerX ? boundX : padding;
        indicatorY = centerY + (indicatorX - centerX) * tan;
      }
    }

    // Common drawing logic for the arrow
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.save();
    this.ctx.translate(indicatorX, indicatorY);
    this.ctx.rotate(angle);

    // Draw a triangle shape
    this.ctx.beginPath();
    this.ctx.moveTo(15, 0);
    this.ctx.lineTo(-10, -10);
    this.ctx.lineTo(-10, 10);
    this.ctx.closePath();

    this.ctx.fillStyle = "red";
    this.ctx.fill();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    this.ctx.restore();
  }
  updateZooming(e: WheelEvent) {
    e.preventDefault();

    let mouseX, mouseY;

    // FIX: If it's the main tree, center the zoom on the tree's base.
    // Otherwise, zoom towards the mouse pointer.
    if (this.isMainTree) {
      mouseX = this.stageWidth / 2;
      mouseY = this.stageHeight;
    } else {
      mouseX = e.offsetX;
      mouseY = e.offsetY;
    }

    const { x, y, scale } = this.viewportTransform;

    const zoomFactor = 1.0 - e.deltaY * 0.001; // >1 zoom in, <1 zoom out
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.01), 5);

    // Convert mouse screen coords into world coords before zoom
    const worldX = (mouseX - x) / scale;
    const worldY = (mouseY - y) / scale;

    // Recalculate transform so the point under the mouse stays there
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
            let zoomCenterX, zoomCenterY;

            // FIX: If it's the main tree, center the zoom on the tree's base.
            // Otherwise, zoom towards the fingers.
            if (this.isMainTree) {
              zoomCenterX = this.stageWidth / 2;
              zoomCenterY = this.stageHeight;
            } else {
              zoomCenterX = midX;
              zoomCenterY = midY;
            }

            const zoomFactor = dist / lastDist;
            const { x, y, scale } = this.viewportTransform;
            const newScale = Math.min(Math.max(scale * zoomFactor, 0.1), 5);

            const worldX = (zoomCenterX - x) / scale;
            const worldY = (zoomCenterY - y) / scale;

            this.viewportTransform.x = zoomCenterX - worldX * newScale;
            this.viewportTransform.y = zoomCenterY - worldY * newScale;
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
    if (t) {
      // if (t && this.getTreeDepth(t.timesWatered) < this.maxDepth) {
      t.timesWatered = tree.timesWatered;
      t.timesWatered++;
      if (t.decayProgress > 0) {
        t.decayProgress = Math.max((t.decayProgress || 0) - 1, 0);
      }
      if (this.isMainTree) {
        this.updateZooming({
          preventDefault: () => {},
          clientX: this.stageWidth / 2,
          clientY: this.stageHeight,
          deltaY: 0, // negative = zoom in
        } as unknown as WheelEvent);
      }
      this.render();
    }
  }

  simulateGrow() {
    if (this.trees) {
      for (const tree of this.trees) {
        if (
          this.getTreeDepth(tree.timesWatered) < this.maxDepth &&
          Math.random() < 0.3
        ) {
          tree.timesWatered++;
          if (tree.decayProgress > 0) {
            tree.decayProgress = Math.max((tree.decayProgress || 0) - 1, 0);
          }
        }
        if (
          this.getTreeDepth(tree.timesWatered) < this.maxDepth &&
          Math.random() < 0.5
        ) {
          tree.decayProgress = Math.min((tree.decayProgress || 0) + 0.3, 2);
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
  random(min: number, max: number, rng: () => number) {
    if (rng) {
      return min + rng() * (max - min);
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
    if (depth >= this.getTreeDepth(tree.timesWatered)) return;

    const scale = tree.treeScale || 1;

    const baseLen = 12 * scale;
    const decay = 0.72; // 0.6-0.85: smaller = rapidly shorter branches
    const jitterPct = this.random(-0.18, 0.18, tree.rng); // +/- ~18% length jitter
    const len =
      baseLen *
      Math.pow(decay, depth) *
      (1 + jitterPct) *
      this.getTreeDepth(tree.timesWatered);

    const endX = startX + Math.cos(this.degToRad(angle)) * len;
    const endY = startY + Math.sin(this.degToRad(angle)) * len;

    if (startY < tree.treeTop) tree.treeTop = startY;
    if (endY < tree.treeTop) tree.treeTop = endY;

    const rawWidth =
      (this.getTreeWidth(tree.timesWatered) || 1) *
      (0.9 +
        (this.getTreeDepth(tree.timesWatered) /
          Math.max(1, this.getTreeDepth(tree.timesWatered))) *
          1.1);
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
    const startWidth = this.getTreeWidth(tree.timesWatered);

    const cpX = startX + (endX - startX) * 0.5 + (endY - startY) * 0.1;
    const cpY = startY + (endY - startY) * 0.5 - (endX - startX) * 0.1;

    // Draw the trunk color on top
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    this.ctx.lineWidth = startWidth; // Thinner for the trunk fill
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = this.getTrunkColor(tree);
    this.ctx.stroke();
    this.ctx.closePath();
    // store branch
    tree.branches[depth].push(branch);
    if (
      depth >= this.getTreeDepth(tree.timesWatered) - 2 &&
      this.getLeafSize(tree.timesWatered) > 0
    ) {
      const leavesPerBranch = this.random(2, 4, tree.rng);
      for (let i = 0; i < leavesPerBranch; i++) {
        const jitterX = this.random(
          -this.getLeafSize(tree.timesWatered) / 2,
          this.getLeafSize(tree.timesWatered) / 2,
          tree.rng,
        );
        const jitterY = this.random(
          -this.getLeafSize(tree.timesWatered) / 2,
          this.getLeafSize(tree.timesWatered) / 2,
          tree.rng,
        );
        this.drawLeaf(endX + jitterX, endY + jitterY, tree);
      }
    }

    // Branching
    const alwaysSplitUntil = 3; // top levels always split to give a canopy
    const baseSplitChance = 0.86 - depth * 0.12; // decreases with depth
    const splitChance =
      depth <= alwaysSplitUntil ? 1 : Math.max(0.25, baseSplitChance);

    // angle jitter helper
    const angleJitter = () => this.random(-6, 6, tree.rng); // degrees

    const leftOffset = 14 + this.random(0, 10, tree.rng) + angleJitter();
    const rightOffset = 14 + this.random(0, 10, tree.rng) + angleJitter();

    const doLeft = this.random(0, 1, tree.rng) < splitChance;
    const doRight = this.random(0, 1, tree.rng) < splitChance;

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
      if (
        this.random(0, 1, tree.rng) < 0.8 &&
        depth < this.getTreeDepth(tree.timesWatered) - 1
      ) {
        this.createBranch(
          endX,
          endY,
          angle + this.random(-4, 4, tree.rng),
          depth + 1,
          tree,
        );
        didContinue = true;
      }
    }
    if (!didSplit && !didContinue && this.getLeafSize(tree.timesWatered) > 0) {
      const numLeaves = this.random(2, 4, tree.rng);
      for (let i = 0; i < numLeaves; i++) {
        // Place leaves near the end of the branch
        const t = this.random(0.7, 1, tree.rng);
        const x =
          startX +
          (endX - startX) * t +
          this.random(
            -this.getLeafSize(tree.timesWatered),
            this.getLeafSize(tree.timesWatered),
            tree.rng,
          );
        const y =
          startY +
          (endY - startY) * t +
          this.random(
            -this.getLeafSize(tree.timesWatered),
            this.getLeafSize(tree.timesWatered),
            tree.rng,
          );
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
    tree.leafPositions.push({ x, y });
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.getLeafSize(tree.timesWatered), 0, Math.PI * 2);

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
    tree.leafPositions = [];

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
      // This console log is safe to keep or remove
    }

    // Draw fruits
    const applesToDraw = tree.apples ? tree.apples : 0;
    // First, initialize the array to store leaf positions for this specific tree.
    // Now, place apples at the recorded leaf positions.
    // Now, place apples at the recorded leaf positions using a collision-avoidance and nudge system.
    if (
      applesToDraw > 0 &&
      tree.decayProgress < 1 &&
      tree.leafPositions.length > 0
    ) {
      // 1. SETUP
      const placedApplePositions: { x: number; y: number }[] = [];
      const fruitRadius = Math.max(
        1,
        Math.floor(this.getLeafSize(tree.timesWatered) * 0.2),
      );
      const minDistance = fruitRadius * 2;
      const leafSize = this.getLeafSize(tree.timesWatered);

      // Create a shuffled copy of all available leaf positions.
      // Shuffling prevents us from repeatedly trying the same crowded leaves.
      const availableLeafPositions = [...tree.leafPositions].sort(
        () => tree.rng() - 0.5,
      );

      // 2. MAIN LOOP: Try to place each apple.
      for (let i = 0; i < applesToDraw; i++) {
        let applePlaced = false;
        const maxAttemptsPerApple = 20;
        let attempts = 0;

        // Try different leaves until we place this apple or run out of leaves.
        while (!applePlaced && attempts < maxAttemptsPerApple) {
          // Get a random available leaf position from the shuffled list
          const leafCenter =
            availableLeafPositions[
              Math.floor(tree.rng() * availableLeafPositions.length)
            ];
          let finalPosition: { x: number; y: number } | null = null;

          // Helper function to check if a position collides with already placed apples.
          const isColliding = (pos: { x: number; y: number }): boolean => {
            for (const placedPos of placedApplePositions) {
              if (
                Math.hypot(pos.x - placedPos.x, pos.y - placedPos.y) <
                minDistance
              ) {
                return true;
              }
            }
            return false;
          };

          // 3. ATTEMPT 1: Try the exact center of the leaf.
          if (!isColliding(leafCenter)) {
            finalPosition = leafCenter;
          } else {
            // 4. ATTEMPT 2: Nudge to a nearby spot on the same leaf.
            const maxNudges = 10;
            for (let j = 0; j < maxNudges; j++) {
              // Pick a random position within the leaf's radius.
              const angle = tree.rng() * Math.PI * 2;
              const distance = tree.rng() * (leafSize - fruitRadius);
              const potentialPosition = {
                x: leafCenter.x + Math.cos(angle) * distance,
                y: leafCenter.y + Math.sin(angle) * distance,
              };

              if (!isColliding(potentialPosition)) {
                finalPosition = potentialPosition;
                break;
              }
            }
          }

          // 5. DRAW THE APPLE if we found a valid position on this leaf.
          if (finalPosition) {
            placedApplePositions.push(finalPosition);
            // ... (The drawing code is the same as before) ...
            const ax = finalPosition.x;
            const ay = finalPosition.y;
            this.ctx.beginPath();
            this.ctx.arc(ax, ay, fruitRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = tree.fruitType;
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

            applePlaced = true; // Mark this apple as placed.
          }

          attempts++;
        }
      }
    }
  }
}

export default TreeAnimation;
