import { NavLink } from 'react-router'

// Макет кабінету: заголовок і меню кабінету над сторінкою кабінету.
export default function AccountLayout() {
  return (
    <div className="account">
      <h1>Кабінет</h1>
      <nav aria-label="Меню кабінету">
        <ul className="account-nav">
          <li>
            <NavLink to="/account">Профіль</NavLink>
          </li>
          <li>
            <NavLink to="/account/tickets">Мої квитки</NavLink>
          </li>
        </ul>
      </nav>
      <div className="account-page">{/* §4.5: тут сторінка кабінету */}</div>
    </div>
  )
}
