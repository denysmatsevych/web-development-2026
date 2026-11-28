import { useState } from 'react'
import { signIn } from '../../shared/auth/session.js'

export default function LoginPage() {
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError(null)
    setPending(true)
    try {
      await signIn(form.get('email'), form.get('password'))
      // §4.6: тут перехід туди, куди користувач ішов перед входом.
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="login">
      <h1>Вхід</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Пошта
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button" disabled={pending}>
          {pending ? 'Вхід…' : 'Увійти'}
        </button>
      </form>
    </section>
  )
}
