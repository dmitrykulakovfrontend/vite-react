import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { CookiesProvider } from "react-cookie";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { SWRProvider } from "./providers/swr";
import type { Task } from "./types/Tasks";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    task?: Task;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <CookiesProvider defaultSetOptions={{ path: "/" }}>
        <SWRProvider>
          <div className="bg-[linear-gradient(150deg,#01538b00_45%,#1b688ea6_100%)] fixed top-0 left-0 w-full h-full -z-10"></div>
          <RouterProvider router={router} />
        </SWRProvider>
      </CookiesProvider>
    </StrictMode>,
  );
}
