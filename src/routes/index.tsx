import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

import { useEffect, useRef, useState } from "react";
import TreeAnimation from "../utils/TreeAnimation";
import type { TreeOptions } from "../types/Tree";

function Index() {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<TreeAnimation | null>(null);
  const [water, setWater] = useState(50);
  const [options, setOptions] = useState<
    TreeOptions & { treeRef?: HTMLDivElement | null }
  >({
    seed: "Dmitry" as string | number,
    depth: 1,
    growthSpeed: 50,
    treeScale: 1,
    branchWidth: 1,
    colorMode: "gradient" as "gradient" | "solid",
    color: "#000000",
    gradientColorStart: "#8B4513",
    gradientColorEnd: "#228B22",
    leafColor: "#228B22",
    leafSize: 15,
    container: null as unknown as HTMLDivElement,
    treeRef: null,
  });

  const redrawTree = () => {
    console.log({ options });
    console.log({ tree: treeRef.current });
    if (containerRef.current && !treeRef.current) {
      treeRef.current = new TreeAnimation({
        ...options,
        container: containerRef.current,
      });
    }
  };
  const growTree = () => {
    if (treeRef.current && water >= 10) {
      treeRef.current.growOneLevel();
      setWater((prev) => prev - 10);
      const seed = treeRef.current.originalSeed;
      setOptions((prev) => ({ ...prev, ...treeRef.current, seed }));
    }
  };
  // const growTreeBack = () => {
  //   if (treeRef.current) {
  //     treeRef.current.growBackOneLevel();
  //     const seed = treeRef.current.originalSeed;
  //     setOptions((prev) => ({ ...prev, ...treeRef.current, seed }));
  //   }
  // };

  useEffect(() => {
    redrawTree();
  }, [options]);
  // useEffect(() => {
  //   const timer = setInterval(growTree, 500);
  //   return () => {
  //     clearInterval(timer);
  //   };
  // });

  const completeTask = (id: number) => {
    const completedTask = tasks.find((task) => task.id === id);
    if (completedTask && !completedTask.isCompleted) {
      setWater((prev) => prev + completedTask.reward);
      completedTask.isCompleted = true;
      const updatedTasks = tasks.map((task) =>
        task.id === id ? completedTask : task,
      );
      setTasks(updatedTasks);
    }
  };

  const randomUsers = new Array(15).fill(1).map((_, i) => ({ id: i + 1 }));
  console.log(randomUsers);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "📝 Пройти тест",
      description:
        "Пройдите небольшой тест по вашей профессии и получите баллы",
      reward: 5,
      isCompleted: false,
    },
    {
      id: 2,
      title: "📊 Заполнить опросник",
      description:
        "Ответьте на вопросы опросника о вашей работе и получите воду",
      reward: 10,
      isCompleted: false,
    },
    {
      id: 3,
      title: "💬 Записаться на форум",
      description:
        "Присоединитесь к профессиональному форуму и заработайте баллы",
      reward: 7,
      isCompleted: false,
    },
  ]);

  return (
    <div className="flex justify-evenly w-full h-screen gap-4 p-4 max-[52rem]:flex-col-reverse max-[52rem]:items-center ">
      <div className="flex flex-wrap items-start gap-4 justify-center-safe xl:max-w-4xl">
        {randomUsers.map((user) => {
          return (
            <Link
              key={user.id}
              to="/forest"
              className="[&.active]:font-bold block p-1"
            >
              <div className="flex flex-col items-center justify-center cursor-pointer">
                <span className=" font-futura-heavy">
                  Дерево другого пользователя
                </span>
                <img
                  src="https://media.istockphoto.com/id/543052538/nl/foto/tree.webp?s=2048x2048&w=is&k=20&c=-8vJIKAwtEVvJND28S4KC9aY6mTWncdiOPQZAtbEsTs="
                  width={200}
                  height={200}
                  className="rounded-md"
                  alt=""
                />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col text-lg">
          <p>
            Имя: <span className="font-futura-heavy">Дмитрий Кулаков</span>
          </p>
          <p>
            Возраст дерева:{" "}
            <span className="font-futura-heavy">2 дня</span>{" "}
          </p>
          <p>
            Следующее время поливки:{" "}
            <span className="font-futura-heavy">Через неделю</span>
          </p>
          <p>
            Стадия роста: <span className="font-futura-heavy">Cаженец</span>
          </p>

          <p>
            Следующая стадия через:{" "}
            <span className="font-futura-heavy">60 дней</span>
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="flex border shadow-md rounded-md h-[300px] bg-white   max-lg:w-[300px] max-lg:max-w-[300px] max-xl:w-[400px] max-xl:max-w-[400px] w-[500px] max-w-[500px]"
            ref={containerRef}
          />
          <div>
            <p className="text-xl">
              Текущее количество воды:{" "}
              <span className="font-futura-heavy">{water}💧</span>
            </p>
          </div>
          <button
            onClick={growTree}
            className="w-full p-2 mt-4 bg-blue-300 rounded cursor-pointer font-futura-heavy"
          >
            Полить ( -10💧)
          </button>
          <div className="w-full mt-4">
            <h2 className="text-xl mb-2 text-center max-[52rem]:text-lg">
              Задачи для получения воды:
            </h2>
            <div className="flex flex-wrap gap-4 justify-center max-[52rem]:flex-col max-[52rem]:items-center">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex flex-col justify-between  rounded-md shadow-md p-4 ${task.isCompleted ? "bg-green-400" : "bg-white"} ${task.isCompleted ? "hover:bg-green-600 border-green-600" : "hover:bg-blue-50"}  transition-colors cursor-pointer w-[200px] max-[52rem]:w-[90%]`}
                  onClick={() => completeTask(task.id)}
                >
                  <h3 className="text-lg text-center text-black font-futura-heavy">
                    {task.title}
                  </h3>
                  <p className="text-center text-black ">{task.description}</p>
                  <p className="mt-2 text-center text-blue-600 font-futura-heavy">
                    +{task.reward}💧
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <TreeDebugger
        growTree={growTree}
        growTreeBack={growTreeBack}
        options={options}
        redrawTree={redrawTree}
        setOptions={setOptions}
      /> */}
    </div>
  );
}
