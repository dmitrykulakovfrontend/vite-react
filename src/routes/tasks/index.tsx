import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ArrowDown, ArrowUp, SearchIcon } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { useCookies } from "react-cookie";
import Loading from "@/components/Loading";

ChartJS.register(ArcElement, Tooltip, Legend);

export const Route = createFileRoute("/tasks/")({
  component: Tasks,
});
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
          Миссия
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
];
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
  console.log({ result: tasksData.result });
  return tasksData.result;
};
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
      pagination: { pageSize: 7, pageIndex: 0 },
    },
  });

  if (isLoading) {
    return <Loading />;
  }
  // interface ChartDataset {
  //   label: string;
  //   data: number[];
  //   backgroundColor?: string[];
  //   borderColor?: string[];
  //   borderWidth?: number;
  // }
  // interface ChartData {
  //   labels: string[];
  //   datasets: ChartDataset[];
  // }

  // const chartData2 = (data || []).reduce(
  //   (acc: ChartData, task: Task) => {
  //     let label: string;
  //     if (task.mission_title === null) {
  //       label = "Без миссии";
  //     } else {
  //       label = task.mission_title;
  //     }
  //     if (!acc.labels.includes(label)) {
  //       acc.labels.push(label);
  //       acc.datasets[0].data.push(1);
  //     } else {
  //       const index = acc.labels.indexOf(label);
  //       acc.datasets[0].data[index]++;
  //     }
  //     return acc;
  //   },
  //   {
  //     labels: [],
  //     datasets: [
  //       {
  //         label: "Количество задач:",
  //         data: [],
  //         backgroundColor: [
  //           "rgba(255, 99, 132, 0.2)",
  //           "rgba(54, 162, 235, 0.2)",
  //           "rgba(255, 206, 86, 0.2)",
  //         ],
  //         borderColor: [
  //           "rgba(255, 99, 132, 1)",
  //           "rgba(54, 162, 235, 1)",
  //           "rgba(255, 206, 86, 1)",
  //         ],
  //         borderWidth: 1,
  //       },
  //     ],
  //   } as ChartData,
  // );

  return (
    <div className="p-4 bg-white w-full h-full">
      {/* <div className="bg-white rounded mb-6 text-black flex flex-col w-fit p-6 mx-auto items-center justify-between">
        <h2 className="text-2xl font-futura-heavy mb-4">
          Количество задач: {data?.length || "Загрузка..."}
        </h2>
        <div>
          <h3 className="text-2xl font-futura-heavy mb-4">
            Статистика по кампаниям:
          </h3>
          <div className="w-[200px] h-[200px] mx-auto bg-white">
            <Pie data={chartData2} />
          </div>
        </div>
      </div> */}
      <h1 className="text-2xl mx-auto w-fit  font-futura-heavy my-4 text-black">
        Доступные задачи:
      </h1>
      <div className=" lg:w-fit lg:mx-auto max-lg:max-w-full max-lg:overflow-x-auto">
        <div className="  flex justify-between  items-end  max-[500px]:flex-col-reverse max-[500px]:items-start">
          <div className="relative  max-[500px]:min-w-[240px]  ">
            <SearchIcon className="absolute w-4 h-4 text-black left-1 bottom-[10px]" />
            <Input
              placeholder="Поиск по названию"
              value={
                (table.getColumn("title")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm pl-6  border-b border-t-0 text-black bg-white rounded-none max-[500px]:rounded-t-none rounded-t-md shadow-none border-none"
            />
          </div>
          <div className="flex gap-2 max-md:flex-col  border-b max-[500px]:rounded-t-md  max-[500px]:min-w-[240px] bg-white max-md:h-fit h-9 px-3 py-1 rounded-t-md text-black  items-start border-none justify-center">
            <label className="flex items-center gap-2  mb-2">
              <Input
                type="checkbox"
                checked={showInfinite}
                className="w-4 h-4"
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShowInfinite(checked);
                  table.getColumn("user_limit")?.setFilterValue(checked);
                }}
              />
              Только бесконечные задачи
            </label>
          </div>
        </div>
        <Table className="w-fit border-2 mx-auto max-[500px]:rounded-tr-md  max-w-7xl text-black bg-white">
          <TableHeader>
            {table.getRowModel().rows.length
              ? table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="px-0">
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
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
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Предыдущая страница
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Следующая страница
          </Button>
        </div>
      </div>
    </div>
  );
}
