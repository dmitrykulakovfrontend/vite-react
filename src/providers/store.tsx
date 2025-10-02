import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tree } from "@/types/Tree";
import type { User } from "@/types/User";
import { mutate } from "swr";
// localstorage persist is enabled by default when using persist from zustand

interface Product {
  id: number;
  name: string;
  price: number;
  imageSrc: string;
  amount?: number;
}

interface InventoryItem extends Product {
  boughtAt: string;
}

interface State {
  trees: Tree[];
  user: User | "loading" | null;
  products: Product[];
  inventory: InventoryItem[];
  totalSpentApples: number;
  setTrees: (nextTrees: Tree[]) => void;
  setUser: (nextUser: User | "loading" | null) => void;
  buyProduct: (productId: number, amount: number, jwt: string) => void;
}

const productsData: Product[] = [
  {
    id: 1,
    name: "Футболка с логотипом",
    price: 25,
    imageSrc: "merch1.png",
  },
  {
    id: 2,
    name: "Фирменный убор Алабуги",
    price: 50,
    imageSrc: "merch2.png",
  },
  {
    id: 3,
    name: "Саженец",
    price: 5,
    amount: 1,
    imageSrc: "/image.png",
  },
  {
    id: 4,
    name: "Вода",
    price: 0.05,
    amount: 100,
    imageSrc: "Water.png",
  },
];

export const useMainStore = create<State>()(
  persist(
    (set, get) => ({
      trees: [],
      user: null,
      products: productsData,
      inventory: [],
      totalSpentApples: 0,
      setTrees: (nextTrees) => set({ trees: nextTrees }),
      setUser: (nextUser) => set({ user: nextUser }),
      buyProduct: async (productId, amount, jwt) => {
        if (!jwt) return;
        const { products, inventory, totalSpentApples } = get();
        const productToBuy = products.find((p) => p.id === productId);

        if (productToBuy) {
          if (productToBuy.id === 4) {
            const jsonrpc = {
              jsonrpc: "2.0",
              method: "add_resources",
              params: {
                water: amount,
              },
              id: 0,
            };

            const response = await fetch("https://hrzero.ru/api/app/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: jwt,
              },
              body: JSON.stringify(jsonrpc),
            });
            const data = await response.json();
            if (data.result) {
              await mutate("currentUser");
              console.log(data.result);
            }
            const newTotalSpentApples =
              totalSpentApples + productToBuy.price * amount;
            set({ totalSpentApples: newTotalSpentApples });
            return;
          }

          const existingInventoryItem = inventory.find(
            (item) => item.id === productId,
          );

          let newInventory;
          if (existingInventoryItem) {
            newInventory = inventory.map((item) =>
              item.id === productId
                ? { ...item, amount: (item.amount || 1) + amount }
                : item,
            );
          } else {
            const newInventoryItem: InventoryItem = {
              ...productToBuy,
              boughtAt: new Date().toLocaleDateString(new Intl.Locale("ru")),
              amount: amount,
            };
            newInventory = [...inventory, newInventoryItem];
          }

          const newTotalSpentApples =
            totalSpentApples + productToBuy.price * amount;

          const newProducts =
            productToBuy.id === 3
              ? products.filter((p) => p.id !== productId)
              : products;

          set({
            inventory: newInventory,
            totalSpentApples: newTotalSpentApples,
            products: newProducts,
          });
        }
      },
    }),
    {
      name: "main-store",
      partialize: (state) => ({
        products: state.products,
        inventory: state.inventory,
        totalSpentApples: state.totalSpentApples,
      }),
    },
  ),
);
