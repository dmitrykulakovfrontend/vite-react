import { mutate } from "swr";
import { ForestView, type TreeHandle } from "../ForestView";
import { Button } from "../ui/button";
import { useCookies } from "react-cookie";
import { useEffect, useRef, useState } from "react";
import type { UserTree } from "@/types/Tree";
import { Link } from "@tanstack/react-router";
import MapTreeData from "@/utils/mapApiResponse";
import { useMainStore } from "@/providers/store";
function TreeTab({
  tree,
  isTreeLoading,
}: {
  tree: UserTree | undefined | null;
  isTreeLoading: boolean;
}) {
  const [cookies] = useCookies(["auth-token"]);
  const { user } = useMainStore();
  const [error, setError] = useState<string | null>(null);
  const treeRef = useRef<TreeHandle>(null);
  useEffect(() => {
    if (treeRef.current && tree) {
      treeRef.current.update(
        [MapTreeData(tree)],
        isTreeLoading,
        MapTreeData(tree),
      );
    } else {
      treeRef.current?.update([], isTreeLoading, null);
    }
  }, [tree, isTreeLoading]);
  async function plantTree() {
    if (!cookies["auth-token"]) return null;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "plant_tree",
      params: {},
      id: 1,
    };

    const response = await fetch("https://hrzero.ru/api/app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies["auth-token"],
      },
      body: JSON.stringify(jsonrpc),
    });
    const data = await response.json();
    if (data.error) {
      setError(data.error.message);
    }
    if (treeRef.current && data.result) {
      await mutate("userTree");
      console.log(data.result);
    }
  }
  async function waterTree() {
    if (!cookies["auth-token"]) return null;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "water_tree",
      params: {},
      id: 1,
    };

    const response = await fetch("https://hrzero.ru/api/app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies["auth-token"],
      },
      body: JSON.stringify(jsonrpc),
    });
    const data = await response.json();
    if (data.error) {
      setError(data.error.message);
    }
    if (treeRef.current && data.result) {
      await mutate("userTree");
      console.log(data.result);
    }
  }

  return (
    <div className="p-4  bg-white rounded-4xl h-full text-black w-full flex flex-col justify-start items-center gap-4">
      {error && (
        <p className="text-red-500 mt-2 max-w-2xs text-center">{error}</p>
      )}
      {!isTreeLoading && tree ? (
        <div className="flex items-start justify-center gap-4 max-sm:flex-col">
          <div>
            <div className="w-[200px] h-[200px]">
              <ForestView
                ref={treeRef}
                trees={[MapTreeData(tree)]}
                isLoading={isTreeLoading}
                currentUserTree={MapTreeData(tree)}
                isMainTree
              />
            </div>
            {typeof user === "object" && tree && user?.id === tree.user.id && (
              <Button
                onClick={waterTree}
                className=" w-full  hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-md p-2 text-white mt-2"
              >
                Полить
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-futura-heavy">
              Дата посадки:{" "}
              <span className="font-futura-book text-blue-light">
                {new Date(tree.planted_at).toLocaleDateString(
                  new Intl.Locale("ru"),
                )}
              </span>
            </p>
            <p className="font-futura-heavy">
              Дней роста:{" "}
              <span className="font-futura-book text-blue-light">
                {tree.age}
              </span>
            </p>
            <p className="font-futura-heavy">
              Сила:{" "}
              <span className="font-futura-book text-blue-light">
                {tree.vitality_percent}
              </span>
            </p>
            <p className="font-futura-heavy">
              Вода:{" "}
              <span className="font-futura-book text-blue-light">
                {tree.water}
              </span>
            </p>
            <p className="font-futura-heavy">
              Яблок всего:{" "}
              <span className="font-futura-book text-blue-light">
                {tree.total_apples}
              </span>
            </p>
            <p className="font-futura-heavy">
              Яблок в наличии:{" "}
              <span className="font-futura-book text-blue-light">
                {tree.apples}
              </span>
            </p>
            <p className="">
              До следующего полива:{" "}
              <span className="font-futura-book text-blue-light">
                {tree.water_after} дней
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-[300px] h-[300px]">
            <ForestView
              isMainTree
              trees={[]}
              ref={treeRef}
              isLoading={isTreeLoading}
            />
          </div>
          <p>Вы еще не посадили дерево</p>
          {typeof user === "object" && tree && user?.id === tree.user.id && (
            <Button
              onClick={plantTree}
              className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-fit hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white mt-4"
            >
              Посадить дерево
            </Button>
          )}
        </div>
      )}
      <Button className="max-sm:w-full sm:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-fit hover:cursor-pointer font-futura-heavy rounded-md p-2 text-white mx-auto">
        <Link to="/forest" className="[&.active]:font-bold block p-1  rounded">
          Посетить лес
        </Link>
      </Button>
    </div>
  );
}
export default TreeTab;
