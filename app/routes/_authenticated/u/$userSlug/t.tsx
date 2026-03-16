import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/u/$userSlug/t')({
  component: () => <Outlet />,
});
