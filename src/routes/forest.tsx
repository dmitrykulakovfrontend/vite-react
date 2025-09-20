import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forest")({
  component: Tree,
});

import { useState } from "react";
import type { Tree } from "../types/Tree";
import { ForestView } from "../components/ForestView";

function Tree() {
  const [trees] = useState(
    new Array(30000).fill(1).map(() => {
      const size = Math.round(Math.random() * 10) + 1;
      return {
        seed: Math.random() * 100000,
        depth: size,
        container: null as unknown as HTMLDivElement,
        witheredLevel: Math.round(Math.random() * 2),
        leafSize: 2,
        decayProgress: Math.pow(Math.random(), 12) * 2,
      } satisfies Tree;
    }),
  );

  return (
    <div className="flex flex-col items-center w-full h-full gap-4 justify-evenly ">
      <div className="w-full h-full bg-gray-100">
        <ForestView
          {...{
            trees,
          }}
          isLoading={false}
          simulation={false}
        />
      </div>
    </div>
  );
}
