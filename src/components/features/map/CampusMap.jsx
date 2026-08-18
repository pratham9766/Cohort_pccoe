import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';

export function CampusMap({ locations }) {
  return (
    <section className="campus-map">
      <div className="map-canvas glass-card" role="img" aria-label="PCCOE campus map preview">
        {locations.map((location, index) => (
          <span key={location.id} className={`map-pin pin-${index + 1}`} title={location.name}>
            <MapPin size={22} aria-hidden="true" />
          </span>
        ))}
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
