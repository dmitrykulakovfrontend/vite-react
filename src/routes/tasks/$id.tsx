import { Button } from "@/components/ui/button";
import type { Task } from "@/types/Tasks";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Pie } from "react-chartjs-2";
import useSWR from "swr";

export const Route = createFileRoute("/tasks/$id")({
  component: RouteComponent,
});
const data = {
  labels: ["Выполнено", "Отказов", "На проверке", "Принято", "Доработка"],
  datasets: [
    {
      label: "Исполнители",
      data: [12, 19, 3, 5, 2],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
      ],
      borderWidth: 1,
    },
  ],
};
const fetchTask = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_task_by_id",
    params: { id },
    id: 1,
  };

  const response = await fetch("https://hrzero.ru/api/app/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonrpc),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const taskData = await response.json();
  if (taskData.error) {
    throw new Error(taskData.error.message);
  }
  return taskData.result[0];
};
function RouteComponent() {
  const { id } = useParams({ from: "/tasks/$id" });
  const { data: task, isLoading } = useSWR<Task>("tasks/" + id, () =>
    fetchTask(id),
  );
  if (!task && !isLoading) {
    return (
      <div className="p-4 ">
        <div className="bg-white w-fit mx-auto rounded p-4">
          <div className=" text-black flex items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-4  font-futura-heavy ">
                Задача не найдена
              </h1>
              <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]">
                <Link
                  to="/tasks"
                  className="[&.active]:font-bold block p-1  rounded"
                >
                  Назад
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 ">
      <div className="bg-white w-fit mx-auto rounded p-4">
        <div className=" text-black flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-4  font-futura-heavy ">
              Миссия: {isLoading ? "Загрузка..." : task?.mission_title}
            </h1>
            <h2 className="text-xl font-bold mb-4">
              Цель: {isLoading ? "Загрузка..." : task?.goal_title}
            </h2>
            <h3 className="text-lg font-bold mb-4">
              Название задачи: {isLoading ? "Загрузка..." : task?.title}
            </h3>
            <p className="mb-2">
              Описание задачи: {isLoading ? "Загрузка..." : task?.description}
            </p>
            <p className="mb-2">
              Навык: {isLoading ? "Загрузка..." : task?.skill_title}
            </p>
            <p className="mb-2">
              Место: {isLoading ? "Загрузка..." : task?.online || "Нету"}
            </p>
            <p className="mb-2">
              Срок исполнения:{" "}
              {isLoading ? "Загрузка..." : task?.deadline || "Нету"}
            </p>
            <p className="mb-2">
              Просмотров: {Math.round(Math.random() * 100) + 1}
            </p>
            <p className="mb-2">
              Исполнителей: {Math.round(Math.random() * 50)}
            </p>
            <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]">
              <Link
                to="/tasks"
                className="[&.active]:font-bold block p-1  rounded"
              >
                Назад
              </Link>
            </Button>
          </div>
          <div>
            <div className="w-[300px] h-[300px] mx-auto bg-white">
              <div className=" mx-auto w-fit flex gap-2   text-white ">
                <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]">
                  Взять
                </Button>
                <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]">
                  Отказаться
                </Button>
              </div>
              <Pie data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
