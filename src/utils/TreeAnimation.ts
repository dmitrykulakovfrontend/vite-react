import type { Branch, TreeOptions } from "../types/Tree";

class TreeAnimation {
  container: HTMLDivElement;
  fullDepth: number;
  depth: number;
  pixelRatio: number;
  growthSpeed: number;
  treeScale: number;
  branchWidth: number;
  colorMode: "gradient" | "solid";
  color: string;
  gradientStart: string;
  gradientEnd: string;
  leafColor: string;
  leafSize: number;
  originalSeed: number | string;
  seed: number;
  randSeq?: number[];
  randCounter?: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  branches: Branch[][];
  animation: number | null;
  currentDepth: number;
  stageWidth!: number;
  stageHeight!: number;
  treeTop: number;
  treeX: number;
  treeY: number;

  constructor(options: TreeOptions) {
    this.container = options.container;
    this.fullDepth = 11;
    this.depth = options.depth || this.fullDepth;
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    this.growthSpeed = options.growthSpeed;
    this.treeScale = options.treeScale;
    this.branchWidth = options.branchWidth;
    this.colorMode = options.colorMode;
    this.color = options.color;
    this.gradientStart = options.gradientColorStart;
    this.gradientEnd = options.gradientColorEnd;
    this.leafColor = options.leafColor;
    this.leafSize = options.leafSize;
    this.originalSeed = options.seed;
    this.seed = Math.random() * 100000;
    // if (this.seed !== undefined) {
    //   const totalCount = 10000;
    //   this.randSeq = [];
    //   let s = this.seed;
    //   for (let i = 0; i < totalCount; i++) {
    //     s = (s * 16807) % 2147483647;
    //     const rnd = (s - 1) / 2147483646;
    //     this.randSeq.push(rnd);
    //   }
    //   this.randCounter = 0;
    // }
    if (typeof this.originalSeed === "string") {
      this.seed = [...this.originalSeed].reduce(
        (acc, c) => acc * 31 + c.charCodeAt(0),
        0,
      );
    }
    console.log(this.seed);
    const totalCount = 10000;
    this.randSeq = [];
    let s = this.seed;
    for (let i = 0; i < totalCount; i++) {
      s = (s * 16807) % 2147483647;
      const rnd = (s - 1) / 2147483646;
      this.randSeq.push(rnd);
    }
    this.randCounter = 0;
    this.canvas = document.createElement("canvas");
    this.container.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    this.ctx = ctx;
    this.branches = [];
    this.animation = null;
    this.currentDepth = 0;
    this.treeTop = Infinity;
    this.treeX = 0;
    this.treeY = 0;
    this.addEventListeners();
    this.resize();
    this.startTree(this.stageWidth / 2, this.stageHeight);
  }

  addEventListeners() {
    window.addEventListener("resize", this.resize.bind(this));
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
    this.startTree(this.stageWidth / 2, this.stageHeight);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
  }

  startTree(posX: number, posY: number) {
    if (this.animation) cancelAnimationFrame(this.animation);
    this.clearCanvas();
    if (this.seed !== undefined) this.randCounter = 0;
    this.branches = Array.from({ length: this.fullDepth }, () => []);
    this.currentDepth = 0;
    this.treeTop = Infinity;
    this.treeX = posX;
    this.treeY = posY;

    const maxScale =
      Math.min(this.stageWidth, this.stageHeight) / (13 * this.fullDepth);
    if (this.treeScale > maxScale) this.treeScale = maxScale;

    this.createBranch(this.treeX, this.treeY, -90, 0);
    for (let d = 0; d < this.fullDepth; d++) {
      for (let k = 0; k < this.branches[d].length; k++) {
        this.branches[d][k].cntFrame = 0;
      }
    }
    this.animate();
  }

  growOneLevel() {
    if (this.depth < this.fullDepth) {
      this.depth++;
      this.leafSize++;
      this.animate();
    }
  }
  growBackOneLevel() {
    if (this.depth > 1) {
      this.depth--;
      this.leafSize--;
      this.animate();
    }
  }
  random(min: number, max: number) {
    if (this.randSeq && this.randCounter !== undefined) {
      return min + this.randSeq[this.randCounter++] * (max - min);
    } else {
      return Math.random() * (max - min) + min;
    }
  }

  degToRad(degree: number) {
    return degree * (Math.PI / 180);
  }

