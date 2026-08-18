import { lazy, Suspense, useState } from 'react';
import {
  CalendarDays,
  Bot,
  Eye,
  Github,
  Grid2X2,
  Heart,
  Linkedin,
  Mail,
  Map,
  MessageSquare,
  Send,
  Radio,
  Sparkles,
  Sun,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button.jsx';
import { hasSupabaseConfig } from '@/lib/supabase.js';
import { useUiStore } from '@/stores/uiStore.js';

const LiquidEther = lazy(() => import('@/components/effects/LiquidEther.jsx'));
const liquidEtherPalettes = {
  dark: ['#5227FF', '#FF9FFC', '#B497CF'],
  light: ['#d7cede', '#b385e0', '#ecd7cb'],
};

const stickers = [
  { src: '/stickers/spider-kick-color.png', className: 'sticker-swing-left' },
  { src: '/stickers/spider-mask-color.png', className: 'sticker-mask-right' },
  { src: '/stickers/spider-wordmark-color.png', className: 'sticker-wordmark-left' },
  { src: '/stickers/spider-swing-color.png', className: 'sticker-crouch-right' },
];

const communities = [
  { name: 'Art Circle', mark: 'AC' },
  { name: 'OWASP', mark: 'O' },
  { name: 'GDGC', mark: 'G' },
  { name: 'ACM', mark: 'A' },
  { name: 'LFDT', mark: 'L' },
];

const features = [
  {
    icon: Radio,
    title: 'Home Feed',
    copy: 'Stay updated with a personalized feed of posts, announcements, and discussions from your subscribed communities and friends across campus.',
  },
  {
    icon: Grid2X2,
    title: 'Communities',
    copy: 'Discover and join 30+ student-run clubs and organizations at PCCOE, from OWASP and GDGC to Art Circle and NSS.',
  },
  {
    icon: Heart,
    title: 'Friends',
    copy: 'Build your campus network by adding friends, viewing their activity, and staying connected through shared communities.',
  },
  {
    icon: MessageSquare,
    title: 'Connect',
    copy: 'Real-time encrypted messaging with end-to-end privacy. Chat one-on-one or in group conversations with fellow students.',
  },
  {
    icon: Sparkles,
    title: 'XD',
    copy: 'Post anonymous thoughts, ideas, questions, and campus moments in a fast-moving exchange board built for honest conversation.',
  },
  {
    icon: Map,
    title: 'Maps',
    copy: 'Navigate campus spaces, find key locations, and help new students move around PCCOE with confidence.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar',
    copy: 'Keep exams, workshops, club events, submission deadlines, and campus activities in one synced academic calendar.',
  },
  {
    icon: UserRound,
    title: 'Profile',
    copy: 'Create an achievement profile for certifications, hackathon wins, projects, skills, and professional campus presence.',
  },
];

const starterPrompts = [
  'What can I do on Cohort?',
  'How do I join communities?',
  'Tell me about XD board.',
];

const initialChatMessages = [
  {
    role: 'assistant',
    content: 'Hi, I am Cohort Buddy. Ask me about the platform, communities, login, campus tools, or arcade games.',
  },
];

function LandingHeader() {
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <header className="landing-header">
      <Link to="/" className="landing-brand" aria-label="Cohort home">
        <span><img src="/cohort-logo.png" alt="" /></span>
        <strong>Cohort</strong>
      </Link>
      <div className="landing-actions">
        <Button variant="ghost" className="theme-icon" aria-label="Toggle theme" onClick={toggleTheme}>
          <Sun size={18} />
        </Button>
        <Button as={Link} to="/login" variant="secondary" className="google-button">
          <span className="google-mark" aria-hidden="true">G</span>
          Sign in with Google
        </Button>
      </div>
    </header>
  );
}

