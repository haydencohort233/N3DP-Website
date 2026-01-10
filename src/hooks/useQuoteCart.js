// src/hooks/useQuoteCart.js
import { useEffect, useState } from "react";
import { getCart } from "../config/quoteCart";

export default function useQuoteCart() {
  const [cart, setCart] = useState(() => getCart());

  useEffect(() => {
    const on = () => setCart(getCart());
    window.addEventListener("storage", on);
    window.addEventListener("n3dp:cart", on);
    return () => {
      window.removeEventListener("storage", on);
      window.removeEventListener("n3dp:cart", on);
    };
  }, []);

  return cart;
}
