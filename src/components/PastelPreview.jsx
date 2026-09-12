function PastelPreview({ size = 'medium', message = '' }) {
  const sizes = { small: { w: 200, h: 240, lw: 140 }, medium: { w: 240, h: 260, lw: 170 }, large: { w: 280, h: 280, lw: 200 } };
  const s = sizes[size] || sizes.medium;

  return (
    <svg viewBox={`0 0 ${s.w} ${s.h}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: 300 }}>
      <defs>
        <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#b89530" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c2415" />
          <stop offset="100%" stopColor="#2a180e" />
        </linearGradient>
      </defs>
      <ellipse cx={s.w / 2} cy={s.h - 8} rx={s.w / 2 - 10} ry={6} fill="rgba(0,0,0,0.06)" />
      <rect x={(s.w - s.lw) / 2} y={s.h - 60} width={s.lw} height={50} rx={4} fill="url(#boxGrad)" />
      <rect x={(s.w - s.lw + 8)} y={s.h - 55} width={s.lw - 16} height={40} rx={2} fill="rgba(0,0,0,0.06)" />
      <rect x={(s.w - s.lw - 12)} y={s.h - 68} width={s.lw + 24} height={16} rx={4} fill="url(#lidGrad)" />
      <rect x={(s.w - s.lw - 4)} y={s.h - 64} width={s.lw + 8} height={8} rx={2} fill="rgba(255,255,255,0.08)" />
      {message && (
        <text
          x={s.w / 2}
          y={s.h - 28}
          textAnchor="middle"
          fontFamily="DM Sans"
          fontSize={11}
          fontWeight="500"
          fill="rgba(255,255,255,0.9)"
        >
          {message.length > 16 ? message.slice(0, 16) + '…' : message}
        </text>
      )}
      <text x={s.w / 2} y={s.h - 12} textAnchor="middle" fontFamily="DM Sans" fontSize={9} fill="var(--text-muted)">
        {size === 'small' ? 'Individual' : size === 'large' ? 'Familiar' : 'Mediano'}
      </text>
    </svg>
  );
}

export default PastelPreview;
