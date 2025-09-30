import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/$id")({
  component: Profile,
});

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState } from "react";
import ProfileTab from "@/components/tabs/Profile";
import TasksTab from "@/components/tabs/Tasks";
import TreeTab from "@/components/tabs/Tree";
import useSWR from "swr";
import type { User } from "@/types/User";
import type { Task, TaskRating } from "@/types/Tasks";
import type { UserTree } from "@/types/Tree";
import { useMainStore } from "@/providers/store";

ChartJS.register(ArcElement, Tooltip, Legend);
const fetchUser = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_user",
    params: { user_id: id },
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
const fetchUserTasks = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "my_tasks",
    params: { user_id: id },
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
const fetchUserTree = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_my_tree",
    params: { user_id: id },
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
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
};
const fetchUserRating = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "my_rating",
    params: { user_id: id },
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
function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "tree" | "tasks">(
    "profile",
  );

  const { id } = useParams({ from: "/profile/$id" });
  const { data: user, isLoading: isUserLoading } = useSWR<User | null>(
    "user" + id,
    () => fetchUser(id),
  );
  const { data: userTasks, isLoading: isTasksLoading } = useSWR<Task[] | null>(
    "userTasks" + id,
    () => fetchUserTasks(id),
  );
  const { data: userTree, isLoading: isTreeLoading } = useSWR<UserTree | null>(
    "userTree" + id,
    () => fetchUserTree(id),
  );
  const { data: userRating, isLoading: isRatingLoading } = useSWR<TaskRating[]>(
    "userRating" + id,
    () => fetchUserRating(id),
  );
  const tabs = [
    { id: "profile" as const, label: "Аккаунт" },
    { id: "tree" as const, label: "Дерево" },
    { id: "tasks" as const, label: "Задачи" },
  ];
  const { user: currentUser } = useMainStore();
  const isCurrentUserPage =
    typeof currentUser === "object" &&
    currentUser !== null &&
    "id" in currentUser
      ? String(currentUser.id) === id
      : false;
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-center w-full gap-4 bg-white sticky top-14 z-40  ">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-fit border-0 text-black hover:cursor-pointer hover:text-blue-light font-futura-heavy p-4 justify-center ${
              activeTab === id
                ? " text-blue-light border-b-6 border-blue-light"
                : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* --- Tabs content --- */}
      <div className="h-full bg-white pt-4 px-8 min-h-[700px]">
        {activeTab === "profile" && (
          <ProfileTab
            user={user}
            isUserLoading={isUserLoading}
            isRatingLoading={isRatingLoading}
            rating={userRating}
            isCurrentUserPage={isCurrentUserPage}
          />
        )}
        {activeTab === "tree" && (
          <TreeTab
            tree={userTree}
            isTreeLoading={isTreeLoading}
            isCurrentUserPage={isCurrentUserPage}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            tasks={userTasks}
            isTasksLoading={isTasksLoading}
            userId={id}
            isCurrentUserPage={isCurrentUserPage}
          />
        )}
      </div>
    </div>
  );
}
