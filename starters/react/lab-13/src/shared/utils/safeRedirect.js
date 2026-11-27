// Адреса для переходу після входу, отримана з адреси сторінки (redirectTo).
//
// Значення redirectTo може написати будь-хто: достатньо надіслати
// посилання /login?redirectTo=//інший-сайт. Тому функція повертає `to`,
// лише якщо це шлях на цьому сайті: рядок, що починається з одного «/»,
// але не з «//» чи «/\» (браузер прочитає їх як адресу іншого сайту).
// Інакше, зокрема коли redirectTo немає, повертає кабінет, /account.
export function safeRedirect(to) {
  if (
    typeof to !== 'string' ||
    !to.startsWith('/') ||
    to.startsWith('//') ||
    to.startsWith('/\\')
  ) {
    return '/account'
  }
  return to
}
