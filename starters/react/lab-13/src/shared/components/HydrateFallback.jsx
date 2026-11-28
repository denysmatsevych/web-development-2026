// Що показати під час першого рендеру сайту, поки працює middleware
// маршруту чи завантажується код лінивої сторінки (§4.6).
export default function HydrateFallback() {
  return (
    <p className="page-loading" role="status">
      Завантаження…
    </p>
  )
}
