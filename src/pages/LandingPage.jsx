import { ArrowRight, CalendarDays, MapPin, MessageSquare, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

const modules = [
  { icon: Users, title: 'Communities', copy: 'Discover official PCCOE clubs, chapters, student groups, and campus teams.' },
  { icon: MessageSquare, title: 'Connect', copy: 'Start private conversations and coordinate with classmates and teams.' },
  { icon: Sparkles, title: 'XD Board', copy: 'Share anonymous ideas, opportunities, questions, and campus moments.' },
  { icon: CalendarDays, title: 'Calendar', copy: 'Track workshops, exams, deadlines, events, and community activities.' },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="login-effects" aria-hidden="true" />
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <span><img src="/cohort-logo.png" alt="" /></span>
          <strong>Cohort PCCOE</strong>
        </Link>
        <div className="cluster">
          <Button as={Link} to="/demo" variant="ghost">Demo</Button>
          <Button as={Link} to="/login">Login</Button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">PCCOE campus platform</p>
          <h1>Cohort PCCOE</h1>
          <p className="muted">
            Discover communities, connect with peers, collaborate on opportunities, and keep the campus pulse in one secure student-led platform.
          </p>
          <div className="cluster">
            <Button as={Link} to="/login" icon={ArrowRight}>Continue with PCCOE</Button>
            <Button as={Link} to="/demo" variant="ghost">Open demo</Button>
          </div>
        </div>
        <div className="landing-orbit" aria-hidden="true">
          <div className="orbit-logo"><img src="/cohort-logo.png" alt="" /></div>
          <span className="orbit-node node-one"><Users size={20} /></span>
          <span className="orbit-node node-two"><MessageSquare size={20} /></span>
          <span className="orbit-node node-three"><MapPin size={20} /></span>
        </div>
      </section>

      <section className="landing-modules" aria-label="Platform modules">
        {modules.map((module) => (
          <Card key={module.title} hover className="landing-module">
            <module.icon size={22} aria-hidden="true" />
            <h2>{module.title}</h2>
            <p className="muted">{module.copy}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
