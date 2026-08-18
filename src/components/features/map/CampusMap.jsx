import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';

const PCCOE_MAP_QUERY = 'Pimpri Chinchwad College of Engineering, Akurdi, Pune';
const PCCOE_MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(PCCOE_MAP_QUERY)}&output=embed`;
const PCCOE_MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PCCOE_MAP_QUERY)}`;

export function CampusMap({ locations }) {
  return (
    <section className="campus-map">
      <div className="map-canvas glass-card">
        <iframe
          title="PCCOE campus map"
          src={PCCOE_MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
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
