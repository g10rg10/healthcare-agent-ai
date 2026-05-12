import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import {
  FileText, Brain, Shield, Clock, ArrowRight,
  Activity, Users, Zap, Lock, ChevronDown,
  Stethoscope, HeartPulse, Microscope, Calendar
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return value;
}

// ── sub-components ────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ value, suffix = '', label, delay }: { value: number; suffix?: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const count = useCountUp(value, 2200, inView);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="text-6xl font-extrabold text-white tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-base text-slate-400 text-center max-w-[140px] leading-snug">{label}</span>
    </motion.div>
  );
}

const features = [
  {
    icon: Brain,
    title: 'AI Clinical Assistant',
    desc: 'An intelligent copilot that answers clinical questions, flags drug interactions, and drafts summaries — always from patient context.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  {
    icon: FileText,
    title: 'Smart Document Analysis',
    desc: 'Upload any medical document and the AI extracts structured data — lab values, diagnoses, medications — automatically.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    icon: HeartPulse,
    title: 'Meeting Transcription',
    desc: 'Record patient encounters in real time. The portal transcribes speech, generates a clinical summary, and stores it linked to the patient.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
  },
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    desc: 'Ask the AI to book a follow-up in plain language. It parses the intent, confirms inline, and adds it to the patient timeline.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Secure Data Exchange',
    desc: 'End-to-end encryption for every file transfer. Patients and providers share records without ever leaving the platform.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    icon: Users,
    title: 'Dual Portal',
    desc: 'A unified platform with a dedicated doctor portal for providers and a patient portal for document upload and appointment tracking.',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
];

const timeline = [
  { icon: Stethoscope, title: 'Clinical Intake', desc: 'Physician opens patient profile. AI pre-loads full context.', color: 'bg-violet-500' },
  { icon: Microscope, title: 'Document Upload', desc: 'Patient or staff uploads labs. AI extracts values instantly.', color: 'bg-blue-500' },
  { icon: Brain, title: 'AI Consultation', desc: 'Doctor asks clinical questions. AI answers with precision.', color: 'bg-rose-500' },
  { icon: Calendar, title: 'Follow-up Booked', desc: 'AI schedules next visit via plain language — one sentence.', color: 'bg-emerald-500' },
];

// ── Floating particles ────────────────────────────────────────────────────────

