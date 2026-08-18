import { Search } from 'lucide-react';
import { CampusMap } from '@/components/features/map/CampusMap.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { useCampusLocations } from '@/hooks/useCampusData.js';

export default function MapPage() {
  const { data = [] } = useCampusLocations();

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Campus Map</p>
          <h1 className="page-title">PCCOE locations</h1>
        </div>
      </div>
      <Input icon={Search} placeholder="Search labs, classrooms, canteen..." />
      <CampusMap locations={data} />
    </section>
  );
}
