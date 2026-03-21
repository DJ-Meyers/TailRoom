import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { config as dotenvConfig } from 'dotenv'
import path from 'path'
import type { PluginOption, ViteDevServer } from 'vite'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

function trpcDevServer(): PluginOption {
  let envLoaded = false
  return {
    name: 'trpc-dev-server',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.originalUrl?.startsWith('/api/trpc')) return next()

        if (!envLoaded) {
          dotenvConfig({ path: path.resolve(import.meta.dirname, '.env') })
          envLoaded = true
        }

        const { nodeHTTPRequestHandler } = await import(
          '@trpc/server/adapters/node-http'
        )
        const routerMod = await server.ssrLoadModule('/app/trpc/router.ts')
        const initMod = await server.ssrLoadModule('/app/trpc/init.ts')

        const url = new URL(req.originalUrl!, `http://${req.headers.host}`)
        const trpcPath = url.pathname.replace(/^\/api\/trpc\//, '')

        // Rewrite req.url so the adapter sees the correct path
        const originalUrl = req.url
        req.url = `/${trpcPath}${url.search}`

        try {
          await nodeHTTPRequestHandler({
            router: routerMod.appRouter,
            createContext: ({ req }: { req: typeof import('node:http').IncomingMessage }) =>
              initMod.createTRPCContext({ req }),
            path: trpcPath,
            req,
            res,
          })
        } finally {
          req.url = originalUrl
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    TanStackRouterVite({
      routesDirectory: 'app/routes',
      generatedRouteTree: 'app/routeTree.gen.ts',
    }),
    svgr(),
    react(),
    trpcDevServer(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, 'app'),
    },
  },
})
