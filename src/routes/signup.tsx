import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { mutate } from "swr";
import { useCookies } from "react-cookie";
import { useMainStore } from "@/providers/store";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/signup" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [, setCookie] = useCookies(["auth-token"]);
  const { setUser } = useMainStore();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Введите имя";
    else if (name.trim().length < 2) newErrors.name = "Имя слишком короткое";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = "Введите почту";
    else if (!emailRegex.test(email))
      newErrors.email = "Некорректный формат почты";

    if (!password) newErrors.password = "Введите пароль";
    else if (password.length < 4) newErrors.password = "Минимум 4 символов";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    const jsonrpcSignUp = {
      jsonrpc: "2.0",
      method: "signup",
      params: { email, password, metadata: { name } },
      id: 1,
    };

    try {
      const data = await mutate(
        "https://hrzero.ru/api/passport/",
        async () => {
          const response = await fetch("https://hrzero.ru/api/passport/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonrpcSignUp),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);

          const profileResponse = await fetch("https://hrzero.ru/api/app/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: data.result,
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "get_user",
              id: 1,
            }),
          });
          if (!profileResponse.ok)
            throw new Error("Не удалось загрузить профиль");
          const userData = await profileResponse.json();
          if (userData.error && userData.error.code !== 100) {
            throw new Error(userData.error.message);
          }
          return { token: data.result, user: userData.result };
        },
        {},
      );

      if (data) {
        setCookie("auth-token", data.token);
        setUser(data.user);
        navigate({ to: "/profile/" + data.user.id });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Ошибка регистрации");
      }
    }
  };

  const inputClass =
    "w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Создать новый аккаунт
        </h2>
        <form
          className="space-y-6 text-black"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Имя
            </label>
            <input
              id="name"
              type="text"
              className={`${inputClass} ${errors.name ? "border-red-500" : "border-gray-300"}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Почта
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`${inputClass} ${errors.email ? "border-red-500" : "border-gray-300"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
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
              type="password"
              className={`${inputClass} ${errors.password ? "border-red-500" : "border-gray-300"}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {apiError && <p className="text-red-600 text-center">{apiError}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] rounded-md shadow-sm hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:#347df4"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}
