import { ForestView, type TreeHandle } from "@/components/ForestView";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useMainStore } from "@/providers/store";
import { Pause, Play } from "lucide-react";
import { planetsArray } from "@/utils/mock";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const trees = useMainStore((state) => state.trees);
  const user = useMainStore((state) => state.user);
  const treeRef = useRef<TreeHandle>(null);
  useEffect(() => {
    if (trees.length > 1 && treeRef.current) {
      treeRef.current.update(trees, false, user ? trees[15250] : null);
    }
  }, [trees]);
  const [isSimulationActive, setSimulationActive] = useState(true);
  const [planetIndex, setPlanetIndex] = useState(0);
  const [newCountValue, setNewCountValue] = useState(32000);
  const count = useMotionValue(32000);
  const [lastIncrement, setLastIncrement] = useState(0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString(),
  );
  const opacity = useMotionValue(0);

  const planetMap = {
    Земля: "Земле",
    Марс: "Марсе",
    Юпитер: "Юпитере",
  };

  useEffect(() => {
    if (lastIncrement !== 0) {
      const animation = animate(opacity, [0, 1, 1, 0], {
        duration: 6,
        ease: "linear",
        times: [0, 0.1, 0.9, 1], // The key change
      });
      return () => animation.stop();
    }
  }, [lastIncrement, opacity]);

  useEffect(() => {
    const controls = animate(count, newCountValue, {
      duration: 6, // A very slow animation (20 seconds)
      ease: "linear",
    });

    return controls.stop;
  }, [newCountValue, count]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlanetIndex((prevIndex) => {
        const newPlanet =
          prevIndex === planetsArray.length - 1 ? 0 : prevIndex + 1;
        if (treeRef.current) {
          treeRef.current.updatePlanet(planetsArray[newPlanet]);
          setTimeout(() => {
            if (treeRef.current) {
              treeRef.current.render();
            }
          }, 500);
          setTimeout(() => {
            if (treeRef.current) {
              treeRef.current.render();
            }
          }, 1000);
          setTimeout(() => {
            if (treeRef.current) {
              treeRef.current.render();
            }
          }, 1500);
        }
        return newPlanet;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [planetsArray.length]);
  useEffect(() => {
    function randomizeCounter() {
      const increment = Math.floor(Math.random() * 8) + 2;
      const isNegative = Math.random() < 0.2;
      if (isNegative) {
        setLastIncrement(() => increment);
        setNewCountValue((prev) => prev - increment);
      } else {
        setLastIncrement(() => increment);
        setNewCountValue((prev) => prev + increment);
      }
    }
    const interval = setInterval(randomizeCounter, 7000);
    return () => clearInterval(interval);
  }, []);
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
        <div className="flex flex-col items-start justify-center w-full max-w-[500px] gap-4">
          <img src="/logo_white.png" width={420} height={240} />
          <div className="text-2xl">
            <p>Войди в историю!</p>
            <p>
              Посади живое именное дерево на:
              <AnimatePresence mode="wait">
                <motion.span
                  key={planetsArray[planetIndex]}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`text-blue-sky text-center ${planetsArray[planetIndex] === "Юпитер" ? "w-28" : "w-20"} font-futura-heavy inline-block`} // Use inline-block
                >
                  {planetMap[planetsArray[planetIndex]]}
                </motion.span>
              </AnimatePresence>
            </p>
            <p>
              Уже посажено деревьев:{" "}
              <motion.span className="font-sans font-semibold text-blue-sky">
                {rounded}
              </motion.span>
              <motion.span
                style={{ opacity }}
                className={`ml-2 font-sans font-semibold ${count.get() < newCountValue ? "text-green-400" : "text-red-400"}`}
              >
                {lastIncrement === 0
                  ? ``
                  : count.get() < newCountValue
                    ? `(+${lastIncrement})`
                    : `(-${lastIncrement})`}
              </motion.span>
            </p>
          </div>
          <Button className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] w-full hover:cursor-pointer font-futura-heavy rounded p-2 text-white">
            Посадить своё дерево
          </Button>
        </div>
      </div>
      <div className="w-[40%] aspect-square rounded-full max-lg:w-[70%] max-sm:w-full bg-gray-100 relative">
        <ForestView
          ref={treeRef}
          {...{
            trees,
            isLoading: true,
            simulation: true,
          }}
          className="[filter:drop-shadow(0_0_2rem_#22d3ee)]  rounded-full overflow-hidden"
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
                to="/forest"
                className="[&.active]:font-bold block p-1  rounded"
              >
                Посетить лес
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
