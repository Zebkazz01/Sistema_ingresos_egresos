import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/use-auth';
// Import axios interceptor to handle 403 errors globally
import '@/lib/axios-interceptor';

const App = ({ Component, pageProps }: AppProps) => (
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
);

export default App;
