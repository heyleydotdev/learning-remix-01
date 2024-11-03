import { Link, NavLink } from "@remix-run/react"

export default function SiteHeader() {
  return (
    <header className="container sticky top-0 z-10 grid h-14 grid-cols-2 place-items-center border-b bg-gray-50">
      <div className="justify-self-start">
        <Link to={"/"}>
          <span className="text-sm font-bold uppercase tracking-wide text-gray-950">TO-DO LIST</span>
        </Link>
      </div>
      <div className="justify-self-end">
        <NavLink to={"/"} className="p-2 text-sm font-medium text-gray-600 last:pr-0 aria-[current=page]:text-gray-950">
          Home
        </NavLink>
      </div>
    </header>
  )
}
