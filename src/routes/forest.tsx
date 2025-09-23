import { ForestView, type TreeHandle } from "@/components/ForestView";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useMainStore } from "@/providers/store";
import type { Planet } from "@/types/Tree";
import { Pause, Play } from "lucide-react";
import { planetsArray } from "@/utils/mock";

export const Route = createFileRoute("/forest")({
  component: Index,
});

function Index() {
  const trees = useMainStore((state) => state.trees);
  const user = useMainStore((state) => state.user);
  const treeRef = useRef<TreeHandle>(null);
  useEffect(() => {
    if (trees.length > 1 && treeRef.current) {
      treeRef.current.update(trees, false, user ? trees[5250] : null);
    }
  }, [trees, user]);
  const [isSimulationActive, setSimulationActive] = useState(false);

  useEffect(() => {
    let intervalId = undefined;
    if (isSimulationActive) {
      intervalId = setInterval(() => {
        if (treeRef.current) {
          treeRef.current.simulateGrow();
        }
      }, 1000); // update simulation every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSimulationActive]);

  return (
    <div className="flex items-center max-lg:flex-col max-lg:mt-8 w-full h-full gap-4 justify-evenly ">
      <div className="w-full h-full bg-gray-100 relative">
        <div className="absolute top-4 right-4 z-10">
          <Select
            onValueChange={(value: Planet) => {
              if (treeRef.current) {
                treeRef.current.updatePlanet(value);
              }
            }}
          >
            <SelectTrigger className="w-[180px] border-0 hover:bg-blue-500  bg-blue-primary  hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white! ">
              <SelectValue placeholder={planetsArray[0]} />
            </SelectTrigger>
            <SelectContent className="bg-blue-primary text-white">
              {planetsArray.map((planet) => (
                <SelectItem
                  key={planet}
                  className="hover:bg-blue-500"
                  value={planet}
                >
                  {planet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ForestView
          ref={treeRef}
          {...{
            trees,
            isLoading: true,
            simulation: isSimulationActive,
          }}
          className=""
        />
        <div className="flex absolute justify-center items-center flex-wrap  gap-2 bottom-4 w-full">
          <div className="relative">
            <button
              className="absolute -left-12 bottom-1/2 translate-y-1/2"
              onClick={() => setSimulationActive((prev) => !prev)}
              title={
                isSimulationActive
                  ? "Остановить симуляцию"
                  : "Запустить симуляцию"
              }
            >
              {isSimulationActive ? (
                <Pause className="w-full h-full  bg-blue-primary hover:bg-blue-500 rounded-full p-1 hover:cursor-pointer" />
              ) : (
                <Play className="w-full h-full  bg-blue-primary hover:bg-blue-500 rounded-full p-1 hover:cursor-pointer" />
              )}
            </button>
            <Button
              className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white"
              onClick={() => setSimulationActive((prev) => !prev)}
            >
              <Link
                to="/tree"
                className="[&.active]:font-bold block p-1  rounded"
              >
                {user ? "Полить дерево" : "Посади своё дерево"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
