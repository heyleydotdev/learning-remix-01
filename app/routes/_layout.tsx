import { Outlet } from "@remix-run/react"
import SiteHeader from "app/components/site-header"

export default function RootLayout() {
  return (
    <div className="isolate flex min-h-full flex-col">
      <SiteHeader />
      <main className="container isolate flex-1">
        <Outlet />
      </main>
    </div>
  )
}
