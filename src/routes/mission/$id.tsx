// import Loading from "@/components/Loading";
// import { Button } from "@/components/ui/button";
// import { useMainStore } from "@/providers/store";
// import type { Goal, Mission, Task } from "@/types/Tasks";
// import {
//   createFileRoute,
//   useNavigate,
//   useParams,
// } from "@tanstack/react-router";
// import {
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   flexRender,
//   useReactTable,
//   type ColumnDef,
//   type ColumnFiltersState,
//   type SortingState,
// } from "@tanstack/react-table";
// import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
// import { useState } from "react";
// import { useCookies } from "react-cookie";
// import useSWR from "swr";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// export const Route = createFileRoute("/mission/$id")({
//   component: RouteComponent,
// });
// const columns: ColumnDef<Goal>[] = [
//   {
//     accessorKey: "title",
//     header: ({ column }) => (
//       <Button
//         variant="ghost"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Имя задачи
//         {column.getIsSorted() === "asc" ? (
//           <ChevronUp className="ml-2 h-4 w-4" />
//         ) : column.getIsSorted() === "desc" ? (
//           <ChevronDown className="ml-2 h-4 w-4" />
//         ) : (
//           <ChevronsUpDown className="ml-2 h-4 w-4" />
//         )}
//       </Button>
//     ),
//   },
// ];
// const fetchGoals = async (id: string) => {
//   const jsonrpc = {
//     jsonrpc: "2.0",
//     method: "get_mission_goals",
//     params: { mission_id: id },
//     id: 1,
//   };

//   const response = await fetch("https://hrzero.ru/api/app/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(jsonrpc),
//   });
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   const taskData = await response.json();
//   if (taskData.error) {
//     throw new Error(taskData.error.message);
//   }
//   return taskData.result;
// };
// const fetchMission = async (id: string) => {
//   const jsonrpc = {
//     jsonrpc: "2.0",
//     method: "get_mission_by_id",
//     params: { id: id },
//     id: 1,
//   };

//   const response = await fetch("https://hrzero.ru/api/app/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(jsonrpc),
//   });
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   const taskData = await response.json();
//   if (taskData.error) {
//     throw new Error(taskData.error.message);
//   }
//   return taskData.result;
// };
// function RouteComponent() {
//   const { id } = useParams({ from: "/mission/$id" });
//   const [cookies] = useCookies(["auth-token"]);
//   const { user } = useMainStore();

//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [showInfinite, setShowInfinite] = useState(false);
//   const navigate = useNavigate({ from: "/tasks" });
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

//   const { data: goals, isLoading } = useSWR<Goal[]>("goals/" + id, () =>
//     fetchGoals(id),
//   );
//   const { data: mission } = useSWR<Mission>("mission/" + id, () =>
//     fetchMission(id),
//   );
//   const table = useReactTable<Goal>({
//     data: goals || [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     state: {
//       sorting,
//       columnFilters,
//     },
//     initialState: {
//       pagination: { pageSize: 8, pageIndex: 0 },
//     },
//   });
//   console.log({ mission, goals });
//   if (isLoading) {
//     return <Loading />;
//   }
//   if (!mission) {
//     return <div>Mission not found</div>;
//   }
//   return (
//     <div className="bg-white min-h-screen text-black">
//       <div className="max-w-7xl mx-auto ">
//         <h1 className="text-3xl font-futura-heavy  text-center text-gray-800">
//           {mission.title}
//         </h1>
//         <p className="text-xl mb-4 text-center text-gray-800">
//           {mission.description}
//         </p>
//         <p className="text-3xl font-bold mb-6 text-gray-800">Кампании</p>
//         <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-50">
//           {/* Table Container */}
//           <div className="overflow-x-auto text-black">
//             <Table className="border border-gray-50">
//               <TableHeader>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <TableHead key={header.id}>
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext(),
//                             )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody>
//                 {table.getRowModel().rows?.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow
//                       key={row.id}
//                       className="hover:bg-gray-100 cursor-pointer even:bg-slate-50"
//                       // onClick={() => {
//                       //   navigate({
//                       //     to: `/tasks/${row.original.id}`,
//                       //   });
//                       // }}
//                       data-state={row.getIsSelected() && "selected"}
//                     >
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id}>
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext(),
//                           )}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length}
//                       className="h-24 text-center"
//                     >
//                       Ничего не найдено.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Pagination */}
//           <div className="p-4 flex items-center justify-between flex-wrap gap-4 border-t">
//             <div className="text-sm text-muted-foreground">
//               Страница {table.getState().pagination.pageIndex + 1} из{" "}
//               {table.getPageCount()}
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 Предыдущая
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//               >
//                 Следующая
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
