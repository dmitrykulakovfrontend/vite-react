import { ForestView, type TreeHandle } from "@/components/ForestView";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMainStore } from "@/providers/store";
import type { Planet } from "@/types/Tree";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const trees = useMainStore((state) => state.trees);
  const treeRef = useRef<TreeHandle>(null);
  useEffect(() => {
    if (trees.length > 1 && treeRef.current) {
      treeRef.current.update(trees, false);
    }
  }, [trees]);
  const [isSimulationActive, setSimulationActive] = useState(true);
  const planetsArray: Planet[] = ["Земле", "Юпитере", "Марсе"];
  const [planetIndex, setPlanetIndex] = useState(0);
  const count = useMotionValue(32000);

  const spring = useSpring(count, {
    stiffness: 1,
  });

  const rounded = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString(),
  );

  useEffect(() => {
    count.set(45000);
  }, [count]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlanetIndex((prevIndex) => {
        const newPlanet =
          prevIndex === planetsArray.length - 1 ? 0 : prevIndex + 1;
        if (treeRef.current) {
          treeRef.current.updatePlanet(planetsArray[newPlanet]);
        }
        return newPlanet;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [planetsArray.length]);
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
  const textVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
      },
    },
  };
  return (
    <div className="flex items-center max-lg:flex-col max-lg:mt-8 w-full h-full gap-4 justify-evenly ">
      <div className="flex flex-col items-center justify-center px-2 max-lg:w-full w-[30%] gap-4">
        <div className="flex flex-col items-start justify-center max-w-sm gap-4">
          <img src="/logo_white.png" width={420} height={240} />
          <div className="text-2xl">
            <p>Войди в историю!</p>
            <p>
              Посади на{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={planetsArray[planetIndex]}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-blue-sky text-center w-28 font-futura-heavy inline-block" // Use inline-block
                >
                  {planetsArray[planetIndex]}
                </motion.span>
              </AnimatePresence>{" "}
              живое именное дерево
            </p>
            <p>
              Уже посажено:{" "}
              <motion.span className="font-sans font-semibold text-blue-sky">
                {rounded}
              </motion.span>{" "}
              деревьев
            </p>
          </div>
          <Button className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] w-full hover:cursor-pointer font-futura-heavy rounded p-2 text-white">
            Посадить своё дерево
          </Button>
        </div>
      </div>
      <div className="w-[45%] aspect-square rounded-full max-lg:w-[70%] max-sm:w-full bg-gray-100 relative">
        <ForestView
          ref={treeRef}
          {...{
            trees,
            isLoading: true,
            simulation: true,
          }}
          className="[filter:drop-shadow(0_0_2rem_#22d3ee)]  rounded-full overflow-hidden"
        />
        <div className="flex absolute justify-between items-center flex-wrap max-lg:-bottom-8 gap-4 bottom-4 w-full">
          <Button
            className=" max-w-[200px] max-lg:max-w-[150px]  hover:bg-blue-500 bg-blue-light w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white"
            onClick={() => setSimulationActive((prev) => !prev)}
          >
            {isSimulationActive ? "Остановить" : "Продолжить"} симуляцию
          </Button>

          <Button
            className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-light w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white"
            onClick={() => setSimulationActive((prev) => !prev)}
          >
            <Link
              to="/forest"
              className="[&.active]:font-bold block p-1  rounded"
            >
              Посмотреть лес
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