  createBranch(startX: number, startY: number, angle: number, depth: number) {
    if (depth === this.fullDepth) return;
    const scale = this.treeScale;
    const len =
      (depth === 0 ? this.random(10, 13) : this.random(0, 11)) * scale;
    const factor = this.fullDepth - depth;
    const endX = startX + Math.cos(this.degToRad(angle)) * len * factor;
    const endY = startY + Math.sin(this.degToRad(angle)) * len * factor;
    if (startY < this.treeTop) this.treeTop = startY;
    if (endY < this.treeTop) this.treeTop = endY;
    const branchWidthFactor = this.branchWidth;
    const branch = {
      startX,
      startY,
      endX,
      endY,
      lineWidth: factor * branchWidthFactor,
      frame: 100,
      cntFrame: 0,
      plugin: this,
      depth,
      draw: (ctx: CanvasRenderingContext2D, speed: number) => {
        if (branch.cntFrame < branch.frame) {
          ctx.beginPath();
          const progress = branch.cntFrame / branch.frame;
          const currX =
            branch.startX + (branch.endX - branch.startX) * progress;
          const currY =
            branch.startY + (branch.endY - branch.startY) * progress;
          ctx.moveTo(branch.startX, branch.startY);
          ctx.lineTo(currX, currY);
          ctx.lineWidth = branch.lineWidth;
          if (this.colorMode === "gradient") {
            const grad = ctx.createLinearGradient(
              this.treeX,
              this.treeY,
              this.treeX,
              this.treeTop,
            );
            grad.addColorStop(0, this.gradientStart);
            grad.addColorStop(1, this.gradientEnd);
            ctx.strokeStyle = grad;
          } else {
            ctx.strokeStyle = this.color;
          }
          ctx.stroke();
          ctx.closePath();
          branch.cntFrame += speed;
          return false;
        }
        return true;
      },
    };
    this.branches[depth].push(branch);
    this.createBranch(endX, endY, angle - this.random(15, 23), depth + 1);
    this.createBranch(endX, endY, angle + this.random(15, 23), depth + 1);
  }

  drawLeaf(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.leafSize, 0, Math.PI * 2);
    this.ctx.fillStyle = this.leafColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  animate() {
    this.clearCanvas();

    // collect terminal-leaf positions so we can draw apples afterwards (on top)
    const leafQueue: {
      sx: number;
      sy: number;
      ex: number;
      ey: number;
      depth: number;
    }[] = [];

    // draw fully-grown depths (0 .. currentDepth-1)
    for (let d = 0; d < this.currentDepth; d++) {
      if (d >= this.depth) break;
      for (let k = 0; k < this.branches[d].length; k++) {
        const branch = this.branches[d][k];
        this.ctx.beginPath();
        this.ctx.moveTo(branch.startX, branch.startY);
        this.ctx.lineTo(branch.endX, branch.endY);
        this.ctx.lineWidth = branch.lineWidth;
        if (this.colorMode === "gradient") {
          const grad = this.ctx.createLinearGradient(
            this.treeX,
            this.treeY,
            this.treeX,
            this.treeTop,
          );
          grad.addColorStop(0, this.gradientStart);
          grad.addColorStop(1, this.gradientEnd);
          this.ctx.strokeStyle = grad;
        } else {
          this.ctx.strokeStyle = this.color;
        }
        this.ctx.stroke();
        this.ctx.closePath();

        // queue terminal leaves for later drawing
        if (branch.depth === this.depth - 1) {
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
    if (this.currentDepth < this.depth) {
      let currentDone = true;
      for (let k = 0; k < this.branches[this.currentDepth].length; k++) {
        const branch = this.branches[this.currentDepth][k];
        if (branch.cntFrame < branch.frame) {
          branch.draw(this.ctx, this.growthSpeed);
          stillGrowing = true;
          currentDone = false;
        } else {
          // finished this frame — draw it fully and queue its leaf if terminal
          this.ctx.beginPath();
          this.ctx.moveTo(branch.startX, branch.startY);
          this.ctx.lineTo(branch.endX, branch.endY);
          this.ctx.lineWidth = branch.lineWidth;
          if (this.colorMode === "gradient") {
            const grad = this.ctx.createLinearGradient(
              this.treeX,
              this.treeY,
              this.treeX,
              this.treeTop,
            );
            grad.addColorStop(0, this.gradientStart);
            grad.addColorStop(1, this.gradientEnd);
            this.ctx.strokeStyle = grad;
          } else {
            this.ctx.strokeStyle = this.color;
          }
          this.ctx.stroke();
          this.ctx.closePath();

          if (branch.depth === this.depth - 1) {
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
      if (currentDone) {
        this.currentDepth++;
        stillGrowing = true;
      }
    }

    // --- Draw all leaves (so apples can be drawn on top) ---
    for (const leaf of leafQueue) {
      this.drawLeaf(leaf.ex, leaf.ey);
    }

    // --- Draw apples on top of leaves ---
    for (const leaf of leafQueue) {
      // only add apples when tree is fully grown
      if (this.depth === this.fullDepth && this.random(0, 1) < 0.05) {
        const dx = leaf.ex - leaf.sx;
        const dy = leaf.ey - leaf.sy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const offset = Math.min(this.leafSize * 0.35, 8);
        const ax = leaf.ex + nx * offset;
        const ay = leaf.ey + ny * offset;

        const appleRadius = Math.max(3, Math.floor(this.leafSize * 0.2));
        this.ctx.beginPath();
        this.ctx.arc(ax, ay, appleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "red";
        this.ctx.fill();
        this.ctx.closePath();

        // highlight
        this.ctx.beginPath();
        this.ctx.arc(
          ax - appleRadius * 0.35,
          ay - appleRadius * 0.35,
          appleRadius * 0.35,
          0,
          Math.PI * 2,
        );
        this.ctx.fillStyle = "rgba(255,255,255,0.7)";
        this.ctx.fill();
        this.ctx.closePath();
      }
    }

    if (stillGrowing) {
      this.animation = requestAnimationFrame(this.animate.bind(this));
    } else {
      if (this.animation) cancelAnimationFrame(this.animation);
    }
  }
}

export default TreeAnimation;
