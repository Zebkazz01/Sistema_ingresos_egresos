import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [],
});

export const {
  signIn,
  signUp,
  signOut,
  getSession,
  useSession
} = authClient;
