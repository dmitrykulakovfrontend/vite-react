// src/routes/tasks.index.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import type { Task } from "@/types/Tasks";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { useCookies } from "react-cookie";
import Loading from "@/components/Loading";

export const Route = createFileRoute("/tasks/")({
  component: Tasks,
});

// Column definitions for the table
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Имя задачи
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
  },
  {
    accessorKey: "event_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Дата начала
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      if (value) {
        const date = new Date(value as string);
        return <span>{date.toLocaleDateString("ru-RU")}</span>;
      }
      return <span>-</span>;
    },
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Дедлайн
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      if (value) {
        const date = new Date(value as string);
        return <span>{date.toLocaleDateString("ru-RU")}</span>;
      }
      return <span>-</span>;
    },
  },
  {
    accessorKey: "mission_title",
    header: "Миссия",
  },
  {
    accessorKey: "goal_title",
    header: "Кампания",
  },
  {
    accessorKey: "skill_title",
    header: "Ранг",
  },
  {
    accessorKey: "online",
    header: "Место",
    cell: ({ row }) => {
      const isOnline = row.getValue("online");
      return isOnline ? (
        <Badge variant="default">Онлайн</Badge>
      ) : (
        <Badge variant="secondary">Оффлайн</Badge>
      );
    },
  },
  {
    accessorKey: "water_reward",
    header: "Воды",
  },
  {
    accessorKey: "apple_reward",
    header: "Яблок",
  },
  {
    accessorKey: "user_limit",
    header: "Участники",
    cell: ({ row }) => {
      const limit = row.getValue("user_limit");
      return limit === null ? "∞" : limit;
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      return row.getValue(id) === null;
    },
  },
];

// Async function to fetch tasks from the API
const fetchTasks = async (jwt: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_available_tasks",
    id: 1,
  };

  const response = await fetch("https://hrzero.ru/api/app/", {
    method: "POST",
    headers: jwt
      ? {
          "Content-Type": "application/json",
          Authorization: jwt,
        }
      : {
          "Content-Type": "application/json",
        },
    body: JSON.stringify(jsonrpc),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const tasksData = await response.json();
  if (tasksData.error) {
    throw new Error(tasksData.error.message);
  }
  return tasksData.result;
};

// Main Tasks component
function Tasks() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [cookies] = useCookies(["auth-token"]);
  const [showInfinite, setShowInfinite] = useState(false);
  const navigate = useNavigate({ from: "/tasks" });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { data, isLoading } = useSWR<Task[] | null>("tasks", () =>
    fetchTasks(cookies["auth-token"]),
  );

  const table = useReactTable<Task>({
    data: data || [],
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
      pagination: { pageSize: 8, pageIndex: 0 },
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full bg-white text-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto ">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Доступные задачи
        </h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-50">
          {/* Table Controls: Search and Filters */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b">
            <div className="relative w-full sm:max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Поиск по названию..."
                value={
                  (table.getColumn("title")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="infinite-tasks"
                type="checkbox"
                checked={showInfinite}
                className="h-4 w-4"
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShowInfinite(checked);
                  table.getColumn("user_limit")?.setFilterValue(checked);
                }}
              />
              <label
                htmlFor="infinite-tasks"
                className="text-sm font-medium text-gray-700 select-none"
              >
                Только бесконечные задачи
              </label>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <Table className="border border-gray-50">
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-100 cursor-pointer even:bg-slate-50"
                      onClick={() => {
                        navigate({
                          to: `/tasks/${row.original.id}`,
                        });
                      }}
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Ничего не найдено.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between flex-wrap gap-4 border-t">
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
                Предыдущая
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Следующая
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
