import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/u/$userSlug/t/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/u/$userSlug/teams',
      params: { userSlug: params.userSlug },
      replace: true,
    });
  },
});
