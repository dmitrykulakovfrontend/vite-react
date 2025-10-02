import { Link, useNavigate } from "@tanstack/react-router";
import Loading from "../Loading";
import { Button } from "../ui/button";
import type { TaskRating } from "@/types/Tasks";
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
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { User } from "@/types/User";

const columns: ColumnDef<TaskRating>[] = [
  {
    accessorKey: "goal_title",
    header: "Категория",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "user_rank",
    header: "Ранг",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "completed_tasks_count",
    header: "Выполнено задач",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "last_task_updated_at",
    header: "Последняя задача",
    cell: ({ row }) => {
      if (row.original.last_task_updated_at) {
        const date = new Date(row.original.last_task_updated_at);
        return <span>{date.toLocaleDateString(new Intl.Locale("ru"))}</span>;
      }
      return <span></span>;
    },
  },
  {
    accessorKey: "rank_progress",
    header: "Прогресс",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className={`h-4 w-2 rounded-sm ${
                index < row.original.rank_progress
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      );
    },
  },
  {
    header: "До повышения",
    cell: ({ row }) => {
      return <span> {10 - row.original.rank_progress}</span>;
    },
  },
];
type ProfileTabProps = {
  user: User | undefined | null;
  isUserLoading: boolean;
  isRatingLoading: boolean;
  isCurrentUserPage: boolean;
  rating: TaskRating[] | undefined;
};
function ProfileTab({
  user,
  isUserLoading,
  isRatingLoading,
  rating,
  isCurrentUserPage,
}: ProfileTabProps) {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TaskRating[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  useEffect(() => {
    if (rating) setTableData(rating);
  }, [rating, isRatingLoading]);

  const table = useReactTable<TaskRating>({
    data: tableData,
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

  if (isUserLoading) return <Loading />;
  if (!user) {
    navigate({ to: "/" });
    return null;
  }
  console.log({ rating });
  return (
    <div className=" w-full flex flex-col justify-start items-center   text-black ">
      <div className="flex gap-4 max-sm:flex-col   max-sm:items-center max-sm:justify-center ">
        <div>
          <img
            src={user.avatar_url}
            width={100}
            height={100}
            className="rounded-full mb-4"
          />
        </div>
        <div className="max-sm:w-full ">
          <h2 className="text-2xl font-bold mb-2">
            Владелец: {user.metadata.name}
          </h2>
          <p className="mb-1">Email: {user.email}</p>
          <p className="mb-1">Telegram: {"-"}</p>
          <p className="mb-1">
            Дата регистрации:{" "}
            {new Date(user.created_at).toLocaleDateString(
              new Intl.Locale("ru"),
            )}
          </p>
          <p className="mb-1">Позиция: {user.roles}</p>
          <div className="flex justify-between items-center gap-4">
            <p className="mb-1">Мерч: 4</p>
            <Button className="max-sm:block hidden max-w-[200px]  hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white w-fit">
              <Link to="/shop" className="[&.active]:font-bold  p-1  rounded">
                Магазин
              </Link>
            </Button>
          </div>
        </div>
        {isCurrentUserPage && (
          <div className="flex flex-col justify-between items-end gap-2">
            <div className="flex flex-col gap-2">
              <Button className=" max-w-[200px]  hover:bg-blue-500  bg-red-500 w-fit hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                <Link
                  to="/shop"
                  className="[&.active]:font-bold block p-1  rounded"
                >
                  Удалить аккаунт
                </Link>
              </Button>
              <Button className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-fit hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                <Link
                  to="/shop"
                  className="[&.active]:font-bold block p-1  rounded"
                >
                  Изменить пароль
                </Link>
              </Button>
            </div>
            <Button className="max-sm:hidden max-w-[200px]  hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white w-fit">
              <Link
                to="/shop"
                className="[&.active]:font-bold block p-1  rounded"
              >
                Магазин
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Rating Section */}
      {isRatingLoading ? (
        <Loading />
      ) : (
        <div className="bg-white  overflow-hidden">
          <h2 className="text-2xl font-bold p-6 border-b">Рейтинг</h2>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="border-gray-50 border">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="even:bg-slate-50"
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
                      Ничего не найдено
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4 bg-white">
            {rating && rating.length ? (
              rating.map((row) => (
                <div
                  key={row.goal_title}
                  className="rounded-md border p-4 bg-white shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-2">{row.goal_title}</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">Ранг:</span>{" "}
                      {row.user_rank}
                    </p>
                    <p>
                      <span className="font-semibold">Выполнено задач:</span>{" "}
                      {row.completed_tasks_count}
                    </p>
                    <p>
                      <span className="font-semibold">Последняя задача:</span>{" "}
                      {row.last_task_updated_at
                        ? new Date(row.last_task_updated_at).toLocaleDateString(
                            "ru-RU",
                          )
                        : "-"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Прогресс:</span>
                      <div className="flex items-center gap-x-1">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-4 w-2 rounded-sm ${
                              index < row.rank_progress
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p>
                      <span className="font-semibold">До повышения:</span>{" "}
                      {10 - row.rank_progress}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                Ничего не найдено
              </p>
            )}
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
      )}
    </div>
  );
}
export default ProfileTab;
