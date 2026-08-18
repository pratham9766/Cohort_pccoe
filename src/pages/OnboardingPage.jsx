import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { communities } from '@/lib/constants.js';

export default function OnboardingPage() {
  return (
    <main className="content">
      <section className="page stack">
        <div className="page-header">
          <div>
            <p className="eyebrow">Onboarding</p>
            <h1 className="page-title">Set up your campus profile</h1>
          </div>
          <Button as={Link} to="/dashboard" icon={CheckCircle2}>Finish Demo</Button>
        </div>
        <div className="grid two">
          <Card className="stack">
            <h2>Basic Info</h2>
            <Input label="Full name" defaultValue="Pratham Bokefode" />
            <Input label="Branch" defaultValue="Computer Engineering" />
            <Input label="Year" defaultValue="3" />
            <Input label="Division" defaultValue="A" />
          </Card>
          <Card className="stack">
            <h2>Pick Communities</h2>
            {communities.slice(0, 5).map((community) => (
              <label key={community.id} className="cluster">
                <input type="checkbox" defaultChecked={community.subscribed} />
                <span>{community.name}</span>
              </label>
            ))}
          </Card>
        </div>
      </section>
    </main>
  );
}
