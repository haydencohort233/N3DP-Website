import { useEffect, useMemo, useRef, useState } from "react";
import config from "../config";
import "../css/BusinessHours.css";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

function useMedia(q) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const u = () => setM(!!mq.matches);
    u();
    mq.addEventListener?.("change", u);
    return () => mq.removeEventListener?.("change", u);
  }, [q]);
  return m;
}

function parseTimeToMinutes(t) {
  const [hh, mm] = (t || "").split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function formatTime12h(t) {
  const [hhStr, mmStr] = (t || "").split(":");
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return t;

  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")}${suffix}`;
}

function getStatus(now, daySchedule, closingSoonMinutes) {
  if (!daySchedule?.open || !daySchedule?.close) {
    return { label: "Hours unavailable", tone: "neutral" };
  }

  const openMin = parseTimeToMinutes(daySchedule.open);
  const closeMin = parseTimeToMinutes(daySchedule.close);
  if (openMin == null || closeMin == null) {
    return { label: "Hours unavailable", tone: "neutral" };
  }

  const minsNow = now.getHours() * 60 + now.getMinutes();

  if (minsNow < openMin || minsNow >= closeMin) {
    return { label: "Closed", tone: "closed" };
  }

  const minsLeft = closeMin - minsNow;
  if (minsLeft <= closingSoonMinutes) {
    return { label: "Closing soon", tone: "soon" };
  }

  return { label: "Open", tone: "open" };
}

export default function BusinessHours({
  variant = "inline", // "inline" | "bar"
  mobileOnly = false,
  desktopOnly = false,
  breakpointPx = 768,
}) {
  const isMobile = useMedia(`(max-width: ${breakpointPx}px)`);
  const isDesktop = !isMobile;

  // IMPORTANT: don't return early before hooks below
  const shouldRender =
    (!mobileOnly || isMobile) && (!desktopOnly || isDesktop);

  const hours = config?.hours || config?.site?.hours;
  const weekly = hours?.weekly || {};
  const closingSoonMinutes = hours?.closingSoonMinutes ?? 60;

  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const wrapRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (!expanded) return;
      if (!wrapRef.current?.contains(e.target)) setExpanded(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setExpanded(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [expanded]);

  const todayKey = DAY_KEYS[now.getDay()];
  const today = weekly[todayKey];

  const status = useMemo(
    () => getStatus(now, today, closingSoonMinutes),
    [now, today, closingSoonMinutes]
  );

  const todayHours =
    today?.open && today?.close
      ? `${formatTime12h(today.open)} – ${formatTime12h(today.close)}`
      : "Hours unavailable";

  const missingConfig = !hours || Object.keys(weekly).length === 0;

  const rootClass = `bh bh--${variant} bh--${status.tone}`;
  const panelId = `bh-panel-${variant}`;

  const label =
    variant === "inline"
      ? `${status.label} ${todayHours.replace(" – ", "–")}`
      : `${status.label} ${todayHours}`;

  // Now it's safe to skip rendering
  if (!shouldRender) return null;

  return (
    <div ref={wrapRef} className={rootClass}>
      <button
        type="button"
        className="bh__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`Business hours: ${status.label}. Today: ${todayHours}.`}
      >
        <span className="bh__main">
          <span className="bh__dot" aria-hidden="true" />
          <span className="bh__text">
            {missingConfig ? "Business hours: not configured" : label}
          </span>
        </span>
        <span className="bh__chev" aria-hidden="true">
          {expanded ? "▴" : "▾"}
        </span>
      </button>

      <div id={panelId} className={`bh__panel ${expanded ? "is-open" : ""}`}>
        {missingConfig ? (
          <div className="bh__grid" style={{ padding: "10px 14px 12px" }}>
            <div className="bh__row">
              <span className="bh__day">Fix</span>
              <span className="bh__time">Add config.hours.weekly</span>
            </div>
          </div>
        ) : (
          <>
            <div className="bh__grid">
              {DAY_KEYS.map((k) => {
                const d = weekly[k];
                const hoursText =
                  d?.open && d?.close
                    ? `${formatTime12h(d.open)} – ${formatTime12h(d.close)}`
                    : "Closed";

                return (
                  <div
                    key={k}
                    className={`bh__row ${k === todayKey ? "is-today" : ""}`}
                  >
                    <span className="bh__day">{DAY_LABELS[k]}</span>
                    <span className="bh__time">{hoursText}</span>
                  </div>
                );
              })}
            </div>

            {config?.site?.phone && (
              <div className="bh__contact">
                <a className="bh__email" href={`mailto:${config.site.email}`}>
                  {config.site.email}
                </a>
                <a className="bh__phone">
                  {config.site.phone}
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
