// Middleware захищених маршрутів (§4.6).
//
// Middleware маршруту — функція, яку React Router викликає перед тим, як
// показати маршрут: спершу middleware батьківського маршруту, потім
// дочірнього. Вона отримує об'єкт { request, params, context }; адреса, на
// яку йде перехід, — у request.url. Щоб зупинити перехід і відправити
// користувача на іншу адресу, middleware кидає redirect(адреса) з
// 'react-router'. Поточного користувача повертає getUser() з
// '../shared/auth/session.js', безпечну адресу — safeRedirect(to) з
// '../shared/utils/safeRedirect.js'.

// Пропускає далі лише користувача, який увійшов. Гостя відправляє на
// /login?redirectTo=…, де redirectTo — шлях і query адреси, яку він
// відкривав, наприклад /booking/s2?from=schedule&row=3.
export function requireUser() {
  throw new Error('Not implemented: requireUser')
}

// Пропускає на «Вхід» лише гостя. Користувача, який уже ввійшов, відправляє
// на адресу з redirectTo, пропущену через safeRedirect, а без redirectTo —
// у кабінет: safeRedirect(null) повертає '/account'.
export function guestOnly() {
  throw new Error('Not implemented: guestOnly')
}
