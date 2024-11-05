import { Link, NavLink } from "@remix-run/react"

import LoadingIndicator from "~/components/loading-indicator"

export default function SiteHeader() {
  return (
    <header className="container sticky top-0 z-10 grid h-14 grid-cols-2 place-items-center border-b bg-gray-50">
      <div className="flex items-center gap-x-2 justify-self-start">
        <Link to={"/"}>
          <span className="text-sm font-bold uppercase tracking-wide text-gray-950">TO-DO LIST</span>
        </Link>
        <LoadingIndicator />
      </div>
      <div className="justify-self-end">
        <NavLink
          to={"/"}
          className="p-2 text-sm font-medium text-gray-600 last:pr-0 hover:text-gray-950 aria-[current=page]:text-gray-950"
        >
          Home
        </NavLink>
        <Link
          to={"https://github.com/heyleydotdev/learning-remix-01"}
          className="p-2 text-sm font-medium text-gray-600 last:pr-0 hover:text-gray-950"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </Link>
      </div>
    </header>
  )
}
