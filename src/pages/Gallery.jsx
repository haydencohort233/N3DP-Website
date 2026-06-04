// src/pages/Gallery.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toSlug } from "./Shop";
import galleryData from "../config/galleryData";
import SEO from "../components/SEO";
import config from "../config";
import GalleryModal from "../components/GalleryModal";
import "../css/Gallery.css";

export default function Gallery() {
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);

  // PhotoViewer
  const [lightboxEntry, setLightboxEntry] = useState(null);
  const [photoNotFound, setPhotoNotFound] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState(() => {
  const category = searchParams.get("category");
    return category ? [category] : [];
  }); // [] = All
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // "newest" | "oldest" | "title-asc" | "title-desc"
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setSelectedCategories([]);
    setCurrentPage(1);
    setLightboxEntry(null);
  };

  // Build category counts from full data
  const categoryCounts = useMemo(() => {
    return galleryData.reduce((acc, item) => {
      const cat = item.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  }, []);

  // 1) Filter by category ([] = all)
  const categoryFiltered = useMemo(() => {
    return selectedCategories.length === 0
      ? galleryData
      : galleryData.filter((img) =>
          selectedCategories.includes(img.category || "Uncategorized")
        );
  }, [selectedCategories]);

  // 2) Filter by search (title, category, tags only)
  function buildSearchText(item) {
    const parts = [];

  // top-level fields
  parts.push(item.title || "");
  parts.push(item.category || "");
  parts.push(item.description || "");
  if (Array.isArray(item.tags)) parts.push(item.tags.join(" "));

  // per-photo fields (your new system)
  if (Array.isArray(item.photos)) {
    for (const p of item.photos) {
      if (!p) continue;
      parts.push(p.label || "");
      parts.push(p.title || "");
      parts.push(p.description || "");
      if (Array.isArray(p.tags)) parts.push(p.tags.join(" "));
    }
  }

  // optional legacy support: images array (strings/objects)
  if (Array.isArray(item.images)) {
    for (const im of item.images) {
      if (!im) continue;
      if (typeof im === "string") continue;
      parts.push(im.label || "");
      parts.push(im.title || "");
      parts.push(im.description || "");
      if (Array.isArray(im.tags)) parts.push(im.tags.join(" "));
    }
  }

  return parts.join(" ").toLowerCase();
}

function normalizePhotosForSearch(item) {
  if (Array.isArray(item.photos) && item.photos.length) {
    return item.photos
      .filter((p) => p && p.src)
      .map((p) => ({
        src: p.src,
        title: p.title || "",
        description: p.description || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        label: p.label || "",
      }));
  }

  if (Array.isArray(item.images) && item.images.length) {
    return item.images
      .map((im) => (typeof im === "string" ? { src: im } : im))
      .filter((p) => p && p.src)
      .map((p) => ({
        src: p.src,
        title: p.title || "",
        description: p.description || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        label: p.label || "",
      }));
  }

  return item?.src ? [{ src: item.src, title: "", description: "", tags: [], label: "" }] : [];
}

function buildSearchEntries(items) {
  const entries = [];
  items.forEach((item, itemIndex) => {
    const photos = normalizePhotosForSearch(item);

    photos.forEach((p, photoIndex) => {
      const displayTitle = (p.title && p.title.trim()) ? p.title : (item.title || "");
      const searchText = [
        displayTitle,
        item.category || "",
        item.description || "",
        (Array.isArray(item.tags) ? item.tags.join(" ") : ""),
        p.label || "",
        p.title || "",
        p.description || "",
        (Array.isArray(p.tags) ? p.tags.join(" ") : ""),
      ].join(" ").toLowerCase();

      entries.push({
        key: `${item.id || itemIndex}-${photoIndex}-${p.src}`,
        itemIndex,
        photoIndex,
        displaySrc: p.src,
        displayTitle,
        date: item.date || "",
        category: item.category || "Uncategorized",
        searchText,
      });
    });
  });
  return entries;
}

const normalizedSearch = searchTerm.trim().toLowerCase();

const entriesAll = useMemo(
  () => buildSearchEntries(categoryFiltered),
  [categoryFiltered]
);

const searchEntries = useMemo(() => {
  if (!normalizedSearch) return entriesAll;
  return entriesAll.filter((e) => e.searchText.includes(normalizedSearch));
}, [entriesAll, normalizedSearch]);

const filteredEntries = useMemo(() => {
  return [...searchEntries].sort((a, b) => {
    if (sortOption === "newest" || sortOption === "oldest") {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return sortOption === "newest" ? db - da : da - db;
    }

    const ta = (a.displayTitle || "").toLowerCase();
    const tb = (b.displayTitle || "").toLowerCase();
    if (sortOption === "title-asc") return ta.localeCompare(tb);
    if (sortOption === "title-desc") return tb.localeCompare(ta);
    return 0;
  });
}, [searchEntries, sortOption]);

const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const visibleEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const allSelected = selectedCategories.length === 0;

  // Close viewer whenever the underlying set could change
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setLightboxEntry(null);
  }, [selectedCategories, searchTerm, sortOption, itemsPerPage, currentPage]);

useEffect(() => {
  setSearchParams(prev => {
    const next = new URLSearchParams(prev);
    if (selectedCategories.length === 1) {
      next.set("category", selectedCategories[0]);
    } else {
      next.delete("category");
    }
    return next; // preserves ?photo= if present
  }, { replace: true });
}, [selectedCategories, setSearchParams]);

  // Close filter popover when clicking outside
  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

