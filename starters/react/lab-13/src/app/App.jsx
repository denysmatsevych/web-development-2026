import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from './routes.js'

// Роутер створюється один раз, поза компонентом, щоб не створюватися
// заново на кожному рендері App.
const router = createBrowserRouter(routes)

export default function App() {
  return <RouterProvider router={router} />
}
