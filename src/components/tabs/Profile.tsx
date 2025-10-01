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
    cell: ({ getValue }) => {
      if (getValue()) {
        const date = new Date(getValue() as string);
        return <span>{date.toLocaleDateString(new Intl.Locale("ru"))}</span>;
      }
      return <span></span>;
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

      {!isRatingLoading ? (
        <div className="mt-8">
          <h1 className="text-2xl mx-auto w-fit  font-futura-heavy my-2">
            Рейтинг
          </h1>
          <div className="hidden md:block md:w-fit md:mx-auto">
            <Table className=" text-black bg-white rounded-md">
              <TableHeader>
                {table.getRowModel().rows.length
                  ? table.getHeaderGroups().map((headerGroup) => (
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
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
          <div className="space-y-4 md:hidden overflow-y-scroll">
            {rating && rating.length ? (
              rating.map((row) => (
                <div
                  key={row.goal_title}
                  className="rounded-md border p-4 bg-white shadow"
                >
                  <h3 className="font-bold text-lg">{row.goal_title}</h3>
                  <p>Ранг: {row.user_rank}</p>
                  <p>Выполнено задач: {row.completed_tasks_count}</p>
                  <p>
                    Последняя задача:{" "}
                    {row.last_task_updated_at
                      ? new Date(row.last_task_updated_at).toLocaleDateString(
                          new Intl.Locale("ru"),
                        )
                      : "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center">Ничего не найдено</p>
            )}
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}
export default ProfileTab;
