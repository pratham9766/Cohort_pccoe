import { Card } from '@/components/ui/Card.jsx';
import { Input } from '@/components/ui/Input.jsx';

export default function SettingsPage() {
  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1 className="page-title">Account preferences</h1>
        </div>
      </div>
      <Card className="stack">
        <Input label="Allowed domains" defaultValue="pccoe.org,pccoepune.org" />
        <label className="cluster"><input type="checkbox" defaultChecked /> Browser notifications</label>
        <label className="cluster"><input type="checkbox" defaultChecked /> Dark mode</label>
      </Card>
    </section>
  );
}
