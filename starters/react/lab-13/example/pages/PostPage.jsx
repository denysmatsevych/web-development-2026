import { Link, useParams } from 'react-router'
import { findPost } from '../posts.js'

export default function PostPage() {
  const { postId } = useParams()
  const post = findPost(postId)
  if (!post) return <h1>Публікацію не знайдено</h1>

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.text}</p>
      <Link to="/">Усі публікації</Link>
    </article>
  )
}
