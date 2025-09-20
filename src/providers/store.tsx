import { create } from "zustand";
import type { Tree } from "@/types/Tree";
import type { User } from "@/types/User";

interface State {
  trees: Tree[];
  user: User;
  setTrees: (nextTrees: Tree[]) => void;
  setUser: (nextUser: User) => void;
}

export const useMainStore = create<State>((set) => ({
  trees: [],
  user: { name: "test" },
  setTrees: (nextTrees) => set({ trees: nextTrees }),
  setUser: (nextUser) => set({ user: nextUser }),
}));
