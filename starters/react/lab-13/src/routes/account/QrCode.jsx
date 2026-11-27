import QRCode from 'qrcode'

// QR-код рядка value як SVG. Бібліотека qrcode обчислює матрицю коду, а
// компонент малює кожну темну клітинку квадратом 1 × 1.
export default function QrCode({ value, label }) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' })
  const { size, data } = modules
  let path = ''
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y * size + x]) path += `M${x} ${y}h1v1h-1z`
    }
  }

  return (
    <svg
      className="qr"
      role="img"
      aria-label={label}
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      shapeRendering="crispEdges"
    >
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="#fff" />
      <path d={path} fill="#1b1722" />
    </svg>
  )
}
