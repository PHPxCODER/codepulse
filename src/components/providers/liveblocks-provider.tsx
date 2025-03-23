"use client";

import { ReactNode } from "react";
import { LiveblocksProvider as Provider } from "@liveblocks/react";

export function LiveblocksProvider({ children }: { children: ReactNode }) {
    return (
      <Provider
        publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || ""}
        throttle={100}
      >
        {children}
      </Provider>
    );
  }