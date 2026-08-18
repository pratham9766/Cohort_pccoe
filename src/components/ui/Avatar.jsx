const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 };

export function Avatar({ src, fallback = 'CP', size = 'md', online = false, alt = '' }) {
  const px = sizes[size] ?? sizes.md;
  return (
    <span className={`avatar ${online ? 'avatar-online' : ''}`} style={{ width: px, height: px, fontSize: Math.max(11, px / 2.8) }}>
      {src ? <img src={src} alt={alt} /> : fallback.slice(0, 2).toUpperCase()}
    </span>
  );
}
