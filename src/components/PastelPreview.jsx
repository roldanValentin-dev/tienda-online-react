function PastelPreview({ frosting = '#c9a84c', layers = 3, size = 'medium', message = '' }) {
  const layerColors = ['#d4a5a5', '#c17f4e', '#c9a84c', '#8b7355'];
  const sizes = { small: { w: 200, h: 260, lw: 160 }, medium: { w: 240, h: 280, lw: 200 }, large: { w: 280, h: 300, lw: 240 } };
  const s = sizes[size] || sizes.medium;

  return (
    <svg viewBox={`0 0 ${s.w} ${s.h}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: 300 }}>
      <defs>
        <linearGradient id="f-frost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={frosting} />
          <stop offset="100%" stopColor={adjustColor(frosting, -20)} />
        </linearGradient>
      </defs>
      <ellipse cx={s.w / 2} cy={s.h - 8} rx={s.w / 2 - 10} ry={8} fill="rgba(0,0,0,0.06)" />
      {Array.from({ length: layers }).map((_, i) => {
        const ly = s.h - 60 - i * 28;
        const lw = s.lw - i * 8;
        return (
          <rect
            key={i}
            x={(s.w - lw) / 2}
            y={ly}
            width={lw}
            height={26}
            rx={4}
            fill={layerColors[i % layerColors.length]}
          />
        );
      })}
      {[0, 1, 2].map(i => (
        <rect key={`cream-${i}`} x={(s.w - s.lw + 20 + i * 16)} y={s.h - 62 - i * 28} width={s.lw - 40 - i * 16} height={10} rx={5} fill="#fdf8f3" stroke="#e8ddd0" strokeWidth="0.5" opacity={0.8} />
      ))}
      <ellipse cx={s.w / 2} cy={s.h - 62 - (layers - 1) * 28} rx={s.lw / 2} ry={14} fill="url(#f-frost)" />
      {[0, 1, 2].map(i => (
        <circle key={`dot-${i}`} cx={s.w / 2 - 20 + i * 20} cy={s.h - 68 - (layers - 1) * 28} r={5 + i * 2} fill="#d4a5a5" />
      ))}
      {message && (
        <text
          x={s.w / 2}
          y={s.h - 40 - (layers - 1) * 28}
          textAnchor="middle"
          fontFamily="Playfair Display"
          fontSize={11}
          fontStyle="italic"
          fill="white"
        >
          {message.length > 15 ? message.slice(0, 15) + '…' : message}
        </text>
      )}
      <text x={s.w / 2} y={s.h - 16} textAnchor="middle" fontFamily="Cormorant Garamond" fontSize={10} fontStyle="italic" fill="var(--text-muted)">
        {size === 'small' ? '6 porciones' : size === 'large' ? '10 porciones' : '8 porciones'}
      </text>
    </svg>
  );
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default PastelPreview;
