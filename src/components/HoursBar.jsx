// src/components/HoursBar.jsx
import { useEffect, useMemo, useState } from "react";
import config from "../config";
import "../css/HoursBar.css";

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

export default function HoursBar({ mobileOnly = true, compactText = true }) {
  const hours = config?.site?.hours;
  const weekly = hours?.weekly || {};
  const closingSoonMinutes = hours?.closingSoonMinutes ?? 60;

  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [isMobile, setIsMobile] = useState(false);

  // update status quietly
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // track mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const u = () => setIsMobile(!!mq.matches);
    u();
    mq.addEventListener?.("change", u);
    return () => mq.removeEventListener?.("change", u);
  }, []);

  const todayKey = useMemo(() => DAY_KEYS[now.getDay()], [now]);
  const today = useMemo(() => weekly[todayKey], [weekly, todayKey]);

  const status = useMemo(
    () => getStatus(now, today, closingSoonMinutes),
    [now, today, closingSoonMinutes]
  );

  const todayHours =
    today?.open && today?.close
      ? `${formatTime12h(today.open)} – ${formatTime12h(today.close)}`
      : "Hours unavailable";

  const label = compactText
    ? `${status.label} ${todayHours}`
    : `${status.label} • ${todayHours}`;

  const shouldRender = !mobileOnly || isMobile;
  if (!shouldRender) return null;

  const panelId = "hoursbar-panel";

  return (
    <div className={`hoursbar hoursbar--${status.tone}`}>
      <button
        type="button"
        className="hoursbar__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="hoursbar__main">
          <span className="hoursbar__dot" aria-hidden="true" />
          <span className="hoursbar__text">{label}</span>
        </span>

        <span className="hoursbar__chev" aria-hidden="true">
          {expanded ? "▴" : "▾"}
        </span>
      </button>

      <div id={panelId} className={`hoursbar__panel ${expanded ? "is-open" : ""}`}>
        <div className="hoursbar__grid">
          {DAY_KEYS.map((k) => {
            const d = weekly[k];
            const hoursText =
              d?.open && d?.close
                ? `${formatTime12h(d.open)} – ${formatTime12h(d.close)}`
                : "Closed";

            return (
              <div key={k} className={`hoursbar__row ${k === todayKey ? "is-today" : ""}`}>
                <span className="hoursbar__day">{DAY_LABELS[k]}</span>
                <span className="hoursbar__time">{hoursText}</span>
              </div>
            );
          })}
        </div>

        <div className="hoursbar__contact">
          <a className="hoursbar__email" href={`mailto:${config.site.email}`}>
            Email: {config.site.email}
          </a>
        </div>
      </div>
    </div>
  );
}
