import { Router } from "@electron/trpc/router";
import { createTRPCClient } from "@trpc/client";
import superjson from "superjson";
import { ipcLink } from "trpc-electron-fork/renderer";

export const trpcClient = createTRPCClient({
  links: [
    ipcLink<Router>({
      transformer: superjson,
    }),
  ],
});
