// src/hooks/useShopProducts.js
// ---------------------------------------------------------------------------
// Handles all product sorting and holiday filtering logic.
// Use this in Shop.jsx and Home.jsx instead of importing productsData directly.
//
// Usage:
//   const products = useShopProducts();
//   const products = useShopProducts({ limit: 4 });
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import productsData from "../config/productsData";

// ---------------------------------------------------------------------------
// Holiday windows — each holiday shows items 3 weeks (21 days) before
// and hides them the day after.
// Dates are [month (1-based), day] for the holiday itself.
// ---------------------------------------------------------------------------
const HOLIDAY_DATES = {
  valentines:   [2, 14],
  stpatricks:   [3, 17],
  easter:       null,       // dynamic — computed below
  mothersday:   null,       // dynamic — 2nd Sunday in May
  "4thofjuly":  [7, 4],
  fathersday:   null,       // dynamic — 3rd Sunday in June
  halloween:    [10, 31],
  thanksgiving: null,       // dynamic — 4th Thursday in November
  christmas:    [12, 25],
  newyears:     [1, 1],
};

// Days before the holiday to start showing items
const LEAD_DAYS = 21;

function getNthWeekday(year, month, weekday, n) {
  // weekday: 0=Sun, 1=Mon ... 6=Sat
  // n: 1-based (1 = first, 2 = second, etc.)
  const d = new Date(year, month - 1, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === weekday) {
      count++;
      if (count === n) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
}

function getLastWeekday(year, month, weekday) {
  const d = new Date(year, month, 0); // last day of month
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
  return new Date(d);
}

// Approximate Easter (Meeus/Jones/Butcher algorithm)
function getEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getDynamicHoliday(key, year) {
  switch (key) {
    case "easter":      return getEaster(year);
    case "mothersday":  return getNthWeekday(year, 5, 0, 2);   // 2nd Sunday May
    case "fathersday":  return getNthWeekday(year, 6, 0, 3);   // 3rd Sunday June
    case "thanksgiving":return getNthWeekday(year, 11, 4, 4);  // 4th Thursday Nov
    default:            return null;
  }
}

function getHolidayDate(key) {
  const now = new Date();
  const year = now.getFullYear();
  const fixed = HOLIDAY_DATES[key];
  if (fixed === undefined) return null;
  if (fixed === null) return getDynamicHoliday(key, year);
  return new Date(year, fixed[0] - 1, fixed[1]);
}

function isHolidayActive(key) {
  const holiday = getHolidayDate(key);
  if (!holiday) return false;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const windowStart = new Date(holiday);
  windowStart.setDate(windowStart.getDate() - LEAD_DAYS);
  const windowEnd = new Date(holiday);
  windowEnd.setDate(windowEnd.getDate() + 1); // day after holiday

  return todayMidnight >= windowStart && todayMidnight < windowEnd;
}

// ---------------------------------------------------------------------------
// Badge sort priority — lower number = sorted earlier
// ---------------------------------------------------------------------------
const BADGE_PRIORITY = {
  "Best Seller": 0,
  "Limited":     1,
  "Sale":        2,
  "New":         3,
};

function sortProducts(products) {
  return [...products].sort((a, b) => {
    // 1. featured pins to absolute front
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // 2. badge priority
    const pa = a.badge != null ? (BADGE_PRIORITY[a.badge] ?? 10) : 99;
    const pb = b.badge != null ? (BADGE_PRIORITY[b.badge] ?? 10) : 99;
    if (pa !== pb) return pa - pb;

    // 3. in-stock before out-of-stock
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;

    return 0;
  });
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------
export default function useShopProducts({ limit } = {}) {
  return useMemo(() => {
    // 1. Filter by holiday visibility
    const visible = productsData.filter((p) => {
      const h = p.holidays;
      if (!h || h.length === 0) return true; // always visible
      // Show if ANY of its holidays are currently active
      return h.some((key) => isHolidayActive(key));
    });

    // 2. Sort
    const sorted = sortProducts(visible);

    // 3. Limit
    if (typeof limit === "number" && limit > 0) return sorted.slice(0, limit);
    return sorted;
  }, [limit]);
}

// Also export helper so Shop.jsx can show a "holiday items coming soon" note
export function getActiveHolidays() {
  return Object.keys(HOLIDAY_DATES).filter((key) => isHolidayActive(key));
}