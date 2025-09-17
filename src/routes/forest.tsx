import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import useSWR from "swr";

export const Route = createFileRoute("/forest")({
  component: Forest,
});

function Forest() {
  const { data } = useSWR("https://pokeapi.co/api/v2/pokemon/ditto", {
    refreshInterval: 3000,
  });
  useEffect(() => {
    const timer = setInterval(() => console.log(data), 3000);
    console.log({ data });
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <pre className="border shadow-md m-4 max-w-2xl h-[300px] overflow-scroll">
      <code className="">{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}
