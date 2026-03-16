import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '~/trpc/client';

export const Route = createFileRoute('/_authenticated/u/$userSlug')({
  component: UserSlugLayout,
});

function UserSlugLayout() {
  const { userSlug } = Route.useParams();
  const trpc = useTRPC();
  const { data: me, isPending } = useQuery(trpc.user.me.queryOptions());

  if (isPending) {
    return null;
  }

  if (!me || me.slug !== userSlug) {
    return (
      <div className="text-center mt-12">
        <h1 className="text-2xl mb-2">Not authorized</h1>
        <p className="text-text-muted">You don't have access to this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
