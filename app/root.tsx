import "./tailwind.css"

import type { LinksFunction, MetaFunction } from "@remix-run/node"

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"

export const meta: MetaFunction = () => [
  { title: "Learing Remix To-Do List" },
  { name: "description", content: "To-Do list developed with Remix.run" },
]

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📜</text></svg>",
  },
  { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: "/inter_var.woff2" },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face{font-family:InterVariable;font-style:normal;font-weight:100 900;font-display:swap;src:url('/inter_var.woff2') format('woff2')}`,
          }}
        />
      </head>
      <body className="h-full bg-gray-50 font-sans text-gray-600 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
