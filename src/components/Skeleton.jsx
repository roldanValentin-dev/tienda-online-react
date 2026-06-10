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
    <div className="at-home">
      <div className="sk-hero">
        <div className="sk-hero-content">
          <div className="sk sk-badge"></div>
          <div className="sk sk-title"></div>
          <div className="sk sk-subtitle"></div>
          <div className="sk sk-btn"></div>
        </div>
      </div>
      <div className="sk-stats">
        {[1,2,3,4].map(i => (
          <div key={i} className="sk-stat">
            <div className="sk sk-stat-num"></div>
            <div className="sk sk-stat-label"></div>
          </div>
        ))}
      </div>
      <div className="sk-categories">
        {[1,2].map(i => <div key={i} className="sk sk-cat"></div>)}
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
