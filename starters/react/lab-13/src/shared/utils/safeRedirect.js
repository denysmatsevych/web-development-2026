// Адреса для переходу після входу, отримана з адреси сторінки (redirectTo).
//
// Значення redirectTo може написати будь-хто: достатньо надіслати
// посилання /login?redirectTo=//інший-сайт. Тому функція повертає `to`,
// лише якщо браузер прочитає його як адресу цього сайту. Самого рядка для
// цього мало: «//інший-сайт», «/\інший-сайт» і «/<Tab>/інший-сайт»
// починаються з «/», але браузер читає їх як адресу іншого сайту (з адреси
// він викидає табуляцію). Тож функція будує з `to` повну адресу через
// new URL і порівнює її origin (протокол, домен і порт) з origin цього
// сайту. Інакше, зокрема коли redirectTo немає, повертає кабінет, /account.
export function safeRedirect(to) {
  if (typeof to !== 'string' || !to.startsWith('/')) return '/account'
  let url
  try {
    url = new URL(to, window.location.origin)
  } catch {
    return '/account'
  }
  if (url.origin !== window.location.origin) return '/account'
  return url.pathname + url.search + url.hash
}
