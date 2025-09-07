import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (typeof window !== 'undefined' && window.location.origin) ||
    'http://localhost:3000',
  plugins: [],
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
