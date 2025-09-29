import { useMainStore } from "@/providers/store";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCookies } from "react-cookie";

const Header = ({
  isMenuOpen,
  setMenuOpen,
}: {
  isMenuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const setUser = useMainStore((s) => s.setUser);
  const user = useMainStore((s) => s.user);
  const [, setCookies] = useCookies(["auth-token"]);
  const navigate = useNavigate();
  const logout = () => {
    setCookies("auth-token", "", { path: "/" });
    setUser(null);
    navigate({ to: "/" });
  };
  const links = [
    { to: "/", label: "Главная" },
    { to: "/tasks", label: "Задачи" },
    { to: "/shop", label: "Магазин" },
    { to: "/forest", label: "Лес" },
  ];
  if (user) {
    links.push({ to: "/Profile", label: "Профиль" });
  }
  if (
    user &&
    user !== "loading" &&
    user.scopes &&
    user.scopes.includes("app.admin.view")
  ) {
    links.push({ to: "/admin", label: "Админка" });
  }
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
              <Link
                to="/"
                onClick={logout}
                className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] ml-auto hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
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
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              onClick={
                link.to === "/admin"
                  ? () => (window.location.href = "https://hrzero.ru/admin/")
                  : () => setMenuOpen(false)
              }
              className="[&.active]:font-bold block py-2 h-full font-futura-heavy hover:opacity-90 hover:cursor-pointer"
              activeProps={{
                className:
                  "md:border-b-4 max-md:border-l-4 pl-2 md:pl-0 border-white border-solid",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
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
