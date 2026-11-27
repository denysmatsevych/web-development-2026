// Що показати, поки завантажується код сторінки, з якої почалося
// відкриття сайту (§4.7).
export default function HydrateFallback() {
  return (
    <p className="page-loading" role="status">
      Завантаження…
    </p>
  )
}
