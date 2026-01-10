// src/pages/Gallery.jsx
import { useState, useEffect, useRef } from "react";
import galleryData from "../config/galleryData";
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import PhotoViewer from "../components/PhotoViewer";
import "../css/Gallery.css";

export default function Gallery() {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]); // [] = All
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // "newest" | "oldest" | "title-asc" | "title-desc"
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const handleTagClick = (tag) => {
  setSearchTerm(tag);
  setSelectedCategories([]);   // show all categories, but filtered by tag
  setCurrentPage(1);
  setLightboxIndex(null);      // close lightbox so they see filtered grid
};


  // Build category counts from full data
  const categoryCounts = galleryData.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // 1) Filter by category ([] = all)
  const categoryFiltered =
    selectedCategories.length === 0
      ? galleryData
      : galleryData.filter((img) =>
          selectedCategories.includes(img.category || "Uncategorized")
        );

  // 2) Filter by search (title, category, tags, description)
// Search filter (title, category, tags only)
const normalizedSearch = searchTerm.trim().toLowerCase();
const searchFiltered = !normalizedSearch
  ? categoryFiltered
  : categoryFiltered.filter((img) => {
      const title = img.title || "";
      const category = img.category || "";
      const tags = (img.tags || []).join(" ");
      const haystack = `${title} ${category} ${tags}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });


  // 3) Sort
  const filteredImages = [...searchFiltered].sort((a, b) => {
    if (sortOption === "newest" || sortOption === "oldest") {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      if (isNaN(da) || isNaN(db)) return 0;
      return sortOption === "newest" ? db - da : da - db;
    }

    const ta = (a.title || "").toLowerCase();
    const tb = (b.title || "").toLowerCase();
    if (sortOption === "title-asc") return ta.localeCompare(tb);
    if (sortOption === "title-desc") return tb.localeCompare(ta);
    return 0;
  });

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleImages = filteredImages.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const allSelected = selectedCategories.length === 0;

// Close lightbox whenever the visible set can change
useEffect(() => {
  setLightboxIndex(null);
}, [selectedCategories, searchTerm, sortOption, itemsPerPage, currentPage]);


  // Keyboard navigation within filteredImages
  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex === null) return;

      if (e.key === "ArrowRight" && lightboxIndex < filteredImages.length - 1) {
        setLightboxIndex((prev) => prev + 1);
      }
      if (e.key === "ArrowLeft" && lightboxIndex > 0) {
        setLightboxIndex((prev) => prev - 1);
      }
      if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, filteredImages.length]);

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

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = () => {
    setLightboxIndex((prev) => {
      if (prev === null || prev >= filteredImages.length - 1) return prev;
      return prev + 1;
    });
  };

  const prevImage = () => {
    setLightboxIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        const next = prev.filter((c) => c !== cat);
        return next;
      }
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
        title="Gallery — MySite"
        description="Gallery — Description"
        keywords={seoConfig.keywords} // or change for each page
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
              {allSelected
                ? "All"
                : `${selectedCategories.length} selected`}
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
                      if (e.target.checked) {
                        clearCategories();
                      }
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
                <button
                  className="gallery-filter-clear"
                  onClick={clearCategories}
                >
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
            onClick={() => openLightbox(startIndex + idx)}
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

      {/* Lightbox */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div className="lightbox" onClick={closeLightbox}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Counter */}
            <div className="lightbox-counter">
              Photo {lightboxIndex + 1} of {filteredImages.length}
            </div>

            <img src={filteredImages[lightboxIndex].src} alt="" loading="lazy" />
            <h2>{filteredImages[lightboxIndex].title}</h2>

            <div className="lightbox-info">
              <div className="lightbox-info-left">
                <p>
                  <span className="label">Date:</span>{" "}
                  {filteredImages[lightboxIndex].date}
                </p>
                <p>
                  <span className="label">Category:</span>{" "}
                  {filteredImages[lightboxIndex].category}
                </p>
{filteredImages[lightboxIndex].tags?.length > 0 && (
  <div className="tags">
    {filteredImages[lightboxIndex].tags.map((tag) => (
      <span
        key={tag}
        className="tag-chip tag-chip-clickable"
        onClick={(e) => {
          e.stopPropagation(); // don't close lightbox from background
          handleTagClick(tag);
        }}
      >
        {tag}
      </span>
    ))}
  </div>
)}

              </div>

              <div className="lightbox-info-right">
                <h3>Description</h3>
                <div className="lightbox-description">
                  {filteredImages[lightboxIndex].description}
                </div>
              </div>
            </div>

            {lightboxIndex > 0 && (
              <button className="lightbox-prev" onClick={prevImage}>
                ⟵
              </button>
            )}

            {lightboxIndex < filteredImages.length - 1 && (
              <button className="lightbox-next" onClick={nextImage}>
                ⟶
              </button>
            )}

            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
