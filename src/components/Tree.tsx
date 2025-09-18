import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import TreeAnimation from "../utils/TreeAnimation";
import type { Forest, TreeOptions } from "../types/Tree";

export type TreeHandle = {
  growOneLevel: (tree: TreeOptions) => void;
  reset: () => void;
};

export const Tree = forwardRef<TreeHandle, Forest>((props, ref) => {
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
    growOneLevel: (tree: TreeOptions) => {
      treeRef.current?.growOneLevel(tree);
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
