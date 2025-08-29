import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
  build: {
    cssMinify: true,
    ssr: false,
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000'),
  },
  ...(process.env.NODE_ENV === 'production' && {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.node',
      },
    },
  }),
});
