import { Award, Users } from 'lucide-react';
import { ProfileSummary } from '@/components/features/profile/ProfileSummary.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { currentUser } from '@/lib/constants.js';
import { useAuthStore } from '@/stores/authStore.js';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user) ?? currentUser;
  return (
    <section className="page stack">
      <ProfileSummary user={user} />
      <div className="grid two">
        <Card className="stack">
          <h2><Award size={20} aria-hidden="true" /> Achievements</h2>
          <p className="muted">Hackathon winner, security meetup host, GDGC study jam mentor.</p>
        </Card>
        <Card className="stack">
          <h2><Users size={20} aria-hidden="true" /> Communities</h2>
          <p className="muted">GDGC PCCOE, ACM PCCOE, NSS PCCOE</p>
        </Card>
      </div>
    </section>
  );
}
