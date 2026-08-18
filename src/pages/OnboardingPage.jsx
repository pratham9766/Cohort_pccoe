import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { useCommunities } from '@/hooks/useCampusData.js';
import { toggleCommunitySubscription, updateProfile } from '@/lib/api.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useNotificationStore } from '@/stores/notificationStore.js';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const addToast = useNotificationStore((state) => state.addToast);
  const { data: communities = [], isLoading } = useCommunities();
  const [selectedCommunities, setSelectedCommunities] = useState(() => new Set());
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    branch: user?.branch ?? '',
    year: user?.year ?? '',
    division: user?.division ?? '',
    bio: user?.bio ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = useMemo(() => form.full_name.trim() && form.branch.trim() && Number(form.year) >= 1 && Number(form.year) <= 4, [form]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleSelection(communityId) {
    setSelectedCommunities((current) => {
      const next = new Set(current);
      if (next.has(communityId)) next.delete(communityId);
      else next.add(communityId);
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit) {
      addToast('Please complete name, branch, and year before continuing.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const saved = await updateProfile({
        ...form,
        full_name: form.full_name.trim(),
        branch: form.branch.trim(),
        division: form.division.trim(),
        bio: form.bio.trim(),
        is_onboarded: true,
      });
      await Promise.all([...selectedCommunities].map((communityId) => toggleCommunitySubscription(communityId, saved.id)));
      setUser(saved);
      addToast('Profile saved. Welcome to Cohort PCCOE.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="content">
      <form className="page stack" onSubmit={submit}>
        <div className="page-header">
          <div>
            <p className="eyebrow">Onboarding</p>
            <h1 className="page-title">Set up your campus profile</h1>
          </div>
          <Button type="submit" icon={CheckCircle2} disabled={submitting || !canSubmit}>
            {submitting ? 'Saving...' : 'Finish Setup'}
          </Button>
        </div>
        <div className="grid two">
          <Card className="stack">
            <h2>Basic Info</h2>
            <Input label="Full name" value={form.full_name} onChange={(event) => updateField('full_name', event.target.value)} required />
            <Input label="Branch" value={form.branch} onChange={(event) => updateField('branch', event.target.value)} required />
            <Input label="Year" type="number" min="1" max="4" value={form.year} onChange={(event) => updateField('year', event.target.value)} required />
            <Input label="Division" value={form.division} onChange={(event) => updateField('division', event.target.value)} />
            <label className="field">
              <span>Bio</span>
              <textarea className="input textarea-input" value={form.bio} rows={4} onChange={(event) => updateField('bio', event.target.value)} />
            </label>
          </Card>
          <Card className="stack">
            <h2>Pick Communities</h2>
            {isLoading ? <p className="muted">Loading communities...</p> : null}
            {communities.slice(0, 6).map((community) => (
              <label key={community.id} className="cluster">
                <input type="checkbox" checked={selectedCommunities.has(community.id)} onChange={() => toggleSelection(community.id)} />
                <span>{community.name}</span>
              </label>
            ))}
          </Card>
        </div>
      </form>
    </main>
  );
}
