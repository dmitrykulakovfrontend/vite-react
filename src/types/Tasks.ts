export type TaskCategory = "Квест" | "Рекрутинг" | "Лекторий" | "Симулятор";

export type Competency =
  | "Вера в дело"
  | "Стремление к большему"
  | "Общение"
  | "Аналитика"
  | "Командование"
  | "Юриспруденция"
  | "Трёхмерное мышление"
  | "Базовая экономика"
  | "Основы аэронавигации";
export type Rarity = "Обычный" | "Редкий" | "Эпический" | "Легендарный";
export interface Artifact {
  image: string; // ссылка на изображение
  name: string;
  description: string;
  rarity: Rarity;
}

export interface Task {
  title: string;
  description: string;
  xpReward: number;
  manaReward: number;
  minRank: number;
  competencies: Partial<Record<Competency, number>>; // насколько прокачивается каждая компетенция
  category: TaskCategory;
  artifactReward?: Artifact;
}
