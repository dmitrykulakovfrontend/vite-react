import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import TreeAnimation from "../utils/TreeAnimation";
import type { Forest, Planet, Tree } from "../types/Tree";

export type TreeHandle = {
  updatePlanet(planet: Planet): void;
  simulateGrow(): void;
  witherTree: (tree: Tree) => void;
  growOneLevel: (tree: Tree) => void;
  render: () => void;
  centerOnUser: (treeID: number) => void;
  update: (
    trees: Tree[],
    isLoading: boolean,
    currentUserTree: Tree | null,
  ) => void;
};

export const ForestView = forwardRef<
  TreeHandle,
  Forest & { className?: string }
>(({ className = "", ...props }, ref) => {
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
    render: () => {
      if (treeRef.current) {
        treeRef.current.render();
      }
    },
    centerOnUser(treeID) {
      if (treeRef.current) {
        treeRef.current.centerOnUser(treeID);
      }
    },
    updatePlanet: (planet: Planet) => {
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
    update: (
      trees: Tree[],
      isLoading: boolean,
      currentUserTree: Tree | null,
    ) => {
      if (containerRef.current && treeRef.current) {
        treeRef.current.trees = trees;
        treeRef.current.isLoading = isLoading;
        treeRef.current.currentUserTree = currentUserTree;
        treeRef.current.hasCentered = false;
        treeRef.current.render();
        if (treeRef.current.isMainTree) {
          treeRef.current.viewportTransform.scale =
            1 -
            treeRef.current.getTreeDepth(
              treeRef.current.trees[0]?.timesWatered || 0,
            ) /
              15;
        }
      }
    },
  }));

  return (
    <div ref={containerRef} className={"w-full h-full " + " " + className} />
  );
});
