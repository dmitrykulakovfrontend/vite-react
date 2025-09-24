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
    { to: "/tree", label: "Профиль" },
    { to: "/shop", label: "Магазин" },
    { to: "/forest", label: "Лес" },
  ];
  return (
    <header className="fixed top-0 left-0 z-50 flex items-center justify-between w-full p-2 bg-[#00285e]  text-white">
      <Link to="/" className="[&.active]:font-bold shrink-0">
        <img
          src={"/logo_white_small.png"}
          width="150"
          height="30"
          alt="Логотип компании"
        />
      </Link>

      <button
        className="p-2 rounded cursor-pointer sm:hidden hover:bg-gray-100"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        ☰
      </button>

      <ul
        className={`flex flex-col sm:flex-row gap-2 sm:gap-4 absolute sm:static top-full left-0 w-full sm:w-auto bg-transparent sm:bg-transparent p-2 sm:p-0 transition-all ${
          isMenuOpen ? "block" : "hidden sm:flex"
        }`}
      >
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="[&.active]:font-bold block py-2 h-full font-futura-heavy hover:opacity-90 hover:cursor-pointer"
              activeProps={{
                className:
                  "sm:border-b-4 max-sm:border-l-4 pl-2 sm:pl-0 border-white border-solid",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {user ? (
        <div className="flex items-center gap-2">
          <p>{user.metadata.name}</p>
          <img
            src={user.avatar_url}
            width={40}
            height={40}
            className="rounded-full"
          />
          <Link
            to="/"
            onClick={logout}
            className="bg-[linear-gradient(to_bottom,#3faaeb,#347df4)] hover:cursor-pointer rounded px-3 py-2 text-white text-sm"
          >
            Выйти
          </Link>
        </div>
      ) : (
        <div className="hidden gap-2 sm:flex">
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
    </header>
  );
};

export default Header;
