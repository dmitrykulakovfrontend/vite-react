import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/layout/Header";
import { useEffect, useState } from "react";
import { useMainStore } from "@/providers/store";
import type { Tree } from "@/types/Tree";
import { fakeTrees } from "@/utils/mock";
import useSWR from "swr";
import { useCookies } from "react-cookie";
const userFetcher = (url: string, authToken: string) =>
  fetchUser(url, authToken);

const fetchUser = async (url: string, authToken: string) => {
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "my_profile",
    id: 1,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken,
    },
    body: JSON.stringify(jsonrpc),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const userData = await response.json();
  if (userData.error) {
    // Don't throw error if user is not logged in
    if (userData.error.code === 100) {
      return null;
    }
    throw new Error(userData.error.message);
  }
  return userData.result;
};

const RootLayout = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const setTrees = useMainStore((s) => s.setTrees);
  const setUser = useMainStore((s) => s.setUser);
  const user = useMainStore((s) => s.user);
  const [cookies] = useCookies(["auth-token"]);
  // Use SWR to fetch user data
  const { data, error } = useSWR(
    cookies["auth-token"] ? "https://hrzero.ru/api/passport/" : null,
    (url) => userFetcher(url, cookies["auth-token"]),
  );

  useEffect(() => {
    if (data) {
      setUser(data);
    }
    console.log({ user });
  }, [data, user, setUser]);

  const { data: trees } = useSWR<Tree[]>("mock/trees", fakeTrees);

  useEffect(() => {
    if (trees) setTrees(trees);
  }, [trees, setTrees]);

  // Handle loading and error states for user data
  if (error) return <div>Failed to load user.</div>;
  if (cookies["auth-token"] && !data) return <div>Loading...</div>;
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
