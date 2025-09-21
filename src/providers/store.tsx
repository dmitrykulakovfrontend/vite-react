import { create } from "zustand";
import type { Tree } from "@/types/Tree";
import type { User } from "@/types/User";

interface State {
  trees: Tree[];
  user: User | null;
  setTrees: (nextTrees: Tree[]) => void;
  setUser: (nextUser: User | null) => void;
}

export const useMainStore = create<State>((set) => ({
  trees: [],
  user: null,
  setTrees: (nextTrees) => set({ trees: nextTrees }),
  setUser: (nextUser) => set({ user: nextUser }),
}));
