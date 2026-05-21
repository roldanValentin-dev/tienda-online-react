import '../style/skeleton.css';
// Skeleton para tarjeta de producto
function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-image"></div>
            <div className="skeleton-body">
                <div className="skeleton skeleton-badge"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-button"></div>
            </div>
        </div>
    );
}

// Skeleton para grid de productos
function SkeletonGrid({ count = 8 }) {
    return (
        <div className="products-grid">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}

// Skeleton para detalle de producto
function SkeletonProductDetail() {
    return (
        <div className="detail-page">
            <div className="container-custom">
                <div className="skeleton skeleton-breadcrumb"></div>
                
                <div className="detail-container">
                    <div className="detail-grid">
                        {/* Galería */}
                        <div className="skeleton-gallery">
                            <div className="skeleton skeleton-gallery-main"></div>
                            <div className="skeleton-gallery-thumbs">
                                <div className="skeleton skeleton-thumb"></div>
                                <div className="skeleton skeleton-thumb"></div>
                                <div className="skeleton skeleton-thumb"></div>
                                <div className="skeleton skeleton-thumb"></div>
                            </div>
                        </div>
                        
                        {/* Info */}
                        <div className="skeleton-detail-info">
                            <div className="skeleton skeleton-category-badge"></div>
                            <div className="skeleton skeleton-detail-title"></div>
                            <div className="skeleton skeleton-detail-title-short"></div>
                            <div className="skeleton skeleton-detail-price"></div>
                            <div className="skeleton skeleton-description"></div>
                            <div className="skeleton skeleton-quantity"></div>
                            <div className="skeleton skeleton-btn-large"></div>
                            <div className="skeleton skeleton-btn-medium"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton para Home
function SkeletonHome() {
    return (
        <div className="home-page">
            <section className="skeleton-hero">
                <div className="hero-content">
                    <div className="skeleton skeleton-hero-badge"></div>
                    <div className="skeleton skeleton-hero-title"></div>
                    <div className="skeleton skeleton-hero-subtitle"></div>
                    <div className="skeleton skeleton-hero-button"></div>
                    <div className="skeleton skeleton-hero-rating"></div>
                </div>
            </section>

            <section className="stats-section">
                <div className="container-custom">
                    <div className="stats-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="stat-card">
                                <div className="skeleton skeleton-stat-number"></div>
                                <div className="skeleton skeleton-stat-label"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="categories-section">
                <div className="container-custom">
                    <div className="section-header">
                        <div className="skeleton skeleton-section-tag" style={{ margin: '0 auto 12px' }}></div>
                        <div className="skeleton skeleton-section-title"></div>
                        <div className="skeleton skeleton-section-subtitle"></div>
                    </div>
                    <div className="categories-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton skeleton-category-image"></div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container-custom">
                    <div className="features-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton-feature-card">
                                <div className="skeleton skeleton-feature-icon"></div>
                                <div className="skeleton skeleton-feature-title"></div>
                                <div className="skeleton skeleton-feature-description"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

// Skeleton para tabla de pedidos
function SkeletonTable({ rows = 5 }) {
    return (
        <div className="table-skeleton">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="skeleton-row">
                    <div className="skeleton skeleton-cell-sm"></div>
                    <div className="skeleton skeleton-cell-md"></div>
                    <div className="skeleton skeleton-cell-md"></div>
                    <div className="skeleton skeleton-cell-md"></div>
                    <div className="skeleton skeleton-cell-sm"></div>
                    <div className="skeleton skeleton-cell-sm"></div>
                    <div className="skeleton skeleton-cell-sm"></div>
                </div>
            ))}
        </div>
    );
}

export { SkeletonCard, SkeletonGrid, SkeletonProductDetail, SkeletonHome, SkeletonTable };
