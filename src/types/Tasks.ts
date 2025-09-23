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
  created_at: string;
  updated_at: string;
  synced: boolean;
  cache: unknown | null;
  id: number;
  title: string;
  description: string;
  user_limit: number | null; // null = без ограничений
  water_reward: number;
  mission: Record<string, unknown>;
  mission_title: string;
  mission_id: number;
  goal: Record<string, unknown>;
  goal_title: string;
  goal_id: number;
  skill: Record<string, unknown>;
  skill_title: string;
  skill_id: number;
  online: boolean | null;
  deadline: string;
  event_date: string;
  apple_reward: number | null;
}
