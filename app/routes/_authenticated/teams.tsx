import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/teams')({
  component: TeamsLayout,
});

function TeamsLayout() {
  return <Outlet />;
}
