import MoviesPage from '../routes/movies/MoviesPage.jsx'

// Маршрути сайту: масив об'єктів маршрутів React Router, з якого
// App.jsx створює роутер. Сторінки — компоненти в `Component`, тож цей
// файл обходиться без JSX.
//
// Зараз маршрут один: «Афіша» на адресі /, ще без шапки сайту.
export const routes = [{ path: '/', Component: MoviesPage }]
