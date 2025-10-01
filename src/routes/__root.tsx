import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/layout/Header";
import { useEffect, useState } from "react";
import { useMainStore } from "@/providers/store";
import type { Tree } from "@/types/Tree";
import { fakeTrees } from "@/utils/mock";
import useSWR from "swr";
import { useCookies } from "react-cookie";
const userFetcher = (authToken: string) => fetchUser(authToken);

const fetchUser = async (authToken: string) => {
  if (!authToken) return null;
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "my_profile",
    id: 1,
  };

  const response = await fetch("https://hrzero.ru/api/passport/", {
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
  const { setTrees, setUser, user } = useMainStore();
  const [cookies] = useCookies(["auth-token"]);
  const {
    data: currentUser,
    error: currentUserError,
    isLoading: currentUserIsLoading,
  } = useSWR("currentUser", () => userFetcher(cookies["auth-token"]), {
    // revalidateOnMount: false,
    revalidateOnFocus: false,
    // revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (currentUserIsLoading) {
      setUser("loading");
    } else if (!currentUserIsLoading && currentUser !== undefined) {
      setUser(currentUser);
    } else if (!currentUserIsLoading && currentUser === undefined) {
      setUser(null);
    }
  }, [currentUser, setUser, currentUserIsLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  console.log({ user });

  const { data: trees } = useSWR<Tree[]>("mock/trees", fakeTrees, {
    // revalidateOnMount: false,
    // revalidateOnFocus: false,
    // revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (trees) setTrees(trees);
  }, [trees, setTrees]);

  // Handle loading and error states for user data
  if (currentUserError) console.log(currentUserError);
  if (currentUserIsLoading) return <div>Loading...</div>;
  return (
    <>
      <Header isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} />
      <div className={` text-white h-full`}>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
};
export const Route = createRootRoute({ component: RootLayout });
