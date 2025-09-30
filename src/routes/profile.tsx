import { createFileRoute } from "@tanstack/react-router";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState } from "react";
import ProfileTab from "@/components/tabs/Profile";
import TasksTab from "@/components/tabs/Tasks";
import TreeTab from "@/components/tabs/Tree";

ChartJS.register(ArcElement, Tooltip, Legend);
export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "tree" | "tasks">(
    "profile",
  );
  const tabs = [
    { id: "profile" as const, label: "Аккаунт" },
    { id: "tree" as const, label: "Дерево" },
    { id: "tasks" as const, label: "Задачи" },
  ];

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
      <div className="h-full bg-white px-8 min-h-[700px]">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "tree" && <TreeTab />}
        {activeTab === "tasks" && <TasksTab />}
      </div>
    </div>
  );
}
