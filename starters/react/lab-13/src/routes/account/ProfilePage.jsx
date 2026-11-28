import { useUser } from '../../shared/auth/session.js'

const roles = { viewer: 'глядач' }

export default function ProfilePage() {
  const user = useUser()

  return (
    <section>
      <h2>Профіль</h2>
      <dl className="profile">
        <dt>Ім’я</dt>
        <dd>{user?.name}</dd>
        <dt>Пошта</dt>
        <dd>{user?.email}</dd>
        <dt>Роль</dt>
        <dd>{roles[user?.role]}</dd>
      </dl>
    </section>
  )
}
