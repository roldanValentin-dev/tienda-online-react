function svgPlaceholder(width, height, text) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect fill="#f0ebe3" width="${width}" height="${height}"/>
        <text fill="#c4b5a5" font-family="sans-serif" font-size="${Math.min(width, height) * 0.12}" 
              x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${text || ''}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const PLACEHOLDER_PRODUCT = svgPlaceholder(300, 200, 'Sin imagen');
export const PLACEHOLDER_CART = svgPlaceholder(150, 150);
export const PLACEHOLDER_THUMB = svgPlaceholder(80, 80);
