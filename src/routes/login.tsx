import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMainStore } from "@/providers/store";
import useSWR from "swr";
import { useCookies } from "react-cookie";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/login" });
  const { setUser } = useMainStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies(["auth-token"]);
  const { mutate } = useSWR("https://hrzero.ru/api/passport/");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "login",
      params: { email, password },
      id: 1,
    };

    try {
      const userData = await mutate(async () => {
        const response = await fetch("https://hrzero.ru/api/passport/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: cookies["auth-token"],
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
      });

      if (userData) {
        console.error(userData);
        setUser(userData.user);
        setCookie("auth-token", userData.token);
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Войти в аккаунт
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 hover:cursor-pointer text-sm font-medium text-white bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
