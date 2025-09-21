import { Link } from "@tanstack/react-router";

const Header = ({
  isMenuOpen,
  setMenuOpen,
}: {
  isMenuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const links = [
    { to: "/", label: "Главная" },
    { to: "/tasks", label: "Задачи" },
    { to: "/tree", label: "Профиль" },
    { to: "/forest", label: "Лес" },
  ];
  return (
    <header className="fixed top-0 left-0 z-50 flex items-center justify-between w-full p-2 bg-transparent text-white">
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
        className={`flex flex-col sm:flex-row gap-2 sm:gap-4 absolute sm:static top-full left-0 w-full sm:w-auto bg-white sm:bg-transparent p-2 sm:p-0 transition-all ${
          isMenuOpen ? "block" : "hidden sm:flex"
        }`}
      >
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="[&.active]:font-bold block py-2 h-full font-futura-heavy hover:opacity-90 hover:cursor-pointer"
              activeProps={{
                className: "border-b-4 border-white border-solid",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

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
    </header>
  );
};

export default Header;
