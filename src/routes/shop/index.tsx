import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/")({
  component: RouteComponent,
});

function RouteComponent() {
  const products = [
    {
      id: 1,
      name: "Футболка с логотипом",
      price: 25,
      imageSrc: "merch1.png",
    },
    {
      id: 2,
      name: "Фирменный убор Алабуги",
      price: 50,
      imageSrc: "merch2.png",
    },
    {
      id: 3,
      name: "Саженец",
      price: 5,
      amount: 1,
      imageSrc: "/image.png",
    },
    {
      id: 4,
      name: "Вода",
      price: 5,
      amount: 100,
      imageSrc: "Water.png",
    },
  ];
  const inventory = [
    {
      id: 3,
      name: "Саженец",
      price: 5,
      amount: 1,
      imageSrc: "/image.png",
      date: "21.09.2025",
    },
    {
      id: 4,
      name: "Вода",
      amount: 100,
      price: 5,
      imageSrc: "Water.png",
      date: "21.09.2025",
    },
  ];
  return (
    <div className="p-4 w-full h-full bg-white">
      <div className="bg-white w-fit mx-auto text-black p-4 rounded-md">
        <div>
          <div className="flex items-center gap-8 justify-between max-sm:flex-col ">
            <div className="max-w-3xs max-sm:text-center">
              <h1 className="text-2xl font-futura-heavy mb-2">Магазин</h1>
              <p className="mb-2">
                Здесь вы можете приобрести различные товары за яблоки.
              </p>
              <p>Количество товаров: {products.length}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="flex items-center gap-1">
                У вас: 10
                <img
                  src="apple.png"
                  className="drop-shadow-md"
                  width={20}
                  height={20}
                />
              </p>
              <Button className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                <Link
                  to="/tasks"
                  className="[&.active]:font-bold block p-1  rounded"
                >
                  Заработать
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-8 my-4 max-sm:justify-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="shadow-sm min-w-[200px] p-2 rounded flex flex-col items-center justify-between gap-2"
            >
              {typeof product.imageSrc === "string" ? (
                <img
                  src={product.imageSrc}
                  className={` w-[100px] h-[100px] `}
                  width={100}
                  height={100}
                />
              ) : (
                <div className={` w-[100px] h-[100px] `}>
                  {product.imageSrc}
                </div>
              )}
              <p>
                {product.name}{" "}
                {product.amount && <span>x{product.amount}</span>}
              </p>

              <p className="flex items-center gap-1">
                Цена: {product.price}{" "}
                <img
                  src="apple.png"
                  className="drop-shadow-md"
                  width={20}
                  height={20}
                />
              </p>
              <Button className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                Купить
              </Button>
            </div>
          ))}
        </div>
        <div>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-futura-heavy">
              Инвентарь (уже купленные предметы)
            </h2>
            <div className="flex flex-wrap gap-8 mb-4 max-sm:justify-center">
              {inventory.map((product) => (
                <div
                  key={product.id}
                  className="shadow-sm min-w-[200px] p-2 rounded flex flex-col items-center justify-between gap-2"
                >
                  {typeof product.imageSrc === "string" ? (
                    <img
                      src={product.imageSrc}
                      className={` w-[100px] h-[100px] `}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <div className={` w-[100px] h-[100px]`}>
                      {product.imageSrc}
                    </div>
                  )}

                  <p>
                    {product.name}{" "}
                    {product.amount && <span>x{product.amount}</span>}
                  </p>
                  <p className="flex flex-col items-center">
                    <span>Дата покупки:</span> {product.date}
                  </p>
                  <p className="flex items-center gap-1">
                    Цена: {product.price}{" "}
                    <img
                      src="apple.png"
                      className="drop-shadow-md"
                      width={20}
                      height={20}
                    />
                  </p>
                  <Button className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                    <Link
                      to="/profile"
                      className="[&.active]:font-bold block p-1  rounded"
                    >
                      Использовать
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
