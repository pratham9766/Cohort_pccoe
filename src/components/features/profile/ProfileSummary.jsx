import { Github, Linkedin, Pencil } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

export function ProfileSummary({ user }) {
  return (
    <Card className="profile-hero">
      <Avatar src={user.avatar_url} fallback={user.full_name} size="xl" online />
      <div className="profile-copy">
        <h1>{user.full_name}</h1>
        <p className="muted">Year {user.year} · {user.branch} · Division {user.division}</p>
        <p>{user.bio}</p>
        <div className="cluster">
          {(user.skills ?? []).map((skill) => <Badge key={skill} variant="neutral">{skill}</Badge>)}
        </div>
      </div>
      <div className="profile-actions">
        <Button icon={Pencil}>Edit Profile</Button>
        <Button variant="ghost" icon={Github} aria-label="GitHub" />
        <Button variant="ghost" icon={Linkedin} aria-label="LinkedIn" />
      </div>
    </Card>
  );
}
