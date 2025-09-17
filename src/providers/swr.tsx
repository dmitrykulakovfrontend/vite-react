"use client";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
export const SWRProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      {children}
    </SWRConfig>
  );
};
