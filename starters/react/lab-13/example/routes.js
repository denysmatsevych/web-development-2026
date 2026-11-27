import Layout from './Layout.jsx'
import { requireAuthor } from './middleware.js'
import Loading from './pages/Loading.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NewPostPage from './pages/NewPostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PostPage from './pages/PostPage.jsx'
import PostsPage from './pages/PostsPage.jsx'

export const routes = [
  {
    path: '/',
    Component: Layout,
    HydrateFallback: Loading,
    children: [
      { index: true, Component: PostsPage },
      { path: 'posts/:postId', Component: PostPage },
      {
        path: 'about',
        lazy: {
          Component: async () =>
            (await import('./pages/AboutPage.jsx')).default,
        },
      },
      { path: 'login', Component: LoginPage },
      {
        path: 'new',
        middleware: [requireAuthor],
        Component: NewPostPage,
      },
    ],
  },
  { path: '*', Component: NotFoundPage },
]
