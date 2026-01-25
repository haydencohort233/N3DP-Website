// HeroSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import heroConfig from "../config/Hero";
import config from "../config";
import "../css/HeroSection.css";
import Button from "./Button";

function useMedia(q, initial = false) {
  const [m, setM] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const u = () => setM(!!mq.matches);
    u();
    mq.addEventListener?.("change", u);
    return () => mq.removeEventListener?.("change", u);
  }, [q]);
  return m;
}

function DefaultOverlay() {
  const siteName = config?.site?.name ?? "MySite";
  const overlay = heroConfig?.overlay ?? {};

  const title = overlay.title ?? siteName;
  const subtitle = overlay.subtitle ?? "";

  const primaryCtaText = overlay.primaryCtaText ?? "Get a Quote";
  const primaryCtaHref = overlay.primaryCtaHref ?? "/contact";

  const secondaryCtaText = overlay.secondaryCtaText ?? "FAQ";
  const secondaryCtaHref = overlay.secondaryCtaHref ?? "/faq";

  return (
    <div className="hero__panel">
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>

        {subtitle && <p className="hero__subtitle">{subtitle}</p>}

        <div className="hero__actions">
          <Button className="btn" href={primaryCtaHref} ariaLabel={primaryCtaText}>
            {primaryCtaText}
          </Button>

          <a className="hero__link" href={secondaryCtaHref}>
            {secondaryCtaText}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({
  cycleSeconds = heroConfig.cycleSeconds,
  fadeMs = heroConfig.fadeMs,
  restartOnBreakpointSwitch = heroConfig.restartOnBreakpointSwitch,
  mobileImages = heroConfig.paths.mobile,
  desktopImages = heroConfig.paths.desktop,
  mobileHeight = heroConfig.mobileHeight,
  desktopAspectRatio = heroConfig.desktopAspectRatio,
  desktopMinHeight = heroConfig.desktopMinHeight,
  desktopMaxHeight = heroConfig.desktopMaxHeight,
  scrollTarget = "#about",
  children,
}) {
  const isMobile = useMedia("(max-width: 1024px)");
  const images = useMemo(
    () => (isMobile ? mobileImages : desktopImages),
    [isMobile, mobileImages, desktopImages]
  );

  const [index, setIndex] = useState(0);
  const [mountKey, setMountKey] = useState(() => (isMobile ? "m" : "d"));
  const intervalRef = useRef(null);
  const heroRef = useRef(null);

  const showScroll = isMobile;

  // ✅ Efficient preload: only preload the NEXT image (instead of preloading ALL)
  useEffect(() => {
    if (!images?.length || images.length <= 1) return;

    const nextIndex = (index + 1) % images.length;
    const src = images[nextIndex];
    if (!src) return;

    const preload = () => {
      const img = new Image();
      img.src = src;
    };

    // Defer a bit so the first hero image isn't competing with preloads
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preload, { timeout: 1200 });
    } else {
      setTimeout(preload, 250);
    }
  }, [images, index]);

  useEffect(() => {
    const k = isMobile ? "m" : "d";
    if (restartOnBreakpointSwitch && mountKey !== k) {
      setMountKey(k);
      setIndex(0);
    }
  }, [isMobile, restartOnBreakpointSwitch, mountKey]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (images.length <= 1) return;

    const period = Math.max(1000, (cycleSeconds || 6) * 1000);
    const tick = () => setIndex((i) => (i + 1) % images.length);

    intervalRef.current = setInterval(tick, period);

    const vis = () => {
      const hidden = document.visibilityState !== "visible";
      clearInterval(intervalRef.current);
      if (!hidden) intervalRef.current = setInterval(tick, period);
    };

    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [images, cycleSeconds]);

  const targetSel =
    typeof scrollTarget === "string"
      ? scrollTarget.startsWith("#")
        ? scrollTarget
        : `#${scrollTarget}`
      : "#about";

  const scrollDown = (e) => {
    e?.preventDefault?.();
    const nav =
      document.querySelector("[data-navbar]") ||
      document.querySelector("nav, header");
    const navH = nav?.offsetHeight ?? 0;
    const tgt = document.querySelector(targetSel);
    const y = tgt
      ? tgt.getBoundingClientRect().top + window.scrollY - navH - 8
      : (heroRef.current?.offsetTop ?? 0) +
        (heroRef.current?.offsetHeight ?? window.innerHeight) -
        navH;
    window.scrollTo({ top: y, behavior: "smooth" });
    try {
      window.history.replaceState(null, "", targetSel);
    } catch {}
  };

  const fixedMods = "hero--links-underline hero--pointer";

  return (
    <section
      ref={heroRef}
      key={mountKey}
      className={`hero ${isMobile ? "hero--mobile" : "hero--desktop"} ${fixedMods}`}
      style={{
        "--fade-ms": `${fadeMs}ms`,
        "--hero-mobile-h": mobileHeight,
        "--hero-desktop-aspect": desktopAspectRatio,
        "--hero-desktop-min": `${desktopMinHeight}px`,
        "--hero-desktop-max": `${desktopMaxHeight}px`,
      }}
      aria-label="Hero"
    >
      <div className="hero__stack" aria-hidden="true">
        {images.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className={`hero__img ${i === index ? "is-visible" : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchpriority={i === 0 ? "high" : "auto"}
          />
        ))}
      </div>

      <div className="hero__overlay hero__overlay--center">
        {children ?? <DefaultOverlay />}
      </div>

      {showScroll && (
        <div className="hero__scroll" aria-hidden="false">
          <a
            href={targetSel}
            className="hero__scroll-btn"
            onClick={scrollDown}
            aria-label="Scroll for more"
          >
            <svg
              className="hero__chevron"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <div className="hero__scroll-hint">
            Click or scroll down for more information
          </div>
        </div>
      )}
    </section>
  );
}
