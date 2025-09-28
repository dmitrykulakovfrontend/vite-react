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
    <div className="flex flex-col w-full p-4">
      <div className="flex justify-center gap-4 mb-6">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-fit border-0 hover:bg-blue-500   hover:cursor-pointer font-futura-heavy rounded-full px-4 py-2 text-white! justify-center ${
              activeTab === id ? "bg-blue-500" : "bg-blue-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* --- Tabs content --- */}
      <div className="">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "tree" && <TreeTab />}
        {activeTab === "tasks" && <TasksTab />}
      </div>
    </div>
  );
}
