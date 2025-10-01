import { useMainStore } from "@/providers/store";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCookies } from "react-cookie";
import { Bell } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useSWR from "swr";
import Loading from "../Loading";
import type { UserNotification } from "@/types/User";

const fetchNotificationsCount = async (authToken: string) => {
  if (!authToken) return null;
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_unread_notifications_count",
    id: 1,
  };

  const response = await fetch("https://hrzero.ru/api/notifications/", {
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
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
};
async function fetchNotifications(authToken: string) {
  if (!authToken) return null;
  const jsonrpc = {
    jsonrpc: "2.0",
    method: "get_user_notifications",
    id: 1,
  };

  const response = await fetch("https://hrzero.ru/api/notifications/", {
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
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
}
const Header = ({
  isMenuOpen,
  setMenuOpen,
}: {
  isMenuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [cookies, setCookies] = useCookies(["auth-token"]);

  const { data: notificationsCount } = useSWR("userNotificationsCount", () =>
    fetchNotificationsCount(cookies["auth-token"]),
  );
  const setUser = useMainStore((s) => s.setUser);
  const user = useMainStore((s) => s.user);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  async function markAllNotificationsAsRead(authToken: string) {
    if (!authToken) return null;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "mark_notifications_as_read",
      id: 1,
    };
    const response = await fetch("https://hrzero.ru/api/notifications/", {
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
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  }
  const [notifications, setNotifications] = useState<UserNotification[] | null>(
    null,
  );

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const logout = () => {
    setCookies("auth-token", "", { path: "/" });
    setUser(null);
    navigate({ to: "/" });
  };

  async function handleFetchNotifications() {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const result = await fetchNotifications(cookies["auth-token"]);
      setNotifications(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNotifError(err.message || "Ошибка загрузки уведомлений");
      } else {
        setNotifError("Ошибка загрузки уведомлений");
      }
      setNotifications(null);
    } finally {
      setNotifLoading(false);
    }
  }
  const links = [
    { to: "/", label: "Главная" },
    { to: "/tasks", label: "Задачи" },
    { to: "/shop", label: "Магазин" },
    { to: "/forest", label: "Лес" },
  ];
  if (user && user !== "loading") {
    links.push({ to: "/profile/" + user.id, label: "Профиль" });
  }
  if (
    user &&
    user !== "loading" &&
    user.scopes &&
    user.scopes.includes("app.admin.view")
  ) {
    links.push({ to: "/admin", label: "Админка" });
  }
  console.log({ notifications });
  return (
    <header
      className={`sticky ${isMenuOpen ? "flex-col items-start" : ""} top-0 left-0 z-50 flex items-center justify-between w-full p-2 bg-[#00285e]  text-white`}
    >
      <div
        className={`max-md:flex max-md:items-center max-md:justify-between max-md:w-full max-md:gap-4`}
      >
        <Link to="/" className="[&.active]:font-bold shrink-0">
          <img
            src={"/logo_white_small.png"}
            width="150"
            height="30"
            alt="Логотип компании"
          />
        </Link>

        <button
          className="p-2 text-4xl rounded hover:cursor-pointer md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>

      <ul
        className={`flex flex-col md:flex-row gap-2 md:gap-4  md:static  w-full md:w-auto  p-2 md:p-0 transition-all ${
          isMenuOpen ? "block" : "hidden md:flex"
        }`}
      >
        <li>
          {user !== "loading" && user && isMenuOpen ? (
            <div className="flex items-center gap-2">
              <img
                src={user.avatar_url}
                width={40}
                height={40}
                className="rounded-full"
              />
              <p>{user.metadata.name}</p>
              <Drawer
                open={openNotifications}
                onOpenChange={setOpenNotifications}
              >
                <DrawerTrigger onClick={handleFetchNotifications} asChild>
                  <div className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm ml-auto ">
                    <div className=" relative h-5 w-4">
                      <Bell className="w-full h-full text-white" />
                      {notificationsCount > 0 ? (
                        <span className="w-4 h-4 aspect-square flex justify-center items-center text-center text-xs bg-red-500 text-white rounded-full z-[60] absolute -bottom-3 -right-3">
                          {notificationsCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <DrawerTitle>Уведомления</DrawerTitle>
                  </DrawerHeader>
                  <div>
                    {notifLoading && <Loading />}
                    {notifError && (
                      <div className="text-red-500">{notifError}</div>
                    )}
                    {!notifLoading &&
                      !notifError &&
                      notifications?.length === 0 && <div>Нет уведомлений</div>}
                    {!notifLoading &&
                      !notifError &&
                      (notifications?.length ?? 0) > 0 && (
                        <div className="flex flex-col gap-2">
                          <button
                            className="mb-2 self-end px-4 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition"
                            onClick={async () => {
                              try {
                                await markAllNotificationsAsRead(
                                  cookies["auth-token"],
                                );
                                // Optionally refetch notifications after marking as read
                                handleFetchNotifications();
                              } catch {
                                setNotifError(
                                  "Ошибка при отметке уведомлений как прочитанных",
                                );
                              }
                            }}
                          >
                            Прочитать все
                          </button>
                          {notifications?.map((notification, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded shadow border flex flex-col gap-1 transition-all ${
                                notification.is_read
                                  ? "bg-gray-100 border-gray-300 text-gray-500 opacity-70"
                                  : "bg-white border-blue-400 text-black"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm">
                                  Уведомление
                                </span>
                                {!notification.is_read && (
                                  <span className="inline-block px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                                    Непрочитано
                                  </span>
                                )}
                              </div>
                              <div className="text-xs mt-1">
                                {notification.message}
                              </div>
                              <div className="text-right text-[10px] text-gray-400 mt-1">
                                {notification.created_at
                                  ? new Date(
                                      notification.created_at,
                                    ).toLocaleString("ru")
                                  : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                      <Button variant="outline">Закрыть</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
              <Link
                to="/"
                onClick={logout}
                className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
              >
                Выйти
              </Link>
            </div>
          ) : isMenuOpen ? (
            <div className="hidden gap-2 md:flex">
              <Link
                to="/login"
                className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
              >
                Войти
              </Link>
              <Link
                to="/signup"
                className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
              >
                Зарегистрироваться
              </Link>
            </div>
          ) : null}
        </li>
        {links.map((link) => {
          if (link.to === "/admin") {
            return (
              <li key={link.to}>
                <Button
                  onClick={() => (window.location.href = "/admin")}
                  className="block py-2 h-full bg-transparent text-white font-futura-heavy hover:opacity-90 hover:cursor-pointer text-base m-0 px-0"
                >
                  {link.label}
                </Button>
              </li>
            );
          }
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="[&.active]:font-bold block py-2 h-full font-futura-heavy hover:opacity-90 hover:cursor-pointer"
                activeProps={{
                  className:
                    "md:border-b-4 max-md:border-l-4 pl-2 md:pl-0 border-white border-solid",
                }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="max-md:hidden">
        {user !== "loading" && user ? (
          <div className="flex items-center gap-2">
            <img
              src={user.avatar_url}
              width={40}
              height={40}
              className="rounded-full"
            />
            <p>{user.metadata.name}</p>
            {isDesktop && (
              <Popover>
                <PopoverTrigger onClick={handleFetchNotifications}>
                  <div className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm">
                    <div className=" relative h-5 w-4">
                      <Bell className="w-full h-full text-white" />
                      {notificationsCount > 0 ? (
                        <span className="w-4 h-4 aspect-square flex justify-center items-center text-center text-xs bg-red-500 text-white rounded-full z-[60] absolute -bottom-3 -right-3">
                          {notificationsCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  {notifLoading && <Loading />}
                  {notifError && (
                    <div className="text-red-500">{notifError}</div>
                  )}
                  {!notifLoading &&
                    !notifError &&
                    notifications?.length === 0 && <div>Нет уведомлений</div>}
                  {!notifLoading &&
                    !notifError &&
                    (notifications?.length ?? 0) > 0 && (
                      <div className="flex flex-col gap-2">
                        <button
                          className="mb-2 self-end px-4 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition"
                          onClick={async () => {
                            try {
                              await markAllNotificationsAsRead(
                                cookies["auth-token"],
                              );
                              // Optionally refetch notifications after marking as read
                              handleFetchNotifications();
                            } catch {
                              setNotifError(
                                "Ошибка при отметке уведомлений как прочитанных",
                              );
                            }
                          }}
                        >
                          Прочитать все
                        </button>
                        {notifications?.map((notification, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded shadow border flex flex-col gap-1 transition-all ${
                              notification.is_read
                                ? "bg-gray-100 border-gray-300 text-gray-500 opacity-70"
                                : "bg-white border-blue-400 text-black"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm">
                                Уведомление
                              </span>
                              {!notification.is_read ? (
                                <span className="inline-block px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                                  Непрочитано
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 border-gray-300 text-gray-500 opacity-70 rounded-full">
                                  Прочитано
                                </span>
                              )}
                            </div>
                            <div className="text-xs mt-1">
                              {notification.message}
                            </div>
                            <div className="text-right text-[10px] text-gray-400 mt-1">
                              {notification.created_at
                                ? new Date(
                                    notification.created_at,
                                  ).toLocaleString("ru")
                                : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </PopoverContent>
              </Popover>
            )}

            <Link
              to="/"
              onClick={logout}
              className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
            >
              Выйти
            </Link>
          </div>
        ) : (
          <div className="hidden gap-2 md:flex">
            <Link
              to="/login"
              className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
            >
              Войти
            </Link>
            <Link
              to="/signup"
              className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
            >
              Зарегистрироваться
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
