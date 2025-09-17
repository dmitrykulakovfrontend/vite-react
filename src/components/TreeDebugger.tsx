import { type Dispatch, type SetStateAction } from "react";
import type { TreeOptions } from "../types/Tree";
type TreeDebuggerProps = {
  options: TreeOptions;
  setOptions: Dispatch<SetStateAction<TreeOptions>>;
  redrawTree: () => void;
  growTree: () => void;
  growTreeBack: () => void;
};
const TreeDebugger = ({
  options,
  setOptions,
  redrawTree,
  growTree,
  growTreeBack,
}: TreeDebuggerProps) => {
  return (
    <div className="w-full p-4 overflow-y-auto bg-gray-100 md:w-64">
      {/* Seed */}
      <label className="block mb-2">
        Seed:
        <input
          className="w-full p-1 border"
          type="text"
          value={options.seed}
          onChange={(e) => setOptions({ ...options, seed: e.target.value })}
        />
      </label>

      {/* Depth */}
      <label className="block mb-2">
        Depth:
        <input
          className="w-full p-1 border"
          type="number"
          value={options.depth}
          onChange={(e) => {
            if (+e.target.value > options.depth) {
              growTree();
            } else if (+e.target.value < options.depth) {
              growTreeBack();
            }
            setOptions({ ...options, depth: Number(e.target.value) });
          }}
        />
      </label>

      {/* Growth Speed */}
      <label className="block mb-2">
        Growth Speed:
        <input
          className="w-full p-1 border"
          type="number"
          value={options.growthSpeed}
          onChange={(e) =>
            setOptions({ ...options, growthSpeed: Number(e.target.value) })
          }
        />
      </label>

      {/* Tree Scale */}
      <label className="block mb-2">
        Tree Scale:
        <input
          className="w-full p-1 border"
          type="number"
          value={options.treeScale}
          onChange={(e) =>
            setOptions({ ...options, treeScale: Number(e.target.value) })
          }
        />
      </label>

      {/* Branch Width */}
      <label className="block mb-2">
        Branch Width:
        <input
          className="w-full p-1 border"
          type="number"
          value={options.branchWidth}
          onChange={(e) =>
            setOptions({ ...options, branchWidth: Number(e.target.value) })
          }
        />
      </label>

      {/* Color Mode */}
      <label className="block mb-2">
        Color Mode:
        <select
          className="w-full p-1 border"
          value={options.colorMode}
          onChange={(e) =>
            setOptions({
              ...options,
              colorMode: e.target.value as "gradient" | "solid",
            })
          }
        >
          <option value="gradient">Gradient</option>
          <option value="solid">Solid</option>
        </select>
      </label>

      {/* Colors */}
      <label className="block mb-2">
        Color:
        <input
          className="w-full"
          type="color"
          value={options.color}
          onChange={(e) => setOptions({ ...options, color: e.target.value })}
        />
      </label>

      <label className="block mb-2">
        Gradient Start:
        <input
          className="w-full"
          type="color"
          value={options.gradientColorStart}
          onChange={(e) =>
            setOptions({ ...options, gradientColorStart: e.target.value })
          }
        />
      </label>

      <label className="block mb-2">
        Gradient End:
        <input
          className="w-full"
          type="color"
          value={options.gradientColorEnd}
          onChange={(e) =>
            setOptions({ ...options, gradientColorEnd: e.target.value })
          }
        />
      </label>

      <label className="block mb-2">
        Leaf Color:
        <input
          className="w-full"
          type="color"
          value={options.leafColor}
          onChange={(e) =>
            setOptions({ ...options, leafColor: e.target.value })
          }
        />
      </label>

      {/* Leaf Size */}
      <label className="block mb-2">
        Leaf Size:
        <input
          className="w-full p-1 border"
          type="number"
          value={options.leafSize}
          onChange={(e) =>
            setOptions({ ...options, leafSize: Number(e.target.value) })
          }
        />
      </label>

      {/* Buttons */}
      <button
        onClick={redrawTree}
        className="w-full p-2 mt-4 text-white bg-blue-500 rounded"
      >
        Redraw Tree
      </button>

      <button
        onClick={growTree}
        className="w-full p-2 mt-4 text-white bg-green-500 rounded"
      >
        Grow Tree
      </button>
    </div>
  );
};

export default TreeDebugger;
