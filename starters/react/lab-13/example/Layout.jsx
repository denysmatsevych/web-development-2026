import { Link, NavLink, Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="blog">
      <header className="blog-header">
        <Link className="blog-name" to="/">
          Нотатки з веброзробки
        </Link>
        <nav aria-label="Розділи блогу">
          <NavLink to="/about">Про блог</NavLink>
          <NavLink to="/new">Нова публікація</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
