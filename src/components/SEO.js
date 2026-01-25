import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import seoConfig from "../config/Seo";

export default function SEO({
  title,
  description,
  keywords,
  image,
  author,
  noindex = false,
}) {
  const location = useLocation();

  const t = title ?? seoConfig.title;
  const d = description ?? seoConfig.description;
  const k = keywords ?? seoConfig.keywords;
  const a = author ?? seoConfig.author;

  // Canonical URL
  const canonicalUrl = new URL(location.pathname, seoConfig.siteUrl).toString();

  // Absolute image URL
  const imagePath = image ?? seoConfig.ogImage;
  const fullImageUrl = imagePath
    ? new URL(imagePath, seoConfig.siteUrl).toString()
    : undefined;

  // LocalBusiness JSON-LD (not for noindex pages)
  const business = seoConfig.business;
  const hasFullAddress =
    business?.address?.streetAddress &&
    business?.address?.postalCode &&
    business?.telephone;

  const sameAs = [
    business?.instagramUsername
      ? `https://instagram.com/${String(business.instagramUsername).replace("@", "")}`
      : null,
    business?.facebookUrl ?? null,
  ].filter(Boolean);

  const jsonLd =
    !noindex && business && hasFullAddress
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${seoConfig.siteUrl}#localbusiness`,
          name: business.name,
          ...(fullImageUrl ? { image: fullImageUrl } : {}),
          url: seoConfig.siteUrl,
          telephone: business.telephone,
          address: {
            "@type": "PostalAddress",
            streetAddress: business.address.streetAddress,
            addressLocality: business.address.addressLocality,
            addressRegion: business.address.addressRegion,
            postalCode: business.address.postalCode,
            addressCountry: business.address.addressCountry,
          },
          ...(business.geo?.latitude != null && business.geo?.longitude != null
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: business.geo.latitude,
                  longitude: business.geo.longitude,
                },
              }
            : {}),
          ...(sameAs.length ? { sameAs } : {}),
        }
      : null;

  const robots = noindex ? "noindex,nofollow" : "index,follow";

  return (
    <Helmet prioritizeSeoTags>
      <title>{t}</title>

      {/* For 404/noindex pages, it's typically cleaner to omit canonical */}
      {!noindex && <link rel="canonical" href={canonicalUrl} />}

      <meta name="robots" content={robots} />

      {d && <meta name="description" content={d} />}
      {k && <meta name="keywords" content={k} />}
      {a && <meta name="author" content={a} />}

      <meta property="og:title" content={t} />
      {d && <meta property="og:description" content={d} />}
      {fullImageUrl && <meta property="og:image" content={fullImageUrl} />}
      {!noindex && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content="website" />
      {seoConfig.siteName && (
        <meta property="og:site_name" content={seoConfig.siteName} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      {d && <meta name="twitter:description" content={d} />}
      {fullImageUrl && <meta name="twitter:image" content={fullImageUrl} />}
      {seoConfig.twitterHandle && (
        <meta name="twitter:site" content={seoConfig.twitterHandle} />
      )}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
