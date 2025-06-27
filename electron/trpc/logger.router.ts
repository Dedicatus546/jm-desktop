import { createLogger } from "@electron/module/logger";
import { z } from "zod";

import { trpc } from "./trpc";
const loggerInstanceMap: Record<string, ReturnType<typeof createLogger>> = {};

const loggerRpc = trpc.procedure
  .input(
    z.object({
      nameList: z.array(z.string()),
      type: z.enum(["info", "warn", "error"]),
      msg: z.array(z.any()),
    }),
  )
  .mutation(async ({ input }) => {
    const { nameList } = input;
    const key = nameList.join("-");
    let instance = loggerInstanceMap[key];
    if (!instance) {
      instance = loggerInstanceMap[key] = createLogger(...nameList);
    }
    instance[input.type](...input.msg);
  });

export const router = {
  logger: loggerRpc,
};
