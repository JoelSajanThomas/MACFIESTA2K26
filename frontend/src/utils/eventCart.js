/** Local multi-event selection cart (persists across Events → Checkout). */

const KEY = "macfiesta_event_cart_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? [...new Set(parsed.map((value) => String(value || "").trim()).filter(Boolean))]
      : [];
  } catch {
    return [];
  }
}

function write(keys) {
  const unique = [...new Set(keys.map((value) => String(value || "").trim()).filter(Boolean))];
  localStorage.setItem(KEY, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent("macfiesta-cart-change", { detail: unique }));
  return unique;
}

export function getCartItems() {
  return read();
}

export function getCartEventIds() {
  return getCartItems();
}

export function hasInCart(eventKey) {
  return read().includes(String(eventKey));
}

export function addToCart(eventKey) {
  return write([...read(), eventKey]);
}

export function removeFromCart(eventKey) {
  return write(read().filter((key) => key !== String(eventKey)));
}

export function toggleInCart(eventKey) {
  const key = String(eventKey);
  const cur = read();
  if (cur.includes(key)) return removeFromCart(key);
  return addToCart(key);
}

export function isInCart(eventKey) {
  return hasInCart(eventKey);
}

export function addCartEvents(eventKeys) {
  return write([...read(), ...eventKeys]);
}

export function removeCartEvent(eventKey) {
  return removeFromCart(eventKey);
}

export function syncCart(eventKeys) {
  return write(eventKeys);
}

export function clearCart() {
  return write([]);
}

export function cartFeeTotal(events) {
  return (events || []).reduce((sum, ev) => sum + (Number(ev.registration_fee) || 0), 0);
}
