import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';

const PCCOE_MAP_QUERY = 'Pimpri Chinchwad College of Engineering, Akurdi, Pune';
const PCCOE_MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PCCOE_MAP_QUERY)}`;
const PCCOE_MAP_VIEWPORT = {
  centerLatitude: 18.62862,
  centerLongitude: 73.83947,
  width: 1200,
  height: 675,
  zoom: 17,
};
const TILE_SIZE = 256;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toWorldPoint(latitude, longitude, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
}

const centerPoint = toWorldPoint(
  PCCOE_MAP_VIEWPORT.centerLatitude,
  PCCOE_MAP_VIEWPORT.centerLongitude,
  PCCOE_MAP_VIEWPORT.zoom,
);
const mapTopLeft = {
  x: centerPoint.x - PCCOE_MAP_VIEWPORT.width / 2,
  y: centerPoint.y - PCCOE_MAP_VIEWPORT.height / 2,
};

function getPinPosition(location) {
  if (!location.latitude || !location.longitude) return null;
  const point = toWorldPoint(location.latitude, location.longitude, PCCOE_MAP_VIEWPORT.zoom);

  const left = ((point.x - mapTopLeft.x) / PCCOE_MAP_VIEWPORT.width) * 100;
  const top = ((point.y - mapTopLeft.y) / PCCOE_MAP_VIEWPORT.height) * 100;

  return {
    left: `${clamp(left, 3, 97)}%`,
    top: `${clamp(top, 4, 96)}%`,
  };
}

function getVisibleTiles() {
  const firstTileX = Math.floor(mapTopLeft.x / TILE_SIZE);
  const firstTileY = Math.floor(mapTopLeft.y / TILE_SIZE);
  const lastTileX = Math.floor((mapTopLeft.x + PCCOE_MAP_VIEWPORT.width) / TILE_SIZE);
  const lastTileY = Math.floor((mapTopLeft.y + PCCOE_MAP_VIEWPORT.height) / TILE_SIZE);
  const tiles = [];

  for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
    for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
      tiles.push({
        key: `${PCCOE_MAP_VIEWPORT.zoom}-${tileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${PCCOE_MAP_VIEWPORT.zoom}/${tileX}/${tileY}.png`,
        left: `${((tileX * TILE_SIZE - mapTopLeft.x) / PCCOE_MAP_VIEWPORT.width) * 100}%`,
        top: `${((tileY * TILE_SIZE - mapTopLeft.y) / PCCOE_MAP_VIEWPORT.height) * 100}%`,
        width: `${(TILE_SIZE / PCCOE_MAP_VIEWPORT.width) * 100}%`,
        height: `${(TILE_SIZE / PCCOE_MAP_VIEWPORT.height) * 100}%`,
      });
    }
  }

  return tiles;
}

export function CampusMap({ locations }) {
  const visibleTiles = getVisibleTiles();
  const mappedLocations = locations
    .map((location) => ({ ...location, mapPosition: getPinPosition(location) }))
    .filter((location) => location.mapPosition);

  return (
    <section className="campus-map">
      <div className="map-canvas glass-card">
        <div className="map-tile-stage" role="img" aria-label="Coordinate map of PCCOE campus">
          {visibleTiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.src}
              alt=""
              draggable="false"
              loading="lazy"
              style={{
                left: tile.left,
                top: tile.top,
                width: tile.width,
                height: tile.height,
              }}
            />
          ))}
        </div>
        {mappedLocations.length > 1 ? (
          <svg className="map-coordinate-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points={mappedLocations
                .map((location) => `${Number.parseFloat(location.mapPosition.left)} ${Number.parseFloat(location.mapPosition.top)}`)
                .join(' ')}
            />
          </svg>
        ) : null}
        <div className="map-coordinate-layer" aria-label="Campus locations">
          {mappedLocations.map((location) => (
            <a
              key={location.id}
              className={`map-coordinate-pin map-coordinate-pin-${location.category ?? 'default'}`}
              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
              style={location.mapPosition}
              target="_blank"
              rel="noreferrer"
              aria-label={`Locate ${location.name}`}
            >
              <span className="map-pin-dot" aria-hidden="true" />
              <span className="map-locate-card">
                <em>Locate</em>
                <strong>{location.name}</strong>
                <span>{location.building} · {location.floor}</span>
                <small>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</small>
              </span>
              <span className="sr-only">Locate {location.name}</span>
            </a>
          ))}
        </div>
        <div className="map-overlay" aria-label="PCCOE map actions">
          <div>
            <span className="eyebrow">Live map</span>
            <h2>PCCOE, Akurdi</h2>
          </div>
          <a href={PCCOE_MAP_DIRECTIONS_URL} target="_blank" rel="noreferrer">
            <Navigation size={16} aria-hidden="true" />
            Directions
          </a>
        </div>
      </div>
      <div className="grid two">
        {locations.map((location) => (
          <Card key={location.id} hover>
            <h3><MapPin size={18} aria-hidden="true" /> {location.name}</h3>
            <p className="muted">{location.building} · {location.floor}</p>
            <p>{location.description}</p>
            {location.latitude && location.longitude ? (
              <a
                className="map-card-link"
                href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} aria-hidden="true" />
                Open pin
              </a>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
