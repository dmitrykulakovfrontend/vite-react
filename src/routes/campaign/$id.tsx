import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import type { Goal, Task } from "@/types/Tasks";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/campaign/$id")({
  component: RouteComponent,
});
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0"
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
    accessorKey: "rank",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ранг
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
    accessorKey: "water_reward",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Воды
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
    accessorKey: "apple_reward",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Яблок
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
    accessorKey: "user_limit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Участники
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
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
const fetchGoal = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_goal_by_id",
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
const fetchTasksByCampaign = async (id: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_goal_tasks",
    params: { goal_id: id },
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
function RouteComponent() {
  const { id } = useParams({ from: "/campaign/$id" });

  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate({ from: "/tasks" });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data: goal, isLoading } = useSWR<Goal>("goal/" + id, () =>
    fetchGoal(id),
  );
  const { data: tasks } = useSWR<Task[]>("tasks/" + id, () =>
    fetchTasksByCampaign(id),
  );
  const table = useReactTable<Task>({
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
      pagination: { pageSize: 8, pageIndex: 0 },
    },
  });
  if (isLoading) {
    return <Loading />;
  }
  if (!goal) {
    return <div>Mission not found</div>;
  }
  return (
    <div className="bg-white min-h-screen text-black">
      <div className="max-w-7xl mx-auto ">
        <h1 className="text-3xl font-futura-heavy  text-center text-gray-800">
          {goal.title}
        </h1>
        <p className="text-xl mb-4 text-center text-gray-800">
          {goal.description}
        </p>
        <p className="text-3xl font-bold mb-6 text-gray-800">Задачи</p>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-50">
          {/* Table Container */}
          <div className="overflow-x-auto text-black">
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
