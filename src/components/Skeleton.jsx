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
            {/* Hero Skeleton */}
            <section className="skeleton-hero">
                <div className="hero-content">
                    <div className="skeleton skeleton-hero-title"></div>
                    <div className="skeleton skeleton-hero-subtitle"></div>
                    <div className="skeleton skeleton-hero-button"></div>
                </div>
            </section>
            
            {/* Categories Skeleton */}
            <section className="categories-section">
                <div className="container-custom">
                    <div className="skeleton skeleton-section-title"></div>
                    <div className="skeleton skeleton-section-subtitle"></div>
                    <div className="categories-grid">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="skeleton-category-btn">
                                <div className="skeleton skeleton-category-icon"></div>
                                <div className="skeleton skeleton-category-name"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Features Skeleton */}
            <section className="features-section">
                <div className="container-custom">
                    <div className="features-grid">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="skeleton-feature-card">
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

export { SkeletonCard, SkeletonGrid, SkeletonProductDetail, SkeletonHome };
