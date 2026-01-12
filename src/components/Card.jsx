import { useState, useEffect } from "react";
import "../css/Card.css";

export default function Card({
  title,
  children,
  minimizable = false,
  storageKey,
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Load initial state from localStorage (if enabled)
  useEffect(() => {
    if (!minimizable || !storageKey) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "collapsed") {
        setCollapsed(true);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [minimizable, storageKey]);

  // Persist state to localStorage when it changes
  useEffect(() => {
    if (!minimizable || !storageKey) return;
    try {
      window.localStorage.setItem(
        storageKey,
        collapsed ? "collapsed" : "expanded"
      );
    } catch {
      // ignore errors
    }
  }, [collapsed, minimizable, storageKey]);

  const toggleCollapsed = () => {
    if (!minimizable) return;
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={`card ${collapsed ? "card-collapsed" : ""}`}>
      {(title || minimizable) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {minimizable && (
            <button
              type="button"
              className="card-toggle"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand section" : "Collapse section"}
            >
              {collapsed ? "＋" : "−"}
            </button>
          )}
        </div>
      )}

      {!collapsed && <div className="card-body">{children}</div>}
    </div>
  );
}
