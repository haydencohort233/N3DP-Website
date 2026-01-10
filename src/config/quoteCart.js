// src/utils/quoteCart.js
const KEY = "n3dp_quote_cart_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("n3dp:cart"));
}

export function getCart() {
  return read();
}

export function clearCart() {
  write([]);
}

export function clampQty1to99(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return Math.min(99, i);
}

function keyFor(item) {
  const refId = item?.ref_id != null ? String(item.ref_id) : "";
  const refSrc = item?.ref_src ? String(item.ref_src) : "";
  // Prefer id; fallback src
  return refId || refSrc;
}

export function addToCartFromImage(img) {
  const items = read();

  const nextItem = {
    ref_type: "gallery",
    ref_id: img?.id != null ? String(img.id) : null,
    ref_name: img?.title ? String(img.title) : null,
    ref_src: img?.src ? String(img.src) : null,
    quantity: "", // IMPORTANT: blank until user sets it
    unit_price: img?.price ?? img?.unit_price ?? null,
  };

  const k = keyFor(nextItem);
  if (!k) return items;

  const exists = items.some((x) => keyFor(x) === k);
  if (exists) return items;

  const next = [...items, nextItem];
  write(next);
  return next;
}

export function removeFromCartByKey(ref_id, ref_src) {
  const items = read();
  const k = String(ref_id || "") || String(ref_src || "");
  const next = items.filter((x) => keyFor(x) !== k);
  write(next);
  return next;
}

export function setCartItemQty(ref_id, ref_src, qtyStr) {
  const items = read();
  const k = String(ref_id || "") || String(ref_src || "");
  const next = items.map((x) => {
    if (keyFor(x) !== k) return x;
    return { ...x, quantity: qtyStr };
  });
  write(next);
  return next;
}
