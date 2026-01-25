import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import config from "../config";
import "../css/NotFound.css";

export default function NotFound() {
  return (
  <div className="notfound">
    <SEO
      title={`404 — ${config.site.name}`}
      description="Page not found."
      noindex
    />
    <h1>404</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="back-home">
        ← Back to Home
      </Link>
    </div>
  );
}