function Particles() {
  const dots = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-white/20"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StoryPage({ onEnterApp }: { onEnterApp: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  // cursor glow
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="bg-white font-sans overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
      >
        <Particles />

        {/* cursor glow */}
        <motion.div
          className="pointer-events-none fixed w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            x: cursor.x - 250,
            y: cursor.y - 250,
            zIndex: 0,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 30 }}
        />

        <motion.div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ y: heroY, opacity: heroOpacity }}>
          {/* badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Activity className="w-3.5 h-3.5 text-violet-300" />
            Healthcare Innovation · Ospedale Civico di Lugano
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Medicine meets{' '}
            <span
              className="relative inline-block"
              style={{ backgroundImage: 'linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              intelligence.
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            A next-generation clinical platform where AI works side-by-side with physicians — reading records, answering questions, and reducing admin to zero.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <motion.button
              onClick={() => onEnterApp()}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(99,102,241,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              Try the live demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="px-8 py-4 rounded-2xl text-base font-semibold text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn more
            </motion.button>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section id="problem" className="relative bg-slate-950 py-32 px-6 overflow-hidden">
        {/* decorative gradient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-20">
            <span className="text-violet-400 text-sm font-semibold tracking-widest uppercase">The Problem</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mt-3 leading-tight">
              Clinicians are drowning<br />in administrative work.
            </h2>
            <p className="text-slate-400 text-xl mt-6 max-w-2xl mx-auto">
              Every minute spent on paperwork, manual data entry, and record-hunting is a minute taken away from patients.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <StatCard value={4} suffix="h" label="wasted per day on admin per physician" delay={0} />
            <StatCard value={70} suffix="%" label="of medical errors linked to communication failures" delay={0.12} />
            <StatCard value={3} suffix="x" label="more time on docs than direct patient care" delay={0.24} />
            <StatCard value={27} suffix="%" label="of physician burnout attributed to EHR burden" delay={0.36} />
          </div>

          <FadeUp delay={0.2} className="mt-24">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Clock, title: 'Fragmented records', desc: 'Lab results, imaging, and notes scattered across disconnected systems.' },
                { icon: FileText, title: 'Manual transcription', desc: 'Physicians manually re-enter the same data into multiple platforms.' },
                { icon: Zap, title: 'Delayed decisions', desc: 'Critical information buried in PDFs — not actionable at the point of care.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm p-6"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
                >
                  <Icon className="w-7 h-7 text-violet-400 mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── SOLUTION ──────────────────────────────────────────────────────── */}
      <section className="relative bg-white py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 100%)' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-20">
            <span className="text-indigo-500 text-sm font-semibold tracking-widest uppercase">The Solution</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-3 leading-tight">
              One intelligent portal.<br />
              <span style={{ backgroundImage: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                End-to-end.
              </span>
            </h2>
            <p className="text-gray-500 text-xl mt-6 max-w-2xl mx-auto">
              Swiss Health Portal unifies patient records, AI-assisted clinical reasoning, and real-time communication into a single, secure interface.
            </p>
          </FadeUp>

          {/* How it works timeline */}
          <div className="relative">
            {/* connecting line */}
            <motion.div
              className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-violet-400 via-blue-400 to-emerald-400 hidden md:block"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{ originY: 0 }}
            />

            <div className="space-y-6">
              {timeline.map(({ icon: Icon, title, desc, color }, i) => (
                <motion.div
                  key={title}
                  className="flex items-start gap-6 md:gap-8"
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-20">
            <span className="text-indigo-500 text-sm font-semibold tracking-widest uppercase">Features</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-3 leading-tight">
              Built for the ward,<br />powered by AI.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg, text }, i) => (
              <motion.div
                key={title}
                className={`${bg} rounded-3xl p-7 flex flex-col gap-4 border border-transparent`}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className={`text-sm ${text} leading-relaxed opacity-80`}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <section className="bg-white py-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-indigo-500 text-sm font-semibold tracking-widest uppercase">Designed for real clinical environments</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3">What clinicians say</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: '"I can ask the AI about a drug interaction mid-consultation and get a precise answer in seconds — not minutes."',
                name: 'Dr. M. Ferretti',
                role: 'Internal Medicine, OEC Lugano',
                avatar: 'MF',
                color: 'bg-violet-100 text-violet-700',
              },
              {
                quote: '"The meeting transcription alone saves me 40 minutes of charting per day. It\'s the single biggest quality-of-life improvement I\'ve had in ten years."',
                name: 'Dr. S. Berger',
                role: 'General Practitioner, Zurich',
                avatar: 'SB',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                quote: '"Patients upload their own documents and the AI pre-reads them before I arrive. Every consultation starts informed."',
                name: 'Dr. A. Rossi',
                role: 'Cardiology, Basel University Hospital',
                avatar: 'AR',
                color: 'bg-emerald-100 text-emerald-700',
              },
            ].map(({ quote, name, role, avatar, color }, i) => (
              <motion.div
                key={name}
                className="rounded-2xl border border-gray-100 p-7 flex flex-col gap-5 shadow-sm"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', transition: { duration: 0.2 } }}
              >
                <p className="text-gray-600 text-sm leading-relaxed italic">{quote}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${color}`}>{avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        className="relative py-40 px-6 flex flex-col items-center justify-center overflow-hidden text-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
      >
        <Particles />
        <div className="relative z-10 max-w-3xl mx-auto">
          <FadeUp>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/70 text-sm font-medium mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live demo — no account required
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] mb-6">
              See it in action.
            </h2>
            <p className="text-slate-300 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
              Explore the full Doctor Portal with sample patient data, AI consultation, and real-time transcription — right now, in your browser.
            </p>
            <motion.button
              onClick={() => onEnterApp()}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 48px rgba(99,102,241,0.65)' }}
              whileTap={{ scale: 0.97 }}
            >
              Open the portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 py-10 px-6 text-center">
        <p className="text-slate-600 text-sm">
          Swiss Health Portal · Ospedale Civico di Lugano · Prototype — not for clinical use
        </p>
      </footer>
    </div>
  );
}
