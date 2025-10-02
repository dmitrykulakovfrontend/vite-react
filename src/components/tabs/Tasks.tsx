import type { Task } from "@/types/Tasks";
import { useNavigate } from "@tanstack/react-router";
import {
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo, useState } from "react";
import { mutate } from "swr";
import { Button } from "../ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "../ui/table";
import { useCookies } from "react-cookie";

// Reusable Table Component
function TaskTable({
  table,
}: {
  table: ReturnType<typeof useReactTable<Task>>;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="border-gray-50 border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-100 cursor-pointer even:bg-slate-50"
                  onClick={() => navigate({ to: `/tasks/${row.original.id}` })}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  Ничего не найдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="p-4 flex items-center justify-between border-t">
        <div className="text-sm text-muted-foreground">
          Страница {table.getState().pagination.pageIndex + 1} из{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}

function TasksTab({
  tasks,
  isCurrentUserPage,
}: {
  tasks: Task[] | undefined | null;
  isTasksLoading: boolean;
  isCurrentUserPage: boolean;
  userId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [cookies] = useCookies(["auth-token"]);

  async function cancelTask(id: number) {
    if (!cookies["auth-token"]) return;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "mark_task_as_refused",
      params: { task_id: id },
      id: 1,
    };

    try {
      const response = await fetch("https://hrzero.ru/api/app/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: cookies["auth-token"],
        },
        body: JSON.stringify(jsonrpc),
      });
      if (!response.ok) throw new Error("Network response was not ok.");
      const taskData = await response.json();
      if (taskData.error) throw new Error(taskData.error.message);
      await mutate("userTasks"); // Re-fetch tasks after cancellation
    } catch (error) {
      console.error("Failed to cancel task:", error);
    }
  }

  const columns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Имя задачи
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
      },
      {
        accessorKey: "event_date",
        header: "Дата начала",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value) {
            return new Date(value as string).toLocaleDateString("ru-RU");
          }
          return "-";
        },
      },
      {
        accessorKey: "deadline",
        header: "Дедлайн",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value) {
            return new Date(value as string).toLocaleDateString("ru-RU");
          }
          return "-";
        },
      },
      {
        accessorKey: "mission_title",
        header: "Кампания",
      },
      {
        accessorKey: "goal_title",
        header: "Цель",
      },
      {
        accessorKey: "state",
        header: "Статус",
        cell: ({ row }) => {
          const state = row.original.state;
          if (!state) return "-";
          const stateMap: Record<typeof state, string> = {
            done: "На модерации",
            "in-progress": "Выполняется",
            refused: "Отказались",
            rejected: "Отклонено",
            success: "Выполнено",
          };
          return stateMap[state] || state;
        },
      },
      {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => {
          if (row.original.state === "in-progress" && isCurrentUserPage) {
            return (
              <Button
                variant="link"
                className="p-0 h-auto text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelTask(row.original.id);
                }}
              >
                Отказаться
              </Button>
            );
          }
          return null;
        },
      },
    ],
    [isCurrentUserPage],
  );

  const inProgressTasks = useMemo(
    () => tasks?.filter((task) => task.state === "in-progress") || [],
    [tasks],
  );
  const completedTasks = useMemo(
    () =>
      tasks?.filter(
        (task) => task.state === "done" || task.state === "success",
      ) || [],
    [tasks],
  );
  const rejectedTasks = useMemo(
    () =>
      tasks?.filter(
        (task) => task.state === "rejected" || task.state === "refused",
      ) || [],
    [tasks],
  );

  const useTaskTable = (data: Task[]) =>
    useReactTable<Task>({
      data,
      columns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

  const inProgressTable = useTaskTable(inProgressTasks);
  const completedTable = useTaskTable(completedTasks);
  const rejectedTable = useTaskTable(rejectedTasks);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white h-full text-black w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">В работе</h2>
          <TaskTable table={inProgressTable} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Выполненные</h2>
          <TaskTable table={completedTable} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Отказ / Отклонено</h2>
          <TaskTable table={rejectedTable} />
        </div>
      </div>
    </div>
  );
}
export default TasksTab;
