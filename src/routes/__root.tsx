import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/layout/Header";
import { useState } from "react";

const RootLayout = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Header isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} />
      <div className={`${isMenuOpen ? "mt-72" : "mt-16"} sm:mt-16 text-white`}>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