function StatsPanel() {
  return (
    <div className="landing-window" aria-label="Platform analytics preview">
      <div className="window-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="stats-card">
        <p>Total project views</p>
        <div className="stats-total">
          <Eye size={46} aria-hidden="true" />
          <strong>11,678</strong>
          <span><TrendingUp size={18} /> +4.2%</span>
        </div>
        <p>Updating in realtime</p>
        <div className="stats-bars" aria-hidden="true">
          {[34, 22, 38, 52, 26, 68, 44, 58, 38, 78].map((height, index) => (
            <span key={index} style={{ '--bar-height': `${height}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialChatMessages);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (content) => {
    const text = content.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setDraft('');

    if (!hasSupabaseConfig) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'Chatbot setup is almost ready. Add Supabase env values and deploy the cohort-chatbot function first.',
        },
      ]);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cohort-chatbot`, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Chatbot is unavailable right now.');
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages([...nextMessages, { role: 'assistant', content: error.message }]);
    } finally {
      setIsSending(false);
    }
  };

  const submitMessage = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <aside className={`landing-chatbot ${isOpen ? 'open' : ''}`} aria-label="Cohort Buddy chatbot">
      {isOpen ? (
        <div className="chatbot-panel">
          <header>
            <div>
              <span><Bot size={18} aria-hidden="true" /></span>
              <strong>Cohort Buddy</strong>
            </div>
            <button type="button" aria-label="Close chatbot" onClick={() => setIsOpen(false)}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chatbot-message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {isSending ? <div className="chatbot-message assistant">Thinking...</div> : null}
          </div>

          <div className="chatbot-prompts">
            {starterPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={submitMessage}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about Cohort..."
              maxLength={500}
              aria-label="Chat message"
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim() || isSending}>
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : null}

      <button type="button" className="chatbot-launcher" aria-label="Open Cohort Buddy chatbot" onClick={() => setIsOpen(true)}>
        <Bot size={24} aria-hidden="true" />
      </button>
    </aside>
  );
}

export default function LandingPage() {
  const theme = useUiStore((state) => state.theme);
  const isLightTheme = theme === 'light';

  return (
    <main className="landing-page">
      <div className="landing-backdrop" aria-hidden="true" />
      <Suspense fallback={null}>
        <LiquidEther
          className="landing-liquid"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          colors={isLightTheme ? liquidEtherPalettes.light : liquidEtherPalettes.dark}
          mouseForce={isLightTheme ? 20 : 12}
          cursorSize={isLightTheme ? 100 : 120}
          isViscous={isLightTheme}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={isLightTheme ? 0.5 : 0.38}
          isBounce={false}
          autoDemo
          autoSpeed={isLightTheme ? 0.5 : 0.42}
          autoIntensity={isLightTheme ? 2.2 : 1.45}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </Suspense>
      <div className="landing-stickers" aria-hidden="true">
        {stickers.map((sticker) => (
          <img key={sticker.className} src={sticker.src} className={`landing-sticker ${sticker.className}`} alt="" />
        ))}
      </div>
      <LandingHeader />

      <section className="original-hero" id="home">
        <div className="landing-copy">
          <h1>A Social Platform for PCCOE</h1>
          <p>
            Aggregate discussions, campus navigation, and encrypted messaging in real time. Monitor events and track opportunities
            all without juggling multiple logins.
          </p>
          <div className="landing-cta">
            <Button as={Link} to="/login">Get Started</Button>
            <Button as={Link} to="#features" variant="ghost">Explore platform</Button>
          </div>
        </div>
        <StatsPanel />
      </section>

      <section className="communities-strip" aria-labelledby="communities-heading">
        <h2 id="communities-heading">Connecting Communities</h2>
        <div className="community-row">
          {communities.map((community) => (
            <div className="community-pill" key={community.name}>
              <span>{community.mark}</span>
              <strong>{community.name}</strong>
            </div>
          ))}
        </div>
        <p className="marquee-copy" aria-hidden="true">Avigate + Cohort Social + Avigate + Cohort Social +</p>
      </section>

      <section className="platform-features" id="features" aria-labelledby="features-heading">
        <div className="section-heading">
          <h2 id="features-heading">Explore Platform Features</h2>
          <p>From encrypted messaging to real-time campus navigation, discover all the tools designed to empower your social experience.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-cell" key={feature.title}>
              <span className="feature-icon"><feature.icon size={28} aria-hidden="true" /></span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cohort" aria-labelledby="about-heading">
        <div>
          <h2 id="about-heading">About Cohort PCCOE</h2>
          <p>
            Cohort is the official student social platform built exclusively for <strong>Pimpri Chinchwad College of Engineering (PCCOE)</strong>,
            Pune. Designed and developed by students, for students, it serves as the central hub where over 350 active users connect,
            collaborate, and stay informed about everything happening on campus.
          </p>
          <p>
            Unlike generic social media platforms, Cohort is purpose-built for the college ecosystem. It aggregates more than 30
            student-run communities and clubs, including technical organizations like <strong>OWASP, Google Developer Groups on Campus (GDGC),
            ACM, and Geeks for Geeks</strong>, as well as creative and social clubs like <strong>Art Circle, NSS, and ISR</strong>.
          </p>
          <p>
            The platform features <strong>end-to-end encrypted messaging</strong> through Connect, an <strong>XD (Exchange)</strong> board for
            anonymous campus-wide discussions, an <strong>interactive campus map</strong>, an integrated <strong>academic calendar</strong>,
            and <strong>achievement profiles</strong> for showcasing student work.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-links">
          <div>
            <h2>Product</h2>
            <Link to="/">Home</Link>
            <Link to="/connect">Connect</Link>
            <Link to="/map">Maps</Link>
            <Link to="/profile">Profile</Link>
          </div>
          <div>
            <h2>Company</h2>
            <Link to="/communities">Communities</Link>
            <Link to="/profile">Friends</Link>
            <Link to="/xd">XD</Link>
            <Link to="/calendar">Calendar</Link>
          </div>
          <div className="social-links" aria-label="Social links">
            <a href="https://github.com/" aria-label="GitHub"><Github size={28} /></a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn"><Linkedin size={28} /></a>
            <a href="mailto:hello@cohort.pccoe.edu" aria-label="Email"><Mail size={30} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>
            <h2>Regulatory disclaimer</h2>
            <p>Cohort is a community platform, not a bank. Services are provided by partner organizations across the campus up to applicable limits.</p>
          </div>
          <div className="footer-brand">
            <img src="/cohort-logo.png" alt="" />
            <strong>Cohort</strong>
          </div>
        </div>
      </footer>
      <LandingChatbot />
    </main>
  );
}
