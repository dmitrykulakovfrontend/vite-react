import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "@/types/Tasks";
import { createFileRoute } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
export const Route = createFileRoute("/tasks")({
  component: Tasks,
});
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Название",
  },
  {
    accessorKey: "description",
    header: "Описание",
  },
  {
    accessorKey: "category",
    header: "Категория",
  },
  {
    accessorKey: "xpReward",
    header: "Опыт",
  },
  {
    accessorKey: "manaReward",
    header: "Мана",
  },
  {
    accessorKey: "minRank",
    header: "Минимальный ранг",
  },
  {
    accessorKey: "competencies",
    header: "Компетенции",
    cell: ({ row }) => {
      const comps = row.original.competencies;
      return (
        <ul>
          {Object.entries(comps).map(([key, value]) => (
            <li key={key}>
              {key}: +{value}
            </li>
          ))}
        </ul>
      );
    },
  },
  {
    accessorKey: "artifactReward",
    header: "Артефакт",
    cell: ({ row }) => {
      const artifact = row.original.artifactReward;
      if (!artifact) return "—";
      return (
        <div className="max-w-xs">
          <div>{artifact.name}</div>
          <div>{artifact.description}</div>
          <small>{artifact.rarity ?? "Обычный"}</small>
        </div>
      );
    },
  },
];
const tasks: Task[] = [
  {
    title: "Наставничество: Введение в курс дела",
    description:
      "Помогите новому коллеге освоиться в компании, отвечая на его вопросы и знакомя с ключевыми процессами.",
    category: "Квест",
    xpReward: 150,
    manaReward: 100,
    minRank: 3,
    competencies: {
      Общение: 2,
      Командование: 1,
    },
  },
  {
    title: "Найм: Разбор резюме",
    description:
      "Проанализируйте 10 резюме кандидатов на открытую вакансию, выделив наиболее подходящих.",
    category: "Рекрутинг",
    xpReward: 120,
    manaReward: 80,
    minRank: 2,
    competencies: {
      Аналитика: 2,
      "Вера в дело": 1,
    },
  },
  {
    title: "Лекторий: Презентация 'Тайм-менеджмент'",
    description:
      "Подготовьте и проведите 30-минутную лекцию для команды на тему эффективного управления временем.",
    category: "Лекторий",
    xpReward: 200,
    manaReward: 150,
    minRank: 4,
    competencies: {
      Общение: 3,
      "Стремление к большему": 2,
    },
    artifactReward: {
      rarity: "Обычный",
      image: "images/artifacts/speaker_scroll.png",
      name: "Свиток оратора",
      description: "Увеличивает эффективность всех лекций на 10%.",
    },
  },
  {
    title: "Симулятор: Тест 'Базовая экономика'",
    description:
      "Пройдите онлайн-тест из 20 вопросов на знание основ экономической теории и практики.",
    category: "Симулятор",
    xpReward: 100,
    manaReward: 50,
    minRank: 1,
    competencies: {
      "Базовая экономика": 3,
    },
  },
  {
    title: "Квест: 'Путь к истокам' (оффлайн)",
    description:
      "Посетите одно из наших производственных предприятий и проведите 3 часа, изучая рабочие процессы.",
    category: "Квест",
    xpReward: 300,
    manaReward: 250,
    minRank: 5,
    competencies: {
      "Трёхмерное мышление": 2,
      "Вера в дело": 2,
    },
    artifactReward: {
      rarity: "Обычный",
      image: "images/artifacts/speaker_scroll.png",
      name: "Пропуск к производству",
      description:
        "Дает право на внеплановое посещение любого объекта компании один раз в месяц.",
    },
  },
  {
    title: "Рекрутинг: Участие в ярмарке вакансий",
    description:
      "Представляйте компанию на университетской ярмарке вакансий, общаясь со студентами и отвечая на их вопросы.",
    category: "Рекрутинг",
    xpReward: 180,
    manaReward: 130,
    minRank: 3,
    competencies: {
      Общение: 3,
      "Вера в дело": 2,
    },
  },
  {
    title: "Симулятор: Соревнование 'Анализ данных'",
    description:
      "Примите участие в соревновании по анализу данных, где необходимо найти оптимальное решение для бизнес-кейса.",
    category: "Симулятор",
    xpReward: 250,
    manaReward: 200,
    minRank: 4,
    competencies: {
      Аналитика: 4,
      Юриспруденция: 1,
    },
  },
  {
    title: "Лекторий: Серия вебинаров 'Основы аэронавигации'",
    description:
      "Подготовьте серию из 3-х вебинаров для коллег, желающих углубить свои знания в области аэронавигации.",
    category: "Лекторий",
    xpReward: 500,
    manaReward: 400,
    minRank: 6,
    competencies: {
      "Основы аэронавигации": 5,
      Общение: 3,
    },
    artifactReward: {
      rarity: "Обычный",
      image: "images/artifacts/speaker_scroll.png",
      name: "Навигационный амулет",
      description:
        "Увеличивает скорость прокачки всех навыков, связанных с аэронавигацией, на 20%.",
    },
  },
  {
    title: "Квест: 'Защита диплома'",
    description:
      "Подготовьте финальный проектный отчет и представьте его руководству компании, защитив свои идеи и решения.",
    category: "Квест",
    xpReward: 400,
    manaReward: 300,
    minRank: 5,
    competencies: {
      "Стремление к большему": 3,
      Аналитика: 2,
      Командование: 2,
    },
  },
  {
    title: "Помощь новичкам",
    description: "Объясни новым сотрудникам основы работы и компании.",
    xpReward: 100,
    manaReward: 50,
    minRank: 1,
    competencies: {
      Общение: 5,
      "Вера в дело": 2,
    },
    category: "Лекторий",
    artifactReward: {
      image: "/images/artifacts/mentor_badge.png",
      name: "Знак Наставника",
      description: "Особый значок, который показывает твою роль наставника.",
      rarity: "Редкий",
    },
  },
  {
    title: "Пройти тест на аналитические способности",
    description: "Выполни онлайн-тест для проверки аналитических навыков.",
    xpReward: 80,
    manaReward: 40,
    minRank: 2,
    competencies: {
      Аналитика: 5,
    },
    category: "Симулятор",
  },
  {
    title: "Привлечение новых кандидатов",
    description: "Пригласи и проконсультируй новых соискателей.",
    xpReward: 120,
    manaReward: 60,
    minRank: 1,
    competencies: {
      Командование: 3,
      Общение: 4,
    },
    category: "Рекрутинг",
  },
  {
    title: "Повседневная задача",
    description: "Выполни стандартное задание на работе.",
    xpReward: 50,
    manaReward: 20,
    minRank: 1,
    competencies: {
      "Вера в дело": 2,
    },
    category: "Квест",
  },
];
function Tasks() {
  // const { data } = useSWR("https://pokeapi.co/api/v2/pokemon/ditto", {
  //   refreshInterval: 3000,
  // });
  // useEffect(() => {
  //   const timer = setInterval(() => console.log(data), 3000);
  //   console.log({ data });
  //   return () => {
  //     clearInterval(timer);
  //   };
  // });
  const table = useReactTable<Task>({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <div className="p-4 overflow-hidden">
      <Table className="w-full text-black bg-white rounded-t-md">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
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
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
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
  );
}
