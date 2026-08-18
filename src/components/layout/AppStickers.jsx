const stickers = [
  { className: 'sticker-home-top', src: '/stickers/spider-hang.jpeg', alt: '' },
  { className: 'sticker-home-left', src: '/stickers/spider-sit.jpeg', alt: '' },
  { className: 'sticker-home-bottom', src: '/stickers/spider-dive.jpeg', alt: '' },
];

export function AppStickers() {
  return (
    <div className="app-stickers" aria-hidden="true">
      {stickers.map((sticker) => (
        <img key={sticker.className} className={`app-sticker ${sticker.className}`} src={sticker.src} alt={sticker.alt} />
      ))}
    </div>
  );
}
