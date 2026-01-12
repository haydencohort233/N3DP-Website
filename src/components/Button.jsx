import { Link } from "react-router-dom";
import "../css/Button.css";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  href,
  ariaLabel,
}) {
  const className = `btn btn-${variant}`;

  // Internal link (client-side navigation)
  if (href?.startsWith("/")) {
    return (
      <Link
        to={href}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
      >
        {children}
      </Link>
    );
  }

  // External link in new tab
  if (href) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
      >
        {children}
      </a>
    );
  }

  // Regular button
  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
    >
      {children}
    </button>
  );
}
