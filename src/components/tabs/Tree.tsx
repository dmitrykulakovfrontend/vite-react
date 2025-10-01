import { mutate } from "swr";
import { ForestView, type TreeHandle } from "../ForestView";
import { Button } from "../ui/button";
import { useCookies } from "react-cookie";
import { useEffect, useRef, useState } from "react";
import type { UserTree } from "@/types/Tree";
import { Link } from "@tanstack/react-router";
import MapTreeData from "@/utils/mapApiResponse";
import Loading from "../Loading";
function TreeTab({
  tree,
  isTreeLoading,
  isCurrentUserPage,
}: {
  tree: UserTree | undefined | null;
  isTreeLoading: boolean;
  isCurrentUserPage: boolean;
}) {
  const [cookies] = useCookies(["auth-token"]);
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
      await mutate("userTree" + tree?.user.id);
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
      await mutate("userTree" + tree?.user.id);
      console.log(data.result);
    }
  }

  if (isTreeLoading) return <Loading />;

  return (
    <div className="p-4  bg-white rounded-4xl h-full text-black w-full flex flex-col justify-start items-center gap-4">
      <div className="w-fit max-sm:flex max-sm:flex-col max-sm:items-center max-sm:justify-center">
        {error && (
          <p className="text-red-500 mt-2 max-w-2xs text-center">{error}</p>
        )}
        {tree ? (
          <div className="flex items-start justify-center gap-4 max-sm:flex-col max-sm:items-center">
            <div className="max-sm:flex max-sm:flex-col max-sm:items-center max-sm:justify-center">
              <div className="w-[200px] h-[200px]">
                <ForestView
                  ref={treeRef}
                  trees={tree ? [MapTreeData(tree)] : []}
                  isLoading={isTreeLoading}
                  currentUserTree={tree ? MapTreeData(tree) : undefined}
                  isMainTree
                />
              </div>
              {isCurrentUserPage && tree && (
                <Button
                  onClick={waterTree}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white mt-2 "
                >
                  Полить
                </Button>
              )}
              {isCurrentUserPage && tree && (
                <Button
                  onClick={waterTree}
                  className="max-w-[200px] max-lg:max-w-[150px] whitespace-normal break-words hover:bg-blue-500 bg-blue-primary w-full hover:cursor-pointer font-futura-heavy p-2 h-fit rounded-sm text-white mt-2"
                >
                  ДЕМО: Пропустить 7 дней и получить 10л. воды для полива
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {tree && (
                <p className="font-futura-heavy">
                  Дата посадки:{" "}
                  <span className="font-futura-book text-blue-light">
                    {new Date(tree.planted_at).toLocaleDateString(
                      new Intl.Locale("ru"),
                    )}
                  </span>
                </p>
              )}
              {tree && (
                <p className="font-futura-heavy">
                  Дней роста:{" "}
                  <span className="font-futura-book text-blue-light">
                    {tree.age}
                  </span>
                </p>
              )}
              {tree && (
                <p className="font-futura-heavy">
                  Сила:{" "}
                  <span className="font-futura-book text-blue-light">
                    {tree.vitality_percent}
                  </span>
                </p>
              )}
              <p className="font-futura-heavy">
                Вода:{" "}
                <span className="font-futura-book text-blue-light">
                  {tree?.water || 0}
                </span>
              </p>
              {tree && (
                <p className="font-futura-heavy">
                  Яблок всего:{" "}
                  <span className="font-futura-book text-blue-light">
                    {tree.total_apples}
                  </span>
                </p>
              )}
              <p className="font-futura-heavy">
                Яблок в наличии:{" "}
                <span className="font-futura-book text-blue-light">
                  {tree?.apples || 0}
                </span>
              </p>
              {tree && (
                <p className="">
                  До следующего полива:{" "}
                  <span className="font-futura-book text-blue-light">
                    {tree.water_after} дней
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-center gap-4 max-sm:flex-col">
            <div>
              <div className="w-[200px] h-[200px]">
                <ForestView
                  ref={treeRef}
                  trees={tree ? [MapTreeData(tree)] : []}
                  isLoading={isTreeLoading}
                  currentUserTree={tree ? MapTreeData(tree) : undefined}
                  isMainTree
                />
              </div>
              {isCurrentUserPage ? (
                <p>Вы еще не посадили дерево</p>
              ) : (
                <p>Этот пользователь еще не посадил дерево</p>
              )}
              <div className="flex justify-center gap-2 flex-col">
                {isCurrentUserPage && (
                  <Button
                    onClick={plantTree}
                    className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white mt-2"
                  >
                    Посадить дерево
                  </Button>
                )}
                {isCurrentUserPage && !tree && (
                  <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                    <Link
                      to={"/tasks"}
                      className="[&.active]:font-bold block p-1  rounded"
                    >
                      Заработать на саженец
                    </Link>
                  </Button>
                )}
              </div>
              {isCurrentUserPage && tree && (
                <Button
                  onClick={waterTree}
                  className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white mt-2"
                >
                  Полить
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-futura-heavy">
                Вода:{" "}
                <span className="font-futura-book text-blue-light">0</span>
              </p>
              <p className="font-futura-heavy">
                Яблок в наличии:{" "}
                <span className="font-futura-book text-blue-light">0</span>
              </p>
            </div>
          </div>
        )}
        <Button className=" max-w-[200px] max-lg:max-w-[150px] hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white mt-2">
          <Link
            to="/forest"
            className="[&.active]:font-bold block p-1  rounded"
          >
            Посетить лес
          </Link>
        </Button>
      </div>
    </div>
  );
}
export default TreeTab;
