export default function NewPostPage() {
  return (
    <>
      <h1>Нова публікація</h1>
      <form className="new-post" onSubmit={(event) => event.preventDefault()}>
        <label>
          Заголовок
          <input name="title" />
        </label>
        <label>
          Текст
          <textarea name="text" rows={5} />
        </label>
        <button type="submit">Опублікувати</button>
      </form>
      <p>У прикладі форма нічого не зберігає.</p>
    </>
  )
}
