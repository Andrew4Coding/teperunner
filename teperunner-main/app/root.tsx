import {
  data,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from 'react-router';

import { RefreshCcw } from 'lucide-react';
import type { Route } from './+types/root';
import './app.css';
import { Button } from './components/ui/button';
import { ENV } from './lib/env';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'teperunner-main' },
    { name: 'teperunner-main', content: 'Welcome to teperunner-main!' },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Outlet />
  );
}

export async function loader() {
  return data({
    auth_url: ENV.BACKEND_URL,
  });
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = JSON.stringify(error);

  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.data || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  const navigate = useNavigate();

  return (
    <div className="text-center space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{message}</h1>
        <p className="text-gray-500">{details}</p>
      </div>
      {stack && <pre className="text-sm max-h-96 overflow-auto">{stack}</pre>}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(0)}
          className="w-full"
        >
          <RefreshCcw />
          Reload
        </Button>
        <Link to={'/'}>
          <Button className="w-full">I don't give a f*ck</Button>
        </Link>
      </div>
    </div>
  );
}
