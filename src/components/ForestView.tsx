import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import TreeAnimation from "../utils/TreeAnimation";
import type { Forest, Planet, Tree } from "../types/Tree";

export type TreeHandle = {
  updatePlanet(planet: Planet): void;
  simulateGrow(): void;
  witherTree: (tree: Tree) => void;
  growOneLevel: (tree: Tree) => void;
  update: (trees: Tree[], isLoading: boolean) => void;
};

export const ForestView = forwardRef<TreeHandle, Forest>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<TreeAnimation | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!treeRef.current) {
      treeRef.current = new TreeAnimation({
        ...props,
        container: containerRef.current,
      });
    }
  }, [props]);

  useImperativeHandle(ref, () => ({
    updatePlanet: (planet: Planet) => {
      console.log(planet);
      console.log(1);
      if (treeRef.current) {
        treeRef.current.planet = planet;
        treeRef.current.render();
      }
    },
    simulateGrow: () => {
      treeRef.current?.simulateGrow();
    },
    growOneLevel: (tree: Tree) => {
      treeRef.current?.growOneLevel(tree);
    },
    witherTree: (tree: Tree) => {
      treeRef.current?.witherTree(tree);
    },
    update: (trees: Tree[], isLoading: boolean) => {
      if (containerRef.current && treeRef.current) {
        treeRef.current.trees = trees;
        treeRef.current.isLoading = isLoading;
        treeRef.current.render();
      }
    },
  }));

  return <div ref={containerRef} className="w-full h-full" />;
});
