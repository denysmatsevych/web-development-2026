import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router'
import Layout from './Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PostPage from './pages/PostPage.jsx'
import PostsPage from './pages/PostsPage.jsx'
import { useUser } from './session.js'

// Блог у декларативному режимі: маршрути — JSX усередині компонента.
// Його рендерить main-declarative.jsx.

const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))

function RequireAuthor() {
  const user = useUser()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function DeclarativeApp() {
  return (
    <Suspense fallback={<p className="loading">Завантаження…</p>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PostsPage />} />
          <Route path="posts/:postId" element={<PostPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuthor />}>
            <Route path="new" element={<NewPostPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
