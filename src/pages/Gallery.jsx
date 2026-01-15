// src/pages/Gallery.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import galleryData from "../config/galleryData";
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import PhotoViewer from "../components/PhotoViewer";
import "../css/Gallery.css";

export default function Gallery() {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // PhotoViewer uses this
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]); // [] = All
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // "newest" | "oldest" | "title-asc" | "title-desc"
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setSelectedCategories([]); // show all categories, but filtered by tag
    setCurrentPage(1);
    setLightboxIndex(null); // close viewer so they see filtered grid
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
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchFiltered = useMemo(() => {
    if (!normalizedSearch) return categoryFiltered;

    return categoryFiltered.filter((img) => {
      const title = img.title || "";
      const category = img.category || "";
      const tags = (img.tags || []).join(" ");
      const haystack = `${title} ${category} ${tags}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [categoryFiltered, normalizedSearch]);

  // 3) Sort
  const filteredImages = useMemo(() => {
    return [...searchFiltered].sort((a, b) => {
      if (sortOption === "newest" || sortOption === "oldest") {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        if (Number.isNaN(da) || Number.isNaN(db)) return 0;
        return sortOption === "newest" ? db - da : da - db;
      }

      const ta = (a.title || "").toLowerCase();
      const tb = (b.title || "").toLowerCase();
      if (sortOption === "title-asc") return ta.localeCompare(tb);
      if (sortOption === "title-desc") return tb.localeCompare(ta);
      return 0;
    });
  }, [searchFiltered, sortOption]);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleImages = filteredImages.slice(startIndex, startIndex + itemsPerPage);

  const allSelected = selectedCategories.length === 0;

  // Close viewer whenever the underlying set could change
  useEffect(() => {
    setLightboxIndex(null);
  }, [selectedCategories, searchTerm, sortOption, itemsPerPage, currentPage]);

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

  const openViewer = (absoluteIndex) => setLightboxIndex(absoluteIndex);

  return (
    <main className="gallery-page">
      <SEO
        title="Gallery — MySite"
        description="Gallery — Description"
        keywords={seoConfig.keywords}
      />
      <h1>Gallery</h1>

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
            placeholder="Search for images.."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
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
        {visibleImages.map((img, idx) => (
          <div
            key={img.id}
            className="gallery-item"
            onClick={() => openViewer(startIndex + idx)}
          >
            <div className="gallery-image-wrapper">
              <img src={img.src} alt={img.title} loading="lazy" />
            </div>
            <div className="gallery-title">{img.title}</div>
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

      {/* PhotoViewer (replaces old Lightbox) */}
      <PhotoViewer
        images={filteredImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={(i) => setLightboxIndex(i)}
        allowTagClick
        onTagClick={handleTagClick}
        quoteTo="/contact"
        quoteButtonLabel="Get Quote"
      />
    </main>
  );
}
