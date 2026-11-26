/**
 * Ред'юсер черги замовлень.
 *
 * Стан нормалізовано: кожне замовлення й кожен гість зберігаються один раз,
 * а замовлення посилається на гостя через customerId.
 *
 *   {
 *     orders: {
 *       byId: { o41: { id, number, status, customerId, items: [...] }, … },
 *       ids: ['o41', …],          // порядок надходження
 *     },
 *     customers: {
 *       byId: { c1: { id: 'c1', name: 'Оля' }, … },
 *       ids: ['c1', …],
 *     },
 *     nextNumber,                 // номер для наступного замовлення
 *   }
 *
 * Напої лишаються всередині замовлення: вони не мають сенсу без нього, і
 * жоден інший об'єкт на них не посилається. status замовлення — колонка на
 * дошці: 'new' («Нові»), 'brewing' («Готуються»), 'ready' («Готові») або
 * 'served' («Видані»).
 *
 * Дії — події на сторінці:
 *   { type: 'order_placed', order: { id, customer: { id, name }, items } }
 *       бариста надіслав нове замовлення з форми. Номер і статус 'new'
 *       дає ред'юсер, кожен напій отримує done: false. id замовлення й
 *       гостя створює обробник події.
 *   { type: 'item_toggled', orderId, itemId }
 *       бариста відмітив напій готовим або зняв позначку
 *   { type: 'order_advanced', orderId }
 *       бариста натиснув «Почати», «Готово» чи «Видати»: замовлення
 *       переходить у наступну колонку
 *   { type: 'order_cancelled', orderId }
 *       бариста натиснув «Скасувати замовлення»
 *   { type: 'customer_renamed', customerId, name }
 *       бариста виправив ім'я гостя в «Деталях»
 *
 * Компоненти читають стан лише через selectColumn і selectOrder унизу
 * файлу: вони повертають замовлення з гостем усередині.
 */

const nextStatus = { new: 'brewing', brewing: 'ready', ready: 'served' }

/** Нормалізований стан черги з вкладених замовлень, як їх повертає loadOrders(). */
export function createInitialState(orders) {
  const state = {
    orders: { byId: {}, ids: [] },
    customers: { byId: {}, ids: [] },
    nextNumber: Math.max(...orders.map((order) => order.number)) + 1,
  }
  for (const { customer, ...order } of orders) {
    state.orders.byId[order.id] = { ...order, customerId: customer.id }
    state.orders.ids.push(order.id)
    if (!state.customers.byId[customer.id]) {
      state.customers.byId[customer.id] = customer
      state.customers.ids.push(customer.id)
    }
  }
  return state
}

// Новий стан, у якому змінено лише замовлення orderId.
function updateOrder(state, orderId, update) {
  return {
    ...state,
    orders: {
      ...state.orders,
      byId: {
        ...state.orders.byId,
        [orderId]: update(state.orders.byId[orderId]),
      },
    },
  }
}

export function queueReducer(state, action) {
  switch (action.type) {
    case 'order_placed': {
      const { customer, items, ...rest } = action.order
      const order = {
        ...rest,
        number: state.nextNumber,
        status: 'new',
        customerId: customer.id,
        items: items.map((item) => ({ ...item, done: false })),
      }
      const isNewCustomer = !state.customers.byId[customer.id]
      return {
        ...state,
        orders: {
          byId: { ...state.orders.byId, [order.id]: order },
          ids: [...state.orders.ids, order.id],
        },
        customers: isNewCustomer
          ? {
              byId: { ...state.customers.byId, [customer.id]: customer },
              ids: [...state.customers.ids, customer.id],
            }
          : state.customers,
        nextNumber: state.nextNumber + 1,
      }
    }
    case 'item_toggled':
      return updateOrder(state, action.orderId, (order) => ({
        ...order,
        items: order.items.map((item) =>
          item.id === action.itemId ? { ...item, done: !item.done } : item,
        ),
      }))
    case 'order_advanced':
      return updateOrder(state, action.orderId, (order) => ({
        ...order,
        status: nextStatus[order.status],
      }))
    case 'order_cancelled': {
      // Гість лишається в customers: на нього можуть посилатися інші
      // замовлення, а відновити замовлення допоможе «Скасувати дію».
      const byId = { ...state.orders.byId }
      delete byId[action.orderId]
      return {
        ...state,
        orders: {
          byId,
          ids: state.orders.ids.filter((id) => id !== action.orderId),
        },
      }
    }
    case 'customer_renamed': {
      const customer = state.customers.byId[action.customerId]
      if (customer.name === action.name) return state
      return {
        ...state,
        customers: {
          ...state.customers,
          byId: {
            ...state.customers.byId,
            [customer.id]: { ...customer, name: action.name },
          },
        },
      }
    }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

// Замовлення з гостем усередині — у тому вигляді, який чекають компоненти.
function withCustomer(state, order) {
  return { ...order, customer: state.customers.byId[order.customerId] }
}

/**
 * Замовлення однієї колонки (status) у порядку надходження, кожне разом із
 * гостем і напоями.
 */
export function selectColumn(state, status) {
  return state.orders.ids
    .map((id) => state.orders.byId[id])
    .filter((order) => order.status === status)
    .map((order) => withCustomer(state, order))
}

/** Замовлення за id разом із гостем і напоями; undefined, якщо його немає. */
export function selectOrder(state, id) {
  const order = state.orders.byId[id]
  return order && withCustomer(state, order)
}
