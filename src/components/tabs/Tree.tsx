import useSWR, { mutate } from "swr";
import { ForestView, type TreeHandle } from "../ForestView";
import { Button } from "../ui/button";
import { useCookies } from "react-cookie";
import { useEffect, useRef, useState } from "react";
import type { Tree, UserTree } from "@/types/Tree";
import { Link } from "@tanstack/react-router";
function generateSeedFromString(str: string): number {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // This formula combines the existing hash with the new character code.
    // The bitwise left shift (<< 5) is a fast way to multiply and mix the values.
    hash = (hash << 5) - hash + char;
    // This converts the result to a 32-bit signed integer to keep the number
    // from growing too large.
    hash |= 0;
  }
  // Return the absolute value to ensure the seed is always positive.
  return Math.abs(hash);
}
function MapTreeData(data: UserTree): Tree {
  const daysSinceWatered = data.days_since_watering;

  const gracePeriodDays = 7;
  // You can still adjust this value to change how fast trees wither.
  const decayRatePerDay = 0.2;

  let decayProgress = 0;

  // If the tree is overdue for water, calculate the decay.
  if (daysSinceWatered > gracePeriodDays) {
    const daysOverdue = daysSinceWatered - gracePeriodDays;
    decayProgress = daysOverdue * decayRatePerDay;
  }

  // Cap the decay at the maximum value of 2.
  const finalDecayProgress = Math.min(decayProgress, 2);
  return {
    seed: generateSeedFromString(data.user.metadata.name),
    container: null as unknown as HTMLDivElement,
    decayProgress: finalDecayProgress,
    timesWatered: data.vitality_percent / 5,
    apples: data.apples,
  };
}

function TreeTab() {
  const fetchUserTree = async (jwt: string) => {
    if (!jwt) return null;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "get_my_tree",
      params: {},
      id: 1,
    };

    const response = await fetch("https://hrzero.ru/api/app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(jsonrpc),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  };
  const [cookies] = useCookies(["auth-token"]);
  const [error, setError] = useState<string | null>(null);
  const treeRef = useRef<TreeHandle>(null);
  const { data, isLoading } = useSWR<UserTree | null>("userTree", () =>
    fetchUserTree(cookies["auth-token"]),
  );
  useEffect(() => {
    if (treeRef.current && data) {
      treeRef.current.update([MapTreeData(data)], isLoading, MapTreeData(data));
    } else {
      treeRef.current?.update([], isLoading, null);
    }
  }, [data, isLoading]);
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
      {!isLoading && data ? (
        <div className="flex items-start justify-center gap-4 max-sm:flex-col">
          <div>
            <div className="w-[200px] h-[200px]">
              <ForestView
                ref={treeRef}
                trees={[MapTreeData(data)]}
                isLoading={isLoading}
                currentUserTree={MapTreeData(data)}
                isMainTree
              />
            </div>
            <Button
              onClick={waterTree}
              className=" w-full  hover:bg-blue-500  bg-blue-primary hover:cursor-pointer font-futura-heavy rounded-md p-2 text-white mt-2"
            >
              Полить
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-futura-heavy">
              Дата посадки:{" "}
              <span className="font-futura-book text-blue-light">
                {new Date(data.planted_at).toLocaleDateString(
                  new Intl.Locale("ru"),
                )}
              </span>
            </p>
            <p className="font-futura-heavy">
              Дней роста:{" "}
              <span className="font-futura-book text-blue-light">
                {data.age}
              </span>
            </p>
            <p className="font-futura-heavy">
              Сила:{" "}
              <span className="font-futura-book text-blue-light">
                {data.vitality_percent}
              </span>
            </p>
            <p className="font-futura-heavy">
              Вода:{" "}
              <span className="font-futura-book text-blue-light">
                {data.water}
              </span>
            </p>
            <p className="font-futura-heavy">
              Яблок всего:{" "}
              <span className="font-futura-book text-blue-light">
                {data.total_apples}
              </span>
            </p>
            <p className="font-futura-heavy">
              Яблок в наличии:{" "}
              <span className="font-futura-book text-blue-light">
                {data.apples}
              </span>
            </p>
            <p className="">
              До следующего полива:{" "}
              <span className="font-futura-book text-blue-light">
                {data.water_after} дней
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
              isLoading={isLoading}
            />
          </div>
          <p>Вы еще не посадили дерево</p>
          <Button
            onClick={plantTree}
            className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-fit hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white mt-4"
          >
            Посадить дерево
          </Button>
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
