import { Button } from "@/components/ui/button";
import { useMainStore } from "@/providers/store";
import type { Task } from "@/types/Tasks";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Pie } from "react-chartjs-2";
import { useCookies } from "react-cookie";
import useSWR, { mutate } from "swr";

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
  return taskData.result;
};
const fetchUserTasks = async (jwt: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "my_tasks",
    params: {},
    id: 1,
  };

  const response = await fetch("https://hrzero.ru/api/app/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
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
  return taskData.result;
};
function RouteComponent() {
  const { id } = useParams({ from: "/tasks/$id" });
  const [cookies] = useCookies(["auth-token"]);
  const { user } = useMainStore();

  const { data: task, isLoading: isTaskLoading } = useSWR<Task[]>(
    "tasks/" + id,
    () => fetchTask(id),
  );

  const { data: userTasks, isLoading } = useSWR<Task[] | null>(
    "userTasks",
    () => fetchUserTasks(cookies["auth-token"]),
  );
  async function takeTask() {
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "start_task",
      params: { task_id: id },
      id: 1,
    };

    try {
      const data = await mutate(
        "takeTask/" + id,
        async () => {
          const response = await fetch("https://hrzero.ru/api/app/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: cookies["auth-token"],
            },
            body: JSON.stringify(jsonrpc),
          });
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error.message);
          }
          if (!data.result) {
            throw new Error("data", data);
          }
          return data.result;
        },
        {},
      );

      if (data && userTasks) {
        await mutate("userTasks");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }
  async function completeTask() {
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "mark_task_as_done",
      params: { task_id: id },
      id: 1,
    };

    try {
      const data = await mutate(
        "completeTask/" + id,
        async () => {
          const response = await fetch("https://hrzero.ru/api/app/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: cookies["auth-token"],
            },
            body: JSON.stringify(jsonrpc),
          });
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error.message);
          }
          if (!data.result) {
            throw new Error("data", data);
          }
          return data.result;
        },
        {},
      );

      if (data) {
        await mutate("userTasks");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }
  console.log({ userTasks });
  console.log({ task });
  if (task === null && !isLoading) {
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
  if (isTaskLoading && task === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-16 w-16 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-lg text-blue-500 font-futura-heavy">
            Загрузка...
          </span>
        </div>
      </div>
    );
  }
  const currentTask = task![0];
  const currentUserTask = userTasks?.find((t) => t.id === currentTask.id);
  return (
    <div className="p-4 ">
      <div className="bg-white w-fit mx-auto rounded p-4">
        <div className=" text-black flex items-start gap-4 max-md:flex-col">
          <div>
            <h1 className="text-2xl font-bold   font-futura-heavy ">
              Кампания: {currentTask.mission_title}
            </h1>
            <h2 className="text-xl font-bold ">
              Цель: {currentTask.goal_title}
            </h2>
            <h3 className="text-lg font-bold ">
              Название задачи: {currentTask.title}
            </h3>
            <p className="mb-2">Описание задачи: {currentTask.description}</p>
            <p className="mb-2">Навык: {currentTask.skill_title}</p>
            <p className="mb-2">
              Место: {currentTask.online ? "Онлайн" : "Оффлайн"}
            </p>
            <p className="mb-2">
              Срок исполнения:{" "}
              {new Date(currentTask.deadline).toLocaleDateString(
                new Intl.Locale("ru"),
              ) || "Нету"}
            </p>
            <p className="mb-2">
              Просмотров: {Math.round(Math.random() * 100) + 1}
            </p>
            <p className="mb-2">
              Исполнителей: {Math.round(Math.random() * 50)}
            </p>
            <div className="flex gap-4 max-md:justify-center">
              <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]">
                <Link
                  to="/tasks"
                  className="[&.active]:font-bold block p-1  rounded"
                >
                  Назад
                </Link>
              </Button>
              {!user ? (
                <Button
                  disabled
                  variant={"destructive"}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  Требуется аккаунт
                </Button>
              ) : currentUserTask?.state === "done" ? (
                <Button
                  disabled
                  variant={"destructive"}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  На модерации
                </Button>
              ) : currentUserTask?.state === "in-progress" ? (
                <Button
                  onClick={completeTask}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  Пометить как выполненную
                </Button>
              ) : currentUserTask?.state === "rejected" ? (
                <Button
                  disabled
                  variant={"destructive"}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  Отказано
                </Button>
              ) : currentUserTask?.state === "refused" ? (
                <Button
                  disabled
                  variant={"destructive"}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  Уже отказывались, взять снова?
                </Button>
              ) : currentUserTask?.state === "success" ? (
                <Button
                  disabled
                  variant={"destructive"}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  Выполнено
                </Button>
              ) : (
                <Button
                  onClick={takeTask}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white min-w-[100px]"
                >
                  Взять задачу
                </Button>
              )}
            </div>
          </div>
          <div className="mx-auto w-fit">
            <div className="mx-auto w-fit">
              <Pie
                width={250}
                height={250}
                data={data}
                className="mx-auto w-fit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
