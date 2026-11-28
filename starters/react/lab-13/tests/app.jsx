import { render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '../src/app/routes.js'

export const viewer = {
  email: 'glyadach@kino.test',
  name: 'Глядач',
  role: 'viewer',
}

// React Router записує в об'єкт `lazy` маршруту те, що вже завантажив, а
// цей об'єкт спільний для всіх роутерів, створених з того самого масиву
// маршрутів. Другий роутер з тих самих об'єктів тоді не знаходить лінивого
// маршруту: «No route matches URL». У браузері роутер один, а тести
// створюють новий роутер на кожен тест, тому кожен отримує копію маршрутів.
function copyRoutes(list) {
  return list.map((route) => ({
    ...route,
    lazy:
      route.lazy && typeof route.lazy === 'object'
        ? { ...route.lazy }
        : route.lazy,
    children: route.children && copyRoutes(route.children),
  }))
}

// Відкриває сайт за адресою url, як src/app/App.jsx, але з роутером у
// пам'яті замість адресного рядка браузера. Повертає й роутер: у
// router.state.location тест читає шлях і query, а router.navigate(-1) —
// кнопка «Назад».
export function renderApp(url = '/') {
  const router = createMemoryRouter(copyRoutes(routes), {
    initialEntries: [url],
  })
  const view = render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
  return { router, ...view }
}

// Користувач, який уже ввійшов: записує його в sessionStorage, як signIn().
export function signInAs(account = viewer) {
  sessionStorage.setItem('kino-user', JSON.stringify(account))
}

// Вхід через форму на сторінці «Вхід».
export async function signInWithForm(user, account = viewer) {
  await user.type(screen.getByLabelText('Пошта'), account.email)
  await user.type(screen.getByLabelText('Пароль'), 'kino2026')
  await user.click(screen.getByRole('button', { name: 'Увійти' }))
}

export function siteNav() {
  return screen.getByRole('navigation', { name: 'Основна навігація' })
}
