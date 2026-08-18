import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import { useUiStore } from '@/stores/uiStore.js';

const LoginPage = lazy(() => import('@/pages/LoginPage.jsx'));
const LandingPage = lazy(() => import('@/pages/LandingPage.jsx'));
const DemoLoginPage = lazy(() => import('@/pages/DemoLoginPage.jsx'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage.jsx'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage.jsx'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage.jsx'));
const CommunitiesPage = lazy(() => import('@/pages/CommunitiesPage.jsx'));
const CommunityDetailPage = lazy(() => import('@/pages/CommunityDetailPage.jsx'));
const ConnectPage = lazy(() => import('@/pages/ConnectPage.jsx'));
const XDPage = lazy(() => import('@/pages/XDPage.jsx'));
const ArcadePage = lazy(() => import('@/pages/ArcadePage.jsx'));
const HeadsUpPage = lazy(() => import('@/pages/HeadsUpPage.jsx'));
const MapPage = lazy(() => import('@/pages/MapPage.jsx'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage.jsx'));
const FriendsPage = lazy(() => import('@/pages/FriendsPage.jsx'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage.jsx'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.jsx'));

function Splash() {
  return (
    <div className="content stack">
      <Skeleton height={36} width="40%" />
      <Skeleton height={160} />
      <Skeleton height={160} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const preventDefaultTools = (event) => {
      const key = event.key.toLowerCase();
      if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) || (event.ctrlKey && key === 'u')) {
        event.preventDefault();
      }
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    const preventContext = (event) => event.preventDefault();
    document.addEventListener('keydown', preventDefaultTools);
    document.addEventListener('contextmenu', preventContext);
    return () => {
      document.removeEventListener('keydown', preventDefaultTools);
      document.removeEventListener('contextmenu', preventContext);
    };
  }, [setSearchOpen]);

  return (
    <BrowserRouter>
      <Suspense fallback={<Splash />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/demo" element={<DemoLoginPage />} />
          <Route path="/demo-login" element={<DemoLoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dashboard/communities" element={<CommunitiesPage />} />
            <Route path="dashboard/communities/:communityId" element={<CommunityDetailPage />} />
            <Route path="dashboard/connect" element={<ConnectPage />} />
            <Route path="dashboard/connect/:chatId" element={<ConnectPage />} />
            <Route path="dashboard/xd" element={<XDPage />} />
            <Route path="dashboard/xd/:postId" element={<XDPage />} />
            <Route path="dashboard/arcade" element={<ArcadePage />} />
            <Route path="dashboard/headsup" element={<HeadsUpPage />} />
            <Route path="dashboard/map" element={<MapPage />} />
            <Route path="dashboard/calendar" element={<CalendarPage />} />
            <Route path="dashboard/friends" element={<FriendsPage />} />
            <Route path="dashboard/profile" element={<ProfilePage />} />
            <Route path="dashboard/profile/:userId" element={<ProfilePage />} />
            <Route path="dashboard/settings" element={<SettingsPage />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="communities/:communityId" element={<CommunityDetailPage />} />
            <Route path="connect" element={<ConnectPage />} />
            <Route path="connect/:chatId" element={<ConnectPage />} />
            <Route path="xd" element={<XDPage />} />
            <Route path="xd/:postId" element={<XDPage />} />
            <Route path="arcade" element={<ArcadePage />} />
            <Route path="headsup" element={<HeadsUpPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
