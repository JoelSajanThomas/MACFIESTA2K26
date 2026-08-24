/** Local multi-event selection cart (persists across Events → Checkout). */

const KEY = "macfiesta_event_cart_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  const unique = [...new Set(ids.map(Number).filter((n) => Number.isFinite(n)))];
  localStorage.setItem(KEY, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent("macfiesta-cart-change", { detail: unique }));
  return unique;
}

export function getCartEventIds() {
  return read();
}

export function isInCart(eventId) {
  return read().includes(Number(eventId));
}

export function toggleCartEvent(eventId) {
  const id = Number(eventId);
  const cur = read();
  if (cur.includes(id)) return write(cur.filter((x) => x !== id));
  return write([...cur, id]);
}

export function addCartEvents(eventIds) {
  return write([...read(), ...eventIds]);
}

export function removeCartEvent(eventId) {
  return write(read().filter((x) => x !== Number(eventId)));
}

export function clearCart() {
  return write([]);
}

export function cartFeeTotal(events) {
  return (events || []).reduce((sum, ev) => sum + (Number(ev.registration_fee) || 0), 0);
}
