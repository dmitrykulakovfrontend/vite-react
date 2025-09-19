import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import TreeAnimation from "../utils/TreeAnimation";
import type { Forest, Tree } from "../types/Tree";

export type TreeHandle = {
  witherTree: (tree: Tree) => void;
  growOneLevel: (tree: Tree) => void;
  reset: () => void;
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
    growOneLevel: (tree: Tree) => {
      treeRef.current?.growOneLevel(tree);
    },
    witherTree: (tree: Tree) => {
      treeRef.current?.witherTree(tree);
    },
    reset: () => {
      if (containerRef.current) {
        treeRef.current = new TreeAnimation({
          ...props,
          container: containerRef.current,
        });
      }
    },
  }));

  return <div ref={containerRef} className="w-full h-full" />;
});
