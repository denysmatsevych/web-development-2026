import { Link } from 'react-router'
import { posts } from '../posts.js'

export default function PostsPage() {
  return (
    <>
      <h1>Публікації</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}
