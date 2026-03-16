import { router } from '~/trpc/init';
import { calcEntryRouter } from '~/trpc/routers/calcEntry';
import { pokemonRouter } from '~/trpc/routers/pokemon';
import { speedEntryRouter } from '~/trpc/routers/speedEntry';
import { teamRouter } from '~/trpc/routers/team';
import { userRouter } from '~/trpc/routers/user';

export const appRouter = router({
  user: userRouter,
  team: teamRouter,
  pokemon: pokemonRouter,
  calcEntry: calcEntryRouter,
  speedEntry: speedEntryRouter,
});

export type AppRouter = typeof appRouter;
