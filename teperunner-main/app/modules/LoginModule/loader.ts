import { redirect, type LoaderFunctionArgs } from 'react-router';
import { getUserFromRequest } from '~/lib/auth.server';

export async function LoginLoader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);

  return null;
}
