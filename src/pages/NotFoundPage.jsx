import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

export default function NotFoundPage() {
  return (
    <main className="content">
      <Card className="stack">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="muted">This route is not part of the Cohort PCCOE flow.</p>
        <Button as={Link} to="/dashboard">Go Home</Button>
      </Card>
    </main>
  );
}
