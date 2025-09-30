import { ForestView, type TreeHandle } from "@/components/ForestView";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useMainStore } from "@/providers/store";
import type { Planet, UserTree } from "@/types/Tree";
import { SearchIcon } from "lucide-react";
import { planetsArray } from "@/utils/mock";
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
import useSWR from "swr";
import { useCookies } from "react-cookie";
import MapTreeData from "@/utils/mapApiResponse";

export const Route = createFileRoute("/forest")({
  component: Index,
});
type LeaderboardUser = {
  name: string;
  avatar_url: string;
  tree_age: string;
  activity: string;
  started_at: string;
};
const columns: ColumnDef<LeaderboardUser>[] = [
  {
    id: "rank",
    header: "Ранг",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: () => {
      return (
        <Button variant="ghost" className="p-0 rounded-none">
          Герой
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 min-w-[250px]">
          <img
            src={row.original.avatar_url}
            width={30}
            height={30}
            className="rounded-full"
            alt={row.original.name}
          />
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "started_at",
    header: () => {
      return (
        <Button variant="ghost" className="p-0 rounded-none">
          Начало
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return <span>{date.toLocaleDateString(new Intl.Locale("ru"))}</span>;
    },
  },
  {
    accessorKey: "tree_age",
    header: () => {
      return (
        <Button variant="ghost" className="p-0 rounded-none">
          Размер
        </Button>
      );
    },
  },
  {
    accessorKey: "activity",
    header: () => {
      return (
        <Button variant="ghost" className="p-0 rounded-none">
          Активность
        </Button>
      );
    },
  },
];
const fetchUsers = async (jwt: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_user_rating",
    params: {},
    id: 1,
  };
  // return [];
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
  const tasksData = await response.json();
  if (tasksData.error) {
    throw new Error(tasksData.error.message);
  }
  console.log({ result: tasksData.result });
  return tasksData.result;
};
const fetchUsersTree = async (jwt: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_all_trees",
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
  const tasksData = await response.json();
  if (tasksData.error) {
    throw new Error(tasksData.error.message);
  }
  return tasksData.result;
};
const fetchUserTree = async (jwt: string) => {
  if (!jwt) return null;
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_my_tree",
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
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
};
function Index() {
  // const trees = useMainStore((state) => state.trees);
  const user = useMainStore((state) => state.user);
  const [isTableVisible, setTableVisible] = useState(true);
  const treeRef = useRef<TreeHandle>(null);

  const [cookies] = useCookies(["auth-token"]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { data } = useSWR("users", () => fetchUsers(cookies["auth-token"]));
  const { data: usersTree } = useSWR("usersTree", () =>
    fetchUsersTree(cookies["auth-token"]),
  );
  const { data: userTree } = useSWR<UserTree | null>("userTree", () =>
    fetchUserTree(cookies["auth-token"]),
  );
  console.log({ usersTree });
  const table = useReactTable<LeaderboardUser>({
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
      pagination: { pageSize: 5, pageIndex: 0 },
    },
  });
  useEffect(() => {
    if (usersTree && usersTree.length > 1 && treeRef.current) {
      treeRef.current.update(
        usersTree.map(MapTreeData),
        false,
        userTree ? MapTreeData(userTree) : null,
      );
    }
  }, [usersTree, userTree]);
  console.log({ data });
  // const [isSimulationActive, setSimulationActive] = useState(false);

  // useEffect(() => {
  //   let intervalId = undefined;
  //   if (isSimulationActive) {
  //     intervalId = setInterval(() => {
  //       if (treeRef.current) {
  //         treeRef.current.simulateGrow();
  //       }
  //     }, 1000); // update simulation every 2 seconds
  //   }

  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [isSimulationActive]);

  return (
    <div className="flex items-center w-full h-full gap-4 justify-evenly  min-h-[700px]">
      <div className="w-full h-full bg-gray-100 relative">
        <div className="absolute top-0 left-0 p-4 z-10 w-full flex justify-between">
          <div>
            {isTableVisible && (
              <div className="w-fit mx-auto absolute top-16 left-4">
                <div className=" flex items-center justify-between">
                  <div className="relative">
                    <SearchIcon className="absolute w-4 h-4 text-black left-1 bottom-[10px]" />
                    <Input
                      placeholder="Поиск по названию"
                      value={
                        (table.getColumn("name")?.getFilterValue() as string) ??
                        ""
                      }
                      onChange={(event) =>
                        table
                          .getColumn("name")
                          ?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm pl-6 text-black bg-white rounded-none rounded-t-md"
                    />
                  </div>
                </div>
                <div className="hidden md:block">
                  <Table className="w-fit mx-auto min-w-xs text-black bg-white rounded-tr-md text-sm">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="h-8">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="px-2 py-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:cursor-pointer h-8"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="px-2 py-1">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* CARDS: visible on small screens */}
                <div className="grid md:hidden overflow-y-scroll max-h-[400px]">
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <div
                        key={row.id}
                        className="p-2 bg-white text-black shadow border rounded text-sm"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <img
                            src={row.original.avatar_url}
                            alt={row.original.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="font-semibold text-xs">
                            {row.original.name}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p>
                            <span className="font-medium">Ранг:</span>{" "}
                            {row.index + 1}
                          </p>
                          <p>
                            <span className="font-medium">Начало:</span>{" "}
                            {new Date(
                              row.original.started_at,
                            ).toLocaleDateString("ru")}
                          </p>
                          <p>
                            <span className="font-medium">Размер:</span>{" "}
                            {row.original.tree_age}
                          </p>
                          <p>
                            <span className="font-medium">Активность:</span>{" "}
                            {row.original.activity}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-black">Ничего не найдено</p>
                  )}
                </div>
                <div className="flex items-center justify-center w-full p-2 space-x-2 text-black bg-white rounded-b-md">
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
            )}
            <Button
              className="w-fit border-0 hover:bg-blue-500  bg-blue-primary  hover:cursor-pointer font-futura-heavy rounded-full p-4 text-white! justify-center"
              onClick={() => setTableVisible((v) => !v)}
            >
              Лидеры
            </Button>
          </div>
          <Select
            onValueChange={(value: Planet) => {
              if (treeRef.current) {
                treeRef.current.updatePlanet(value);
              }
            }}
          >
            <SelectTrigger className="w-fit border-0 hover:bg-blue-500  bg-blue-primary  hover:cursor-pointer font-futura-heavy rounded-full p-4 text-white! justify-center">
              <SelectValue placeholder={planetsArray[0]} />
            </SelectTrigger>
            <SelectContent className="bg-blue-primary text-white">
              {planetsArray.map((planet) => (
                <SelectItem
                  key={planet}
                  className="hover:bg-blue-500"
                  value={planet}
                >
                  {planet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ForestView
          ref={treeRef}
          {...{
            trees: usersTree ? usersTree.map(MapTreeData) : [],
            currentUserTree: userTree ? MapTreeData(userTree) : undefined,
            isLoading: true,
          }}
          className=""
        />
        <div className="flex absolute justify-center items-center flex-wrap  gap-2 bottom-4 w-full">
          <div className="relative">
            {/* <button
              className="absolute -left-12 bottom-1/2 translate-y-1/2"
              onClick={() => setSimulationActive((prev) => !prev)}
              title={
                isSimulationActive
                  ? "Остановить симуляцию"
                  : "Запустить симуляцию"
              }
            >
              {isSimulationActive ? (
                <Pause className="w-full h-full  bg-blue-primary hover:bg-blue-500 rounded-full p-1 hover:cursor-pointer" />
              ) : (
                <Play className="w-full h-full  bg-blue-primary hover:bg-blue-500 rounded-full p-1 hover:cursor-pointer" />
              )}
            </button> */}
            <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
              <Link
                to="/profile"
                className="[&.active]:font-bold block p-1  rounded"
              >
                {user ? "Полить дерево" : "Посади своё дерево"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
