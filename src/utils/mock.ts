import type { Planet, Tree } from "@/types/Tree";
export const planetsArray: Planet[] = ["Земля", "Юпитер", "Марс"];

export async function fakeTrees(): Promise<Tree[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          new Array(30000).fill(1).map(() => {
            const size = Math.round(Math.random() * 16) + 4;
            return {
              seed: Math.random() * 100000,
              container: null as unknown as HTMLDivElement,
              decayProgress: Math.pow(Math.random(), 12) * 2,
              timesWatered: size,
              apples: Math.round(size / 2) + Math.round(Math.random() * 2),
            } satisfies Tree;
          }),
        ),
      1000,
    ),
  );
}
