import '../style/skeleton.css';

function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk sk-image"></div>
      <div className="sk-body">
        <div className="sk sk-line sk-line-sm"></div>
        <div className="sk sk-line sk-line-md"></div>
        <div className="sk sk-line sk-line-sm"></div>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 8 }) {
  return (
    <div className="sk-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

function SkeletonProductDetail() {
  return (
    <div className="at-detail">
      <div className="sk-detail">
        <div className="sk-detail-gallery">
          <div className="sk sk-detail-main"></div>
          <div className="sk-detail-thumbs">
            {[1,2,3,4].map(i => <div key={i} className="sk sk-detail-thumb"></div>)}
          </div>
        </div>
        <div className="sk-detail-info">
          <div className="sk sk-line sk-line-sm"></div>
          <div className="sk sk-line sk-line-lg"></div>
          <div className="sk sk-line sk-line-md"></div>
          <div className="sk sk-line sk-line-lg" style={{ height: 80 }}></div>
          <div className="sk sk-line sk-line-sm"></div>
          <div className="sk sk-line sk-line-lg" style={{ height: 48 }}></div>
        </div>
      </div>
    </div>
  );
}

function SkeletonHome() {
  return (
    <div className="hm-home">
      <div className="sk-hero sk-hero-dark">
        <div className="sk-hero-content">
          <div className="sk sk-badge"></div>
          <div className="sk sk-title"></div>
          <div className="sk sk-subtitle"></div>
          <div className="sk sk-btn"></div>
        </div>
      </div>
      <div className="sk-section">
        <div className="sk-categories-track">
          {[1,2,3,4].map(i => (
            <div key={i} className="sk-category-circle">
              <div className="sk sk-circle"></div>
              <div className="sk sk-line-sm"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="sk-section sk-section-white">
        <div className="sk-offers">
          <div className="sk-offer-card sk-offer-card-lg">
            <div className="sk sk-offer-image-lg"></div>
            <div className="sk-offer-body">
              <div className="sk sk-line-md"></div>
              <div className="sk sk-line-sm"></div>
            </div>
          </div>
          <div className="sk-offer-card">
            <div className="sk sk-offer-image-sm"></div>
            <div className="sk-offer-body">
              <div className="sk sk-line-md"></div>
              <div className="sk sk-line-sm"></div>
            </div>
          </div>
          {[3,4,5].map(i => (
            <div key={i} className="sk-offer-card">
              <div className="sk sk-offer-image-xs"></div>
              <div className="sk-offer-body">
                <div className="sk sk-line-md"></div>
                <div className="sk sk-line-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sk-section sk-section-white">
        <div className="sk-features">
          <div className="sk sk-feature-hero"></div>
          {[1,2,3].map(i => <div key={i} className="sk sk-feature-card"></div>)}
        </div>
      </div>
      <div className="sk-section">
        <div className="sk-process">
          {[1,2,3,4].map(i => (
            <div key={i} className="sk-process-step">
              <div className="sk sk-process-visual-block"></div>
              <div className="sk-process-body">
                <div className="sk sk-line-lg" style={{ height: 40 }}></div>
                <div className="sk sk-line-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sk-stats-bar">
        <div className="sk-stats-bar-inner">
          {[1,2,3,4].map(i => (
            <div key={i} className="sk-stat-item-s">
              <div className="sk sk-stat-num"></div>
              <div className="sk sk-stat-label"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk sk-line sk-line-lg" style={{ height: 40 }}></div>
      ))}
    </div>
  );
}

function SkeletonFeatured() {
  return (
    <div className="at-featured" style={{ opacity: 0.6, pointerEvents: 'none' }}>
      <div className="at-featured-header">
        <div>
          <div className="sk sk-line sk-line-md" style={{ width: 200 }}></div>
          <div className="sk sk-line sk-line-sm" style={{ width: 140, marginTop: 6 }}></div>
        </div>
      </div>
      <div className="at-featured-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="sk-card">
            <div className="sk sk-image" style={{ aspectRatio: '1/1' }}></div>
            <div className="sk-body">
              <div className="sk sk-line sk-line-sm"></div>
              <div className="sk sk-line sk-line-sm" style={{ width: '60%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SkeletonCard, SkeletonGrid, SkeletonProductDetail, SkeletonHome, SkeletonTable, SkeletonFeatured };
