import { Camera, Edit3, LogOut, Mail, MessageSquare, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { useAuthStore } from '@/stores/authStore.js';

export function ProfileSummary({ user }) {
  const signOut = useAuthStore((state) => state.signOut);
  const displayName = user.full_name ?? 'Cohort User';
  const handle = user.username ?? displayName.toLowerCase().replaceAll(' ', '');
  const fallback = displayName.trim().charAt(0).toUpperCase() || 'C';

  return (
    <section className="profile-cover-panel">
      <div className="profile-cover-art">
        <img className="profile-cover-sticker" src="/stickers/spider-hang.jpeg" alt="" aria-hidden="true" />
        <div className="profile-user-chip">
          <img src="/cohort-logo.png" alt="" />
          <span>Cohort user</span>
          <strong aria-hidden="true">✓</strong>
        </div>
      </div>

      <div className="profile-identity-row">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {user.avatar_url ? <img src={user.avatar_url} alt={displayName} /> : fallback}
          </div>
          <button type="button" className="profile-camera" aria-label="Update profile photo">
            <Camera size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="profile-copy">
          <h1>{displayName}</h1>
          <p>@{handle}</p>
        </div>

        <div className="profile-actions">
          <Button variant="secondary" icon={Edit3} aria-label="Edit profile" />
          <Button variant="secondary" icon={Linkedin} aria-label="LinkedIn" />
          <Button variant="secondary" icon={MessageSquare} aria-label="Message" />
          <Button variant="secondary" icon={Mail} aria-label="Email" />
          <Button variant="secondary" icon={LogOut} className="profile-signout" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </section>
  );
}
