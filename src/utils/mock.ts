import type { Planet, Tree } from "@/types/Tree";
export const planetsArray: Planet[] = ["Земля", "Юпитер", "Марс"];

export async function fakeTrees(): Promise<Tree[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          new Array(30000).fill(1).map(() => {
            const size = Math.round(Math.random() * 10) + 1;
            return {
              seed: Math.random() * 100000,
              depth: size,
              container: null as unknown as HTMLDivElement,
              witheredLevel: Math.round(Math.random() * 2),
              leafSize: 2,
              decayProgress: Math.pow(Math.random(), 12) * 2,
            } satisfies Tree;
          }),
        ),
      1000,
    ),
  );
}
