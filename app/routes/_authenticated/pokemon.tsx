import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/pokemon')({
  component: PokemonLayout,
});

function PokemonLayout() {
  return <Outlet />;
}