useEffect(() => {
  const photoParam = searchParams.get("photo");
  if (!photoParam || !galleryData.length) return;

  const match = galleryData.find(item => toSlug(item.title) === toSlug(photoParam));
  if (match) {
    const itemIndex = galleryData.indexOf(match);
    setLightboxEntry({ itemIndex, photoIndex: 0 });
  } else {
    setPhotoNotFound(true);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("photo");
      return next;
    }, { replace: true });
  }
}, []); // ← empty array, runs once on mount only

// Add this effect to keep URL in sync:
useEffect(() => {
  if (lightboxEntry !== null) {
    const item = galleryData[lightboxEntry.itemIndex];
    if (item) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev); // preserve ?category=
        next.set("photo", toSlug(item.title));
        return next;
      }, { replace: true });
    }
  } else {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("photo");
      return next;
    }, { replace: true });
  }
}, [lightboxEntry]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      return [...prev, cat];
    });
    setCurrentPage(1);
  };

  const clearCategories = () => {
    setSelectedCategories([]); // back to All
    setCurrentPage(1);
  };

  return (
    <main className="gallery-page">
    <SEO
      title={
        lightboxEntry !== null && galleryData[lightboxEntry.itemIndex]
          ? `${galleryData[lightboxEntry.itemIndex].title} — ${config.site.name}`
          : selectedCategories.length === 1
            ? `${selectedCategories[0]} 3D Prints — ${config.site.name}`
            : `Gallery — ${config.site.name}`
      }
      description={
        lightboxEntry !== null && galleryData[lightboxEntry.itemIndex]
          ? galleryData[lightboxEntry.itemIndex].description
          : selectedCategories.length === 1
            ? `Browse our ${selectedCategories[0]} 3D printed creations.`
            : "Browse recent 3D prints and prototypes from our Nashville shop."
      }
      image={
        lightboxEntry !== null && galleryData[lightboxEntry.itemIndex]
          ? galleryData[lightboxEntry.itemIndex].src
          : undefined
      }
    />
    <h1>Gallery</h1>
    {photoNotFound && (
      <div className="gallery-not-found">
        <span>That photo wasn't found — it may have been removed or renamed.</span>
        <button onClick={() => setPhotoNotFound(false)}>✕</button>
      </div>
    )}

      {/* Row 1: Filters + Display-per-page */}
      <div className="gallery-header">
        {/* Filter button + popover */}
        <div className="gallery-filter-wrapper" ref={filterRef}>
          <button
            className="gallery-filter-button"
            onClick={() => setIsFilterOpen((o) => !o)}
          >
            <span className="gallery-filter-icon">⚙</span>
            <span>Filter</span>
            <span className="gallery-filter-summary">
              {allSelected ? "All" : `${selectedCategories.length} selected`}
            </span>
            <span className="gallery-filter-caret">▾</span>
          </button>

          {isFilterOpen && (
            <div className="gallery-filter-popover">
              <div className="gallery-filter-header">
                <span>Filter by category</span>
                <button
                  className="gallery-filter-close"
                  onClick={() => setIsFilterOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="gallery-filter-list">
                {/* All categories */}
                <label className="gallery-filter-option">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      if (e.target.checked) clearCategories();
                    }}
                  />
                  <span>All categories ({galleryData.length})</span>
                </label>

                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <label key={cat} className="gallery-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span>
                      {cat} ({count})
                    </span>
                  </label>
                ))}
              </div>

              <div className="gallery-filter-footer">
                <button className="gallery-filter-clear" onClick={clearCategories}>
                  Clear
                </button>
                <button
                  className="gallery-filter-done"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Display-Per-Page */}
        <div className="gallery-controls">
          <label htmlFor="perPageSelect">Per page:</label>
          <select
            id="perPageSelect"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Row 2: Search + Sort */}
      <div className="gallery-toolbar">
        <div className="gallery-search">
          <input
            type="text"
            placeholder="Search titles, tags, categories..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          {searchTerm.trim() !== "" && (
            <button
              type="button"
              className="gallery-search-clear"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              aria-label="Clear search"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>

        <div className="gallery-sort">
          <label htmlFor="sortSelect">Sort:</label>
          <select
            id="sortSelect"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
          </select>
        </div>
      </div>

      {/* Grid */}
    <div className="gallery-grid">
      {visibleEntries.map((e) => (
        <div
          key={e.key}
          className="gallery-item"
          onClick={() => {
            setLightboxEntry(e);
            setPhotoNotFound(false);
          }}
        >
          <div className="gallery-image-wrapper">
            <img src={e.displaySrc} alt={e.displayTitle} loading="lazy" />
          </div>
          <div className="gallery-title">{e.displayTitle}</div>
        </div>
      ))}
    </div>

      {/* Pagination */}
      <div className="gallery-pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

{lightboxEntry !== null && (
  <GalleryModal
    images={categoryFiltered}
    index={lightboxEntry?.itemIndex ?? null}
      initialPhotoIndex={lightboxEntry?.photoIndex ?? 0}
      onClose={() => setLightboxEntry(null)}
      onIndexChange={(newItemIndex) => {
        // when they arrow next/prev item, start on the first photo
        setLightboxEntry({ itemIndex: newItemIndex, photoIndex: 0 });
      }}
      allowTagClick
      onTagClick={handleTagClick}
      quoteTo="/order"
      quoteButtonLabel="Order"
    />
    )}
    </main>
  );
}
