import type { User } from "./User";

export interface Tree {
  container: HTMLDivElement;
  timesWatered: number;
  treeScale?: number;
  seed: number;
  decayProgress: number; // Add this new property
  apples?: number;
  username: string;
  user_id: number;
}
export type Planet = "Земля" | "Юпитер" | "Марс";
export interface Forest {
  trees: Tree[];
  isLoading: boolean;
  isMainTree?: boolean;
  currentUserTree?: Tree;
  simulation?: boolean;
  planet?: Planet;
}

export interface Branch {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lineWidth: number;
  depth: number;
}

export type UserTree = {
  planted_at: string;
  vitality_percent: number;
  last_watered_at: string;
  is_active: boolean;
  age: number;
  water_after: number;
  water: number;
  apples: number;
  total_apples: number;
  user: User;
  days_since_watering: number;
  id: number;
  user_name: string;
  user_id: number;
};
