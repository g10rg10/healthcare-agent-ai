import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import {
  ArrowRight, ChevronDown, Globe, FileText,
  Pill, Brain, ShieldCheck, Zap, Users, Activity
} from 'lucide-react';

// ── Brand palette ──────────────────────────────────────────────────────────
const C = {
  indigo: '#3D35E8',
  cyan: '#3ECFCF',
  deep: '#12107A',
  ice: '#F5F5FF',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(+(ease * target).toFixed(1));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return value;
}

function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
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

function Particles({ count = 18 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    dur: 7 + Math.random() * 9,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-white/25"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -28, 0], opacity: [0.1, 0.45, 0.1] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Time Bar ───────────────────────────────────────────────────────────────

function TimeBar({ label, hours, total, color, delay }: {
  label: string; hours: number; total: number; color: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const count = useCountUp(hours, 1800, inView);
  const pct = (hours / total) * 100;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-1.5"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{count}h</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────

const problems = [
  {
    icon: FileText,
    title: 'Unstructured data',
    desc: 'Clinical records are fragmented across incompatible systems and formats — PDFs, paper, foreign coding systems.',
    color: C.indigo,
    bg: 'rgba(61,53,232,0.12)',
  },
  {
    icon: Users,
    title: 'Patient self-management',
    desc: 'Patients relay clinical information themselves, causing informal verbal communication and high error risk.',
    color: C.cyan,
    bg: 'rgba(62,207,207,0.12)',
  },
  {
    icon: Activity,
    title: 'Slow exchange',
    desc: 'Healthcare professionals spend significant time interpreting documents and facing language barriers.',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
  },
  {
    icon: Pill,
    title: 'Medication reconciliation',
    desc: 'A lot of time is spent verifying prescriptions, dosages, and mapping drug equivalents across systems.',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
  },
];

const solutions = [
  {
    icon: Brain,
    title: 'Smart Extraction',
    desc: 'Automatically extract key information from documents — diagnoses, medications, dosages, dates, treatment history.',
    color: C.indigo,
  },
  {
    icon: Pill,
    title: 'Medication Mapping',
    desc: 'Correlate and map foreign medications into standardised, locally recognisable Swiss equivalents.',
    color: C.cyan,
  },
  {
    icon: FileText,
    title: 'Structured Data',
    desc: 'Make clinical data usable, shareable, and directly integrable into hospital information systems (FHIR/HL7).',
    color: '#a78bfa',
  },
  {
    icon: ShieldCheck,
    title: 'Decision Support',
    desc: 'Flags missing or unclear data, requests input when confidence is low, and escalates complex cases to the physician.',
    color: '#34d399',
  },
];

const scaleSteps = [
  {
    flag: '🇨🇭',
    region: 'Switzerland',
    role: 'Bridge / Enabler',
    desc: 'Integrates external data into local hospital systems. Reduces manual workload and data entry effort.',
    active: true,
  },
  {
    flag: '🇪🇺',
    region: 'European Union',
    role: 'Last-mile layer',
    desc: 'Builds on cross-border infrastructure (MyHealth@EU). Makes exchanged data more complete and clinically usable.',
    active: false,
  },
  {
    flag: '🌎',
    region: 'Worldwide',
    role: 'Primary enabler',
    desc: 'Adapts to heterogeneous local systems. Helps doctors turn foreign documents into usable data for therapy.',
    active: false,
  },
];

// ── Main ───────────────────────────────────────────────────────────────────

export default function StoryPage({ onEnterApp }: { onEnterApp: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div className="bg-white font-sans overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${C.deep} 0%, #1e1b6e 50%, #0d0b4a 100%)` }}
      >
        <Particles />

        {/* cursor glow */}
        <motion.div
          className="pointer-events-none fixed rounded-full"
          style={{
            width: 480,
            height: 480,
            background: `radial-gradient(circle, rgba(62,207,207,0.14) 0%, transparent 70%)`,
            x: cursor.x - 240,
            y: cursor.y - 240,
            zIndex: 0,
          }}
          transition={{ type: 'spring', stiffness: 70, damping: 28 }}
        />

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/75 text-sm font-medium mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-3.5 h-3.5" style={{ color: C.cyan }} />
            Group 5 · Swiss Health Portal · OEC Lugano
          </motion.div>

          {/* tagline */}
          <motion.h1
            className="text-6xl md:text-[5.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Give time back{' '}
            <span
              className="block md:inline"
              style={{
                backgroundImage: `linear-gradient(90deg, ${C.cyan}, ${C.indigo})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              to care.
            </span>
          </motion.h1>

          {/* quote */}
          <motion.div
            className="mx-auto max-w-2xl mb-10 px-6 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-left"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-white/80 text-base md:text-lg leading-relaxed italic">
              "My patient from Italy has different structured documents than in our Swiss system here.
              I am losing a lot of time gathering my patients' information and transcribing their medical history."
            </p>
            <p className="mt-3 text-sm font-semibold" style={{ color: C.cyan }}>— Dr. Med Müller</p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <motion.button
              onClick={onEnterApp}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C.indigo}, #6366f1)` }}
              whileHover={{ scale: 1.04, boxShadow: `0 0 36px rgba(61,53,232,0.55)` }}
              whileTap={{ scale: 0.97 }}
            >
              Try the live demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="px-8 py-4 rounded-2xl text-base font-semibold text-white/75 border border-white/20 hover:bg-white/8 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See the problem
            </motion.button>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section
        id="problem"
        className="relative py-32 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0d0b4a 0%, #0f0e2e 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(62,207,207,0.07) 0%, transparent 100%)` }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-20">
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: C.cyan }}>The Problem · Swiss Healthcare</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mt-4 leading-tight">
              More time with data,<br />less with patients.
            </h2>
            <p className="text-slate-400 text-xl mt-5 max-w-2xl mx-auto">
              Swiss health data still travels as unstructured PDFs — breaking interoperability and forcing physicians to re-enter records by hand.
            </p>
          </FadeUp>

          {/* Where a doctor's time goes */}
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <FadeUp>
              <h3 className="text-white font-bold text-xl mb-6">Where a Swiss doctor's time goes</h3>
              <div className="flex flex-col gap-5">
                <TimeBar label="At the computer" hours={5.2} total={10} color={C.indigo} delay={0} />
                <TimeBar label="Rounds & other" hours={2.4} total={10} color="#a78bfa" delay={0.1} />
                <TimeBar label="Patient contact" hours={1.7} total={10} color={C.cyan} delay={0.2} />
                <TimeBar label="Pure admin" hours={0.7} total={10} color="#fb923c" delay={0.3} />
              </div>
              <p className="text-xs text-slate-500 mt-4">Source: marketplus.ch</p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div
                className="rounded-3xl p-8 border border-white/8"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(61,53,232,0.3)` }}>
                    <Globe className="w-5 h-5" style={{ color: C.cyan }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">~1/3 of Switzerland's population are foreign residents</p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Foreign patients make it worse: more languages, more formats, zero system compatibility between countries.
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/8 pt-6 space-y-3">
                  {['Own IT system, not connected to hospital', 'Referral letter or PDF sent manually', 'Foreign language, formats, coding systems'].map((t, i) => (
                    <motion.div
                      key={t}
                      className="flex items-center gap-3 text-slate-300 text-sm"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.cyan }} />
                      {t}
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>

          {/* 4 problems */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
            {problems.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                className="rounded-2xl p-6 border border-white/8 flex flex-col gap-4"
                style={{ background: bg }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03, transition: { duration: 0.18 } }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-white font-bold text-sm">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HMW ───────────────────────────────────────────────────────────── */}
      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{ background: C.ice }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.indigo }}>
              Design Question
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight" style={{ color: C.deep }}>
              "How might we enable external clinical data to be directly usable within hospital systems,{' '}
              <span style={{ color: C.indigo }}>reducing the need for manual re-entry</span>{' '}
              by doctors and patients?"
            </h2>
          </FadeUp>
        </div>
      </section>

      {/* ── SOLUTION ──────────────────────────────────────────────────────── */}
      <section className="relative bg-white py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(61,53,232,0.05) 0%, transparent 100%)` }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-20">
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.indigo }}>Our Solution</span>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight" style={{ color: C.deep }}>
              One portal.<br />
              <span style={{ backgroundImage: `linear-gradient(90deg, ${C.indigo}, ${C.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                End-to-end.
              </span>
            </h2>
            <p className="mt-5 text-gray-500 text-xl max-w-2xl mx-auto">
              A portal where patients upload their documents easily, and doctors access structured records compiled by the AI agent — without a single line of manual re-entry.
            </p>
          </FadeUp>

          {/* Onliness statement */}
          <FadeUp delay={0.1} className="mb-20">
            <div className="rounded-3xl p-8 md:p-10 border"
              style={{ background: `linear-gradient(135deg, ${C.deep}, #1e1b6e)`, borderColor: 'rgba(62,207,207,0.2)' }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: C.cyan }}>Onliness Statement</p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  ['WHAT', 'The only AI agent that transforms external clinical documents into structured, system-ready data'],
                  ['HOW', 'Without manual re-entry, translation loss, or format incompatibility'],
                  ['WHO', 'For hospital external patients and their care teams'],
                  ['WHERE', 'In cross-border healthcare corridors, focusing on Switzerland'],
                ].map(([label, text], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                  >
                    <span className="text-xs font-bold tracking-widest" style={{ color: C.cyan }}>{label}</span>
                    <p className="text-white/80 text-sm mt-1 leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* 4 Features */}
          <div className="grid sm:grid-cols-2 gap-6">
            {solutions.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                className="rounded-2xl p-7 border border-gray-100 flex gap-5 items-start shadow-sm"
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.07)', transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARGET USERS ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 overflow-hidden" style={{ background: C.ice }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: C.indigo }}>Who it's for</span>
            <h2 className="text-4xl md:text-5xl font-extrabold" style={{ color: C.deep }}>Built for two roles.</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Doctor',
                motto: '"I want to focus on my work, not handle data inputs!"',
                desc: 'Swiss hospital professional needing seamless multilingual interfaces without manual translation.',
                pains: ['Too many documents to analyze', 'Too many patients to monitor', 'Must approach different medical cultures'],
                color: C.indigo,
              },
              {
                title: 'Patient',
                motto: '"I would like clear communication between my clinical data and the local healthcare system."',
                desc: 'Foreign patient handling fragmented medical records, including foreign language documents.',
                pains: ['Documents in different languages/formats', 'Navigating a different healthcare system', 'Paper, PDF, JPG — all mixed'],
                color: C.cyan,
              },
            ].map(({ title, motto, desc, pains, color }, i) => (
              <motion.div
                key={title}
                className="rounded-3xl p-8 border bg-white shadow-sm"
                style={{ borderColor: `${color}30` }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: color }}>
                    {title[0]}
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: C.deep }}>Target User · {title}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-5">{desc}</p>
                <p className="italic text-gray-600 text-sm border-l-2 pl-4 mb-5" style={{ borderColor: color }}>{motto}</p>
                <div className="space-y-2">
                  {pains.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      {p}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCALABILITY ───────────────────────────────────────────────────── */}
      <section
        className="relative py-32 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0f0e2e 0%, ${C.deep} 100%)` }}
      >
        <Particles count={12} />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.cyan }}>Scalability</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Turning external documents<br />into{' '}
              <span style={{ color: C.cyan }}>care-ready data</span>
              — everywhere.
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {scaleSteps.map(({ flag, region, role, desc, active }, i) => (
              <motion.div
                key={region}
                className="rounded-2xl p-7 border flex flex-col gap-4 relative overflow-hidden"
                style={{
                  background: active ? `rgba(61,53,232,0.25)` : 'rgba(255,255,255,0.04)',
                  borderColor: active ? `${C.indigo}80` : 'rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
              >
                {active && (
                  <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${C.cyan}20`, color: C.cyan }}>
                    Current
                  </div>
                )}
                <span className="text-3xl">{flag}</span>
                <div>
                  <p className="text-white font-bold text-lg">{region}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.cyan }}>{role}</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        className="relative py-40 px-6 flex flex-col items-center justify-center overflow-hidden text-center"
        style={{ background: `linear-gradient(135deg, ${C.deep} 0%, #1e1b6e 50%, #0d0b4a 100%)` }}
      >
        <Particles />
        <div className="relative z-10 max-w-2xl mx-auto">
          <FadeUp>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/70 text-sm font-medium mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live demo — no account required
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] mb-5">
              See it in action.
            </h2>
            <p className="text-slate-300 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
              Explore the full Doctor Portal with sample patient data, AI clinical assistant, and real-time transcription — right now, in your browser.
            </p>
            <motion.button
              onClick={onEnterApp}
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C.indigo}, #6366f1)` }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 50px rgba(61,53,232,0.6)` }}
              whileTap={{ scale: 0.97 }}
            >
              Open the portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 text-center" style={{ background: '#080717' }}>
        <p className="text-slate-600 text-sm">
          Group 5 · Riccardo Assirelli, Edoardo Carlani, Giorgio Gaudio, Lynn Germiquet, Artem Sadoviy
        </p>
        <p className="text-slate-700 text-xs mt-1">
          Swiss Health Portal · Ospedale Civico di Lugano · University prototype — not for clinical use
        </p>
      </footer>

    </div>
  );
}
