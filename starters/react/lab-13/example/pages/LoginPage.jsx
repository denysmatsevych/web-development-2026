import { useNavigate } from 'react-router'
import { signIn } from '../session.js'

export default function LoginPage() {
  const navigate = useNavigate()

  function handleClick() {
    signIn()
    navigate('/')
  }

  return (
    <>
      <h1>Вхід</h1>
      <p>Нову публікацію може написати лише автор.</p>
      <button type="button" onClick={handleClick}>
        Увійти як автор
      </button>
    </>
  )
}
