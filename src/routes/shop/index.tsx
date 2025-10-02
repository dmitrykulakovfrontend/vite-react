import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMainStore } from "@/providers/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { useCookies } from "react-cookie";
import { mutate } from "swr";
export const Route = createFileRoute("/shop/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { products, inventory, buyProduct, user, totalSpentApples } =
    useMainStore();
  const [cookies] = useCookies(["auth-token"]);
  const [error, setError] = useState<{
    productId: number | null;
    message: string | null;
  }>({
    productId: null,
    message: null,
  });
  const [amounts, setAmounts] = useState<Record<number, number>>({});

  const handleAmountChange = (productId: number, value: string) => {
    const amount = parseInt(value, 10);
    setAmounts((prev) => ({ ...prev, [productId]: amount }));
  };

  async function addResources() {
    if (!cookies["auth-token"]) return null;
    const jsonrpc = {
      jsonrpc: "2.0",
      method: "add_resources",
      params: {
        apples: 5,
      },
      id: 0,
    };

    const response = await fetch("https://hrzero.ru/api/app/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies["auth-token"],
      },
      body: JSON.stringify(jsonrpc),
    });
    const data = await response.json();
    if (data.error) {
      setError({
        productId: null,
        message: data.error.message,
      });
    }
    if (data.result) {
      await mutate("currentUser");
      console.log(data.result);
    }
  }
  if (user === "loading") return <Loading />;

  return (
    <div className="p-4 w-full min-h-full bg-white">
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
              {!user ? (
                <p className="flex items-center gap-1">
                  Войдите, чтобы купить товары"
                </p>
              ) : (
                <p className="flex items-center gap-1">
                  У вас: {}
                  {user.apples - totalSpentApples}
                  <img
                    src="/apple.png"
                    className="drop-shadow-md"
                    width={20}
                    height={20}
                  />
                  {user.water}
                  <img
                    src="/Water.png"
                    className="drop-shadow-md"
                    width={20}
                    height={20}
                  />
                </p>
              )}

              <Button className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                <Link
                  to="/tasks"
                  className="[&.active]:font-bold block p-1  rounded"
                >
                  Заработать
                </Link>
              </Button>
              <Button
                onClick={addResources}
                className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white"
              >
                ДЕМО: Добавить 5 яблок
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-8 my-4 max-sm:justify-center max-w-2xl">
          {products.map((product) => {
            const amount = amounts[product.id] || (product.id === 4 ? 100 : 1);
            const totalPrice = product.price * amount;

            let min = 1;
            let max = undefined;
            let step = 1;

            if (product.id === 3) {
              max = 1;
            } else if (product.id === 4) {
              min = 100;
              step = 100;
            }

            return (
              <div
                key={product.id}
                className="shadow-sm min-w-[200px] p-2 rounded flex flex-col items-center justify-between gap-2 "
              >
                <img
                  src={product.imageSrc}
                  className={` w-[100px] h-[100px] `}
                  width={100}
                  height={100}
                />
                <p>{product.name} </p>

                <Input
                  type="number"
                  value={amount}
                  min={min}
                  max={max}
                  step={step}
                  onChange={(e) =>
                    handleAmountChange(product.id, e.target.value)
                  }
                  className="w-24"
                />

                <p className="flex items-center gap-1">
                  Цена: {totalPrice}{" "}
                  <img
                    src="/apple.png"
                    className="drop-shadow-md"
                    width={20}
                    height={20}
                  />
                </p>
                {error.productId === product.id && (
                  <p className="text-red-500 max-w-[140px] text-center text-sm">
                    {error.message}
                  </p>
                )}
                {!user ? (
                  <Button
                    disabled
                    variant={"destructive"}
                    className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white"
                  >
                    Необходим аккаунт
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (user.apples - totalSpentApples >= totalPrice) {
                        buyProduct(product.id, amount, cookies["auth-token"]);
                      } else {
                        setError({
                          productId: product.id,
                          message: `Вам не хватает: ${totalPrice - (user.apples - totalSpentApples)} яблок`,
                        });
                      }
                    }}
                    className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white"
                  >
                    Купить
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <div>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-futura-heavy max-sm:text-center">
              Инвентарь (уже купленные предметы)
            </h2>
            <div className="flex flex-wrap gap-8 mb-4 max-sm:justify-center max-w-2xl">
              {inventory.map((product) => (
                <div
                  key={product.id + Math.random()}
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
                      {/* {product.imageSrc} */}
                    </div>
                  )}

                  <p>
                    {product.name}{" "}
                    {product.amount && <span>x{product.amount}</span>}
                  </p>
                  <p className="flex flex-col items-center">
                    <span>Дата покупки:</span> {product.boughtAt}
                  </p>
                  <p className="flex items-center gap-1">
                    Цена: {product.price}{" "}
                    <img
                      src="/apple.png"
                      className="drop-shadow-md"
                      width={20}
                      height={20}
                    />
                  </p>
                  <Button className=" max-w-[200px]  hover:bg-blue-500  bg-blue-primary w-full hover:cursor-pointer font-futura-heavy rounded-full p-2 text-white">
                    <Link
                      to={"/profile/" + user?.id}
                      className="[&.active]:font-bold block p-1 rounded"
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
