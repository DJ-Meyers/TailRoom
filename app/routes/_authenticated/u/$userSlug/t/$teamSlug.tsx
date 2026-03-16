import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/u/$userSlug/t/$teamSlug')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/u/$userSlug/teams/$teamSlug',
      params: { userSlug: params.userSlug, teamSlug: params.teamSlug },
      replace: true,
    });
  },
});
