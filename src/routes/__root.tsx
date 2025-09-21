import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/layout/Header";
import { useEffect, useState } from "react";
import { useMainStore } from "@/providers/store";
import type { Tree } from "@/types/Tree";
import { fakeTrees } from "@/utils/mock";
import useSWR from "swr";

const RootLayout = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const setTrees = useMainStore((s) => s.setTrees);
  // const user = useMainStore((s) => s.user);

  // fetch once here
  const { data } = useSWR<Tree[]>("mock/trees", fakeTrees);

  useEffect(() => {
    if (data) setTrees(data);
  }, [data, setTrees]);

  return (
    <>
      <Header isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} />
      <div
        className={`${isMenuOpen ? "pt-72" : "pt-16"} sm:pt-16 text-white h-full`}
      >
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
