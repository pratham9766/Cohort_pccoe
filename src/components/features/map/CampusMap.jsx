import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';

export function CampusMap({ locations }) {
  return (
    <section className="campus-map">
      <div className="map-canvas glass-card" role="img" aria-label="PCCOE campus map preview">
        <svg className="map-routes" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12 42 C28 36 34 34 48 28 S66 23 83 15" />
          <path d="M48 28 L58 44 L63 52" />
          <path d="M48 28 L42 17 L50 6" />
        </svg>
        {locations.map((location, index) => (
          <span key={location.id} className={`map-pin pin-${index + 1}`} title={location.name}>
            <MapPin size={22} aria-hidden="true" />
          </span>
        ))}
        <span className="map-node node-a" />
        <span className="map-node node-b" />
        <span className="map-node node-c" />
        <span className="map-node node-d" />
      </div>
      <div className="grid two">
        {locations.map((location) => (
          <Card key={location.id} hover>
            <h3>{location.name}</h3>
            <p className="muted">{location.building} · {location.floor}</p>
            <p>{location.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
