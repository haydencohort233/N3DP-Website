import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useGaPageViews() {
  const location = useLocation();

  useEffect(() => {
    // Don't track dev + don't run until gtag exists
    if (window.location.hostname === "localhost") return;
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location]);
}
