import { createFileRoute } from "@tanstack/react-router";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/tree")({
  component: Tree,
});

import { useRef, useState } from "react";
import type { Tree } from "../types/Tree";
import { ForestView, type TreeHandle } from "../components/ForestView";

function Tree() {
  const treeRef = useRef<TreeHandle>(null);
  const [water, setWater] = useState(200);
  const [options, setOptions] = useState<Tree>({
    seed: 12,
    timesWatered: 0,
    container: null as unknown as HTMLDivElement,
    witheredLevel: 0,
    decayProgress: 0,
    apples: 5,
  });
  const growTree = () => {
    if (treeRef.current && water >= 10) {
      setOptions((prev) => {
        const newOptions = { ...prev, timesWatered: prev.timesWatered + 1 };
        treeRef.current?.growOneLevel(prev);
        return newOptions;
      });
      setWater((prev) => prev - 10);
    }
  };
  const witherTree = () => {
    if (treeRef.current) {
      treeRef.current.witherTree(options);
    }
  };
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

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "📝 Пройти тест ",
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
    <div className="flex flex-col items-center w-full gap-4 p-4 justify-evenly ">
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
          <div className="flex shadow-md rounded-md h-[300px] bg-white   max-lg:w-[300px] max-lg:max-w-[300px] max-xl:w-[400px] max-xl:max-w-[400px] w-[500px] max-w-[500px]">
            <ForestView
              ref={treeRef}
              trees={[options]}
              isLoading={false}
              currentUserTree={options}
              isMainTree
            />
          </div>
          <div>
            <p className="text-xl">
              Текущее количество воды:{" "}
              <span className="font-futura-heavy">{water}💧</span>
            </p>
          </div>
          <div className="w-full max-w-[500px] px-4 py-2">
            <p>Times Watered: {options.timesWatered}</p>
            <Slider
              defaultValue={[options.timesWatered]}
              value={[options.timesWatered]}
              min={0}
              max={20}
              step={1}
              onValueChange={(value) => {
                setOptions((prev) => {
                  if (treeRef.current) {
                    treeRef.current.growOneLevel({
                      ...prev,
                      timesWatered: value[0],
                    });
                  }
                  return { ...prev, timesWatered: value[0] };
                });
              }}
            />
          </div>
          <button
            onClick={growTree}
            className="p-2 mt-4 bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] rounded cursor-pointer font-futura-heavy max-lg:w-[300px] max-lg:max-w-[300px] max-xl:w-[400px] max-xl:max-w-[400px] w-[500px] max-w-[500px]"
          >
            Полить ( -10💧)
          </button>
          <button
            onClick={witherTree}
            className="p-2 mt-4 bg-[linear-gradient(to_bottom,#faea09,#eecc09)] rounded cursor-pointer font-futura-heavy max-lg:w-[300px] max-lg:max-w-[300px] max-xl:w-[400px] max-xl:max-w-[400px] w-[500px] max-w-[500px]"
          >
            Проверка засыхание дерева
          </button>
          <div className="w-full mt-4">
            <h2 className="text-xl mb-2 text-center max-[52rem]:text-lg">
              Задачи для получения воды:
            </h2>
            <div className="flex flex-wrap gap-4 justify-center max-[52rem]:flex-col max-[52rem]:items-center">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`max-w-xs overflow-hidden text-black rounded shadow-lg ${task.isCompleted ? `bg-green-400` : `bg-white`} ${task.isCompleted ? `` : `hover:bg-gray-200`} ${task.isCompleted ? `cursor-default` : `cursor-pointer`}`}
                  onClick={() => completeTask(task.id)}
                >
                  <div className="px-6 py-4">
                    <div className="mb-2 text-xl font-futura-heavy">
                      {task.title}
                    </div>
                    <p className="text-base text-gray-700">
                      {task.description}
                    </p>
                  </div>
                  <div className="px-6 pt-4 pb-2">
                    <span className="inline-block p-1 pl-2 pr-2 ml-auto mb-2 text-sm text-right text-white bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] rounded-full font-futura-heavy">
                      +{task.reward}💧
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="w-full h-screen bg-gray-100">
        <ForestView
          {...{
            trees,
          }}
          isLoading={false}
        />
      </div> */}
    </div>
  );
}
