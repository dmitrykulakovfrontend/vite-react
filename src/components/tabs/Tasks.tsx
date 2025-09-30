import type { Task } from "@/types/Tasks";
import { useNavigate } from "@tanstack/react-router";
import {
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
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
import { useMainStore } from "@/providers/store";
function TasksTab({
  tasks,
}: {
  tasks: Task[] | undefined | null;
  isTasksLoading: boolean;
  userId: string;
}) {
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Имя задачи
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "event_date",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Дата начала
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
      cell: ({ getValue }) => {
        if (getValue()) {
          const date = new Date(getValue() as string);
          return <span>{date.toLocaleDateString(new Intl.Locale("ru"))}</span>;
        }
        return <span></span>;
      },
    },
    {
      accessorKey: "deadline",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Дедлайн
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
      cell: ({ getValue }) => {
        if (getValue()) {
          const date = new Date(getValue() as string);
          return <span>{date.toLocaleDateString(new Intl.Locale("ru"))}</span>;
        }
        return <span></span>;
      },
    },
    {
      accessorKey: "mission_title",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Кампания
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "goal_title",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Цель
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "skill_title",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Навык
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "online",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Место
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const value = getValue<string | null>();
        return value ? "Онлайн" : "Оффлайн";
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Описание
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "water_reward",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Воды
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "apple_reward",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Яблок
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
    },
    {
      accessorKey: "user_limit",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Максимум участников
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        return row.getValue(id) === null;
      },
    },

    {
      accessorKey: "state",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            className="gap-1 rounded-none p-2 w-full flex justify-start"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            Статус
            {isSorted === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const state = row.original.state;
        if (!state) {
          return <span></span>;
        }
        const stateMap: Record<typeof state, string> = {
          done: "На модерации",
          "in-progress": "Выполняется",
          refused: "Отказались",
          rejected: "Отклонено",
          success: "Выполнено",
        };
        return <span> {stateMap[state]}</span>;
      },
    },

    {
      accessorKey: "actions",
      header: () => {
        return <span></span>;
      },
      cell: ({ row }) => {
        if (
          row.original.state === "refused" ||
          row.original.state === "success" ||
          !row.original.state ||
          user
        ) {
          return null;
        }
        return (
          <span
            onClick={(e) => {
              e.stopPropagation();
              cancelTask(row.original.id);
            }}
            className="cursor-pointer text-red-500 hover:underline"
          >
            Отказаться
          </span>
        );
      },
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [cookies] = useCookies(["auth-token"]);
  const { user } = useMainStore();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const navigate = useNavigate({ from: "/tasks" });

  const userTasksTable = useReactTable<Task>({
    data: tasks || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 7, pageIndex: 0 },
    },
  });
  async function cancelTask(id: number) {
    if (!cookies["auth-token"]) return null;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "mark_task_as_refused",
      params: {
        task_id: id,
      },
      id: 1,
    };

    const response = await fetch("https://hrzero.ru/api/app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies["auth-token"],
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
    await mutate("userTasks");
    return taskData.result;
  }
  return (
    <div className="p-4  bg-white rounded-4xl h-full text-black w-full ">
      <div className="">
        <h1 className="text-2xl mx-auto w-fit  font-futura-heavy my-4">
          Задачи:
        </h1>
        <div className="w-fit mx-auto max-w-full overflow-x-auto">
          <Table className="w-fit mx-auto max-[500px]:rounded-tr-md  max-w-7xl text-black bg-white">
            <TableHeader>
              {userTasksTable.getRowModel().rows.length
                ? userTasksTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))
                : null}
            </TableHeader>
            <TableBody>
              {userTasksTable.getRowModel().rows.length ? (
                userTasksTable.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:cursor-pointer"
                    onClick={() => {
                      navigate({
                        to: `/tasks/${row.original.id}`,
                      });
                    }}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="border-2">
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
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Ничего не найдено
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-center w-full py-4 space-x-2 text-black bg-white rounded-b-md">
            <Button
              variant="outline"
              size="sm"
              onClick={() => userTasksTable.previousPage()}
              disabled={!userTasksTable.getCanPreviousPage()}
            >
              Предыдущая страница
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => userTasksTable.nextPage()}
              disabled={!userTasksTable.getCanNextPage()}
            >
              Следующая страница
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default TasksTab;
