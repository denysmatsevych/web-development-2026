import { signOut, useUser } from '../shared/auth/session.js'

// Шапка сайту над кожною сторінкою. Посилання в ній поки звичайні <a>:
// перехід за кожним перезавантажує весь сайт.
export default function RootLayout() {
  const user = useUser()

  function handleSignOut() {
    signOut()
    // §4.6: після виходу — перехід на «Афішу».
  }

  return (
    <div className="site">
      <header className="site-header">
        <a className="brand" href="/">
          Кінотеатр
        </a>
        <nav aria-label="Основна навігація">
          <ul className="site-nav">
            <li>
              <a href="/">Афіша</a>
            </li>
            <li>
              <a href="/schedule">Розклад</a>
            </li>
            {user ? (
              <>
                <li>
                  <a href="/account">Кабінет</a>
                </li>
                <li>
                  <button type="button" onClick={handleSignOut}>
                    Вийти
                  </button>
                </li>
              </>
            ) : (
              <li>
                <a href="/login">Увійти</a>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main className="page">{/* §4.4: тут сторінка */}</main>
    </div>
  )
}
