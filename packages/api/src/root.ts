import { createRouter, createCallerFactory } from "./trpc";
import { dictionaryRouter } from "./routers/dictionary";
import { authRouter } from "./routers/auth";
import { equipmentRouter } from "./routers/equipment";
import { bookingRouter } from "./routers/booking";

export const appRouter = createRouter({
  dictionary: dictionaryRouter,
  auth: authRouter,
  equipment: equipmentRouter,
  booking: bookingRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
