import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import {
  ArrowRight, ChevronDown, Globe, FileText,
  Pill, Brain, ShieldCheck, Zap, Users, Activity,
  CheckCircle, AlertTriangle, Layers, Cpu, Stethoscope
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
    <motion.div ref={ref} className="flex flex-col gap-1.5"
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

const issues = [
  { icon: FileText,  title: 'Unstructured Data',         desc: 'Clinical records fragmented across incompatible systems and formats.', color: C.indigo },
  { icon: Users,     title: 'Patient Management',        desc: 'Patients relay clinical information themselves, causing informal verbal communication.', color: C.cyan },
  { icon: Activity,  title: 'Slow Exchange',             desc: 'Professionals spend significant time interpreting documents and facing language barriers.', color: '#a78bfa' },
  { icon: Pill,      title: 'Medication Reconciliation', desc: 'Time lost verifying prescriptions, dosages and mapping drug equivalents.', color: '#fb923c' },
];

const solutions = [
  { from: 'Unstructured Data',         to: 'Structured Data',    desc: 'Make clinical data usable, shareable, and directly integrable across systems.', color: C.indigo },
  { from: 'Patient Management',        to: 'Patient Access',     desc: 'Help patients access and share medical information across providers and languages.', color: C.cyan },
  { from: 'Slow Exchange',             to: 'Smart Extraction',   desc: 'Automatically extract key information from documents and translate across languages.', color: '#a78bfa' },
  { from: 'Medication Reconciliation', to: 'Medication Mapping', desc: 'Correlate and map foreign medications into standardised, locally recognisable equivalents.', color: '#fb923c' },
];

const onliness = [
  { label: 'WHAT',  text: 'The only AI agent that transforms external clinical documents into structured, system-ready data' },
  { label: 'HOW',   text: 'Without manual re-entry, translation loss, or format incompatibility' },
  { label: 'WHO',   text: 'For hospital external patients and their care teams' },
  { label: 'WHERE', text: 'In cross-border healthcare corridors, focusing on Switzerland' },
  { label: 'WHY',   text: 'Because fragmented records across two healthcare systems delay or compromise care' },
  { label: 'WHEN',  text: 'At a time when cross-border mobility is rising but health data interoperability remains a blind spot' },
];

const aiFeatures = [
  { icon: FileText,     label: 'Process medical documents',   sub: 'Detects type and origin' },
  { icon: Brain,        label: 'Extracts key clinical data',  sub: 'Diagnoses, medications, dosages' },
  { icon: Layers,       label: 'Standardises medical data',   sub: 'Maps and structures information' },
  { icon: Pill,         label: 'Maps medications',            sub: 'Suggests Swiss equivalents' },
  { icon: CheckCircle,  label: 'Generates pre-filled records',sub: 'FHIR/HL7 compatible' },
  { icon: Cpu,          label: 'Works with hospital systems', sub: 'Converts data for HIS use' },
  { icon: AlertTriangle,label: 'Flags missing data',          sub: 'Requests input when needed' },
  { icon: ShieldCheck,  label: 'Escalates complex cases',     sub: 'Defers to physician review' },
];

const paths = [
  {
    id: 'A', label: 'Path A · No patient upload', color: C.indigo, bg: `rgba(61,53,232,0.12)`,
    patient: 'Ignores link and carries physical documents to visit',
    doctor: 'Scans and uploads documents received at the visit',
    outcome: 'Record entered into HIS after doctor upload',
  },
  {
    id: 'B', label: 'Path B · Partial upload', color: C.cyan, bg: `rgba(62,207,207,0.12)`,
    patient: 'Uploads only available docs — missing records flagged',
    doctor: 'Scans and provides the missing documents',
    outcome: 'AI flags gaps, completes record after doctor fills in',
  },
  {
    id: 'C', label: 'Path C · Full upload', color: '#34d399', bg: 'rgba(52,211,153,0.12)',
    patient: 'All documents correctly uploaded in the portal',
    doctor: 'Reviews pre-filled record, approves or edits',
    outcome: 'Fastest path — AI processes everything autonomously',
  },
];

const scaleSteps = [
  {
    flag: '🇨🇭', region: 'Switzerland', current: true, role: 'Bridge / Enabler', color: C.indigo,
    desc: 'Integrates external data into local hospital systems. Reduces manual workload and data entry effort.',
    constraints: ['Fragmented systems', 'Limited data exchange', 'Less defined AI regulation'],
  },
  {
    flag: '🇪🇺', region: 'European Union', current: false, role: 'Last-mile layer', color: '#6366f1',
    desc: 'Builds on MyHealth@EU infrastructure — ePrescriptions, Patient Summaries, lab results, discharge reports.',
    constraints: ['Strong data regulation (GDPR)', 'High-risk AI constraints', 'Overlap with institutional systems'],
  },
  {
    flag: '🌎', region: 'Worldwide', current: false, role: 'Primary enabler', color: C.cyan,
    desc: 'Aligns with WHO SMART Guidelines. Adapts to heterogeneous local systems for therapy initialisation.',
    constraints: ['Variable regulations', 'Infrastructure gaps', 'Trust and adoption barriers'],
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
        <motion.div
          className="pointer-events-none fixed rounded-full"
          style={{
            width: 480, height: 480,
            background: `radial-gradient(circle, rgba(62,207,207,0.14) 0%, transparent 70%)`,
            x: cursor.x - 240, y: cursor.y - 240, zIndex: 0,
          }}
          transition={{ type: 'spring', stiffness: 70, damping: 28 }}
        />

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/75 text-sm font-medium mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-3.5 h-3.5" style={{ color: C.cyan }} />
            Group 5 - Healthcare - Sano Clinical Data Intelligence
          </motion.div>

          <motion.h1
            className="text-6xl md:text-[5.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-4"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Dedicate your time{' '}
            <span
              className="block"
              style={{
                backgroundImage: `linear-gradient(90deg, ${C.cyan}, ${C.indigo})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              to patients' real needs.
            </span>
          </motion.h1>

          <motion.p
            className="text-sm text-white/40 tracking-wide mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Riccardo Assirelli · Edoardo Carlani · Giorgio Gaudio · Lynn Germiquet · Artem Sadoviy
          </motion.p>

        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/35"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────────────── */}
      <section
        id="problem"
        className="relative py-32 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0d0b4a 0%, #0f0e2e 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(62,207,207,0.07) 0%, transparent 100%)` }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: C.cyan }}>
              The Problem · Swiss Healthcare
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mt-4 leading-tight">
              More time with data<br />than with patients
            </h2>
            <p className="text-white/60 text-base md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
              Swiss health data still travels as unstructured PDFs — breaking interoperability and forcing physicians to re-enter records by hand.
              Doctors spend 5.2 hours of their daily work at the computer, rather than with the patient or on other tasks.
            </p>
          </FadeUp>

          <div className="flex flex-col gap-8 max-w-3xl mx-auto">

            {/* 1 — Where a Swiss doctor's time goes */}
            <FadeUp>
              <h3 className="text-white font-bold text-xl mb-4">Where a Swiss doctor's time goes</h3>
              <div className="flex flex-col gap-3">
                <motion.div
                  className="rounded-2xl px-8 py-7 flex flex-col justify-end w-full"
                  style={{ background: `linear-gradient(135deg, #0d0b4a 0%, ${C.indigo} 50%, ${C.cyan} 100%)`, minHeight: 120 }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
                >
                  <span className="text-5xl font-extrabold text-white tabular-nums leading-none">5.2h</span>
                  <span className="text-xs font-bold tracking-widest uppercase text-white/70 mt-1">At the computer</span>
                </motion.div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { h: '2.4h', label: 'Rounds & other',  color: C.indigo },
                    { h: '1.7h', label: 'Patient contact', color: C.indigo },
                    { h: '0.7h', label: 'Pure admin',      color: C.cyan   },
                  ].map((s, i) => (
                    <motion.div key={s.label}
                      className="rounded-2xl px-4 py-5 flex flex-col gap-1"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22,1,0.36,1] }}
                    >
                      <span className="text-2xl font-extrabold tabular-nums" style={{ color: s.color }}>{s.h}</span>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/50 leading-tight">{s.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Source: Reuters</p>
            </FadeUp>


          </div>
        </div>
      </section>

      {/* ── PATIENT PATHWAYS ─────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.deep} 0%, #1e1b6e 50%, #0d0b4a 100%)` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 50% 40% at 80% 50%, rgba(62,207,207,0.07) 0%, transparent 100%)` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="mb-10">
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: C.cyan }}>
              Context · Swiss Healthcare System
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 leading-tight">
              Where are patients treated<br />before hospital admission?
            </h2>
          </FadeUp>

          {/* Dr. Müller quote */}
          <FadeUp delay={0.1} className="mb-10">
            <div className="max-w-3xl px-6 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-1" style={{ background: `${C.indigo}30` }}>
                <Stethoscope className="w-5 h-5" style={{ color: C.cyan }} />
              </div>
              <div>
                <p className="text-white/80 text-base md:text-lg leading-relaxed italic">
                  "My patient from Italy has different structured documents than in our Swiss system here.
                  I am losing a lot of time gathering my patients' information and transcribing their medical history."
                </p>
                <p className="mt-3 text-sm font-semibold" style={{ color: C.cyan }}>— Dr. Med Müller</p>
              </div>
            </div>
          </FadeUp>

          {/* Flow diagram */}
          <FadeUp delay={0.15}>
            <div className="flex gap-4 items-stretch">

              {/* LEFT: two tracks stacked */}
              <div className="flex-1 flex flex-col gap-5">

                {/* Swiss Resident track */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/80">
                    🇨🇭 Swiss Resident
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(61,53,232,0.15)' }}>
                      <p className="text-white font-bold text-sm mb-1">👨‍⚕️ Private Doctor Practice</p>
                      <p className="text-white/60 text-xs leading-snug">Own IT system, not connected to hospital</p>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-white/70" />
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(61,53,232,0.15)' }}>
                      <p className="text-white font-bold text-sm mb-1">🩺 Private Specialist</p>
                      <p className="text-white/60 text-xs leading-snug">Referral letter or PDF sent manually</p>
                    </div>
                  </div>
                </div>

                {/* Foreign Patient track */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/80">
                    🌍 Foreign Patient
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(62,207,207,0.12)' }}>
                      <p className="text-white font-bold text-sm mb-1">📋 Medical history from abroad</p>
                      <p className="text-white/60 text-xs leading-snug">Foreign language, formats, coding systems</p>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-white/70" />
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(62,207,207,0.12)' }}>
                      <p className="text-white font-bold text-sm mb-1">🚑 Swiss Doctor or Emergency Room</p>
                      <p className="text-white/60 text-xs leading-snug">First contact in CH with foreign documents</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* CENTER: converging arrows */}
              <div className="flex flex-col justify-around items-center py-8 flex-shrink-0 w-8">
                <ArrowRight className="w-5 h-5 text-white/70" style={{ transform: 'rotate(30deg)' }} />
                <ArrowRight className="w-5 h-5 text-white/70" style={{ transform: 'rotate(-30deg)' }} />
              </div>

              {/* RIGHT: Public Hospital shared card */}
              <motion.div
                className="w-52 flex-shrink-0 rounded-2xl p-5 border-2 flex flex-col justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: `${C.cyan}50` }}
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.35, ease: [0.22,1,0.36,1] }}
              >
                <p className="text-3xl mb-3">🏥</p>
                <p className="text-white font-extrabold text-base leading-tight mb-1">Public Hospital</p>
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.cyan }}>Shared destination</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  Clinical data is fragmented for everyone. Foreign patients make it worse: more languages, more formats, no system compatibility.
                </p>
              </motion.div>

            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 4 ISSUES + SOLUTIONS ──────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ background: '#0a0920' }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: C.cyan }}>
              Issues behind time loss
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Why does patient registration<br />not take seconds?
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {issues.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title}
                className="rounded-2xl p-6 border border-white/8 flex flex-col gap-5"
                style={{ background: 'rgba(255,255,255,0.04)' }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}25` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="font-extrabold text-2xl leading-tight mb-2" style={{
                    backgroundImage: `linear-gradient(90deg, ${C.indigo}, ${C.cyan})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-1.5 border-t border-white/10 pt-5">
            <p className="text-white/55 text-xs">Source — Medication reconciliation: Interview with <span className="text-white/80 font-medium">Dr.ssa med. Rana Nerlep Kaur</span></p>
            <p className="text-white/55 text-xs">Source — <span className="text-white/80 font-medium">Frontiers in Public Health</span></p>
          </div>

          {/* Transformation arrows */}
          <div className="mt-20">
            <FadeUp className="text-center mb-8">
              <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: C.cyan }}>
                How could we improve that?
              </span>
            </FadeUp>
            <div className="space-y-4">
              {solutions.map(({ from, to, desc, color }, i) => (
                <motion.div key={from}
                  className="flex items-center gap-4 rounded-2xl p-5 border border-white/8"
                  style={{ background: `${color}0d` }}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-xs text-slate-500 w-40 flex-shrink-0 line-through">{from}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  <span className="font-bold text-sm flex-shrink-0" style={{ color }}>{to}</span>
                  <span className="text-slate-400 text-xs leading-relaxed hidden md:block ml-2">{desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HMW ───────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ background: C.ice }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.indigo }}>Design Question</span>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight" style={{ color: C.deep }}>
              "How might we enable external clinical data to be directly usable within hospital systems,{' '}
              <span style={{ color: C.indigo }}>reducing the need for manual re-entry</span>{' '}
              by doctors and patients?"
            </h2>
          </FadeUp>
        </div>
      </section>

      {/* ── THE SOLUTION ──────────────────────────────────────────────────── */}
      <section className="relative bg-white py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(61,53,232,0.05) 0%, transparent 100%)` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-14">
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.indigo }}>Our Solution</span>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight" style={{ color: C.deep }}>
              One portal.{' '}
              <span style={{ backgroundImage: `linear-gradient(90deg, ${C.indigo}, ${C.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                End-to-end.
              </span>
            </h2>
            <p className="mt-5 text-gray-500 text-xl max-w-2xl mx-auto">
              Patients upload their documents easily. Doctors access structured records compiled by the AI agent — without a single line of manual re-entry.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-3xl p-8 md:p-10 border"
              style={{ background: `linear-gradient(135deg, ${C.deep}, #1e1b6e)`, borderColor: `rgba(62,207,207,0.2)` }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: C.cyan }}>Onliness Statement</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {onliness.map(({ label, text }, i) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                  >
                    <span className="text-xs font-bold tracking-widest" style={{ color: C.cyan }}>{label}</span>
                    <p className="text-white/80 text-sm mt-1 leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── AI AGENT IDENTITY ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 overflow-hidden" style={{ background: C.ice }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: C.indigo }}>AI Agent Identity</span>
            <h2 className="text-4xl md:text-5xl font-extrabold" style={{ color: C.deep }}>Precise. Reliable. Safe.</h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div className="rounded-3xl p-8 bg-white border border-gray-100 shadow-sm"
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: C.indigo }}>Personality</p>
              <div className="flex flex-wrap gap-2">
                {['Precise', 'Structured', 'Reliable', 'Safe'].map((t, i) => (
                  <motion.span key={t}
                    className="px-4 py-2 rounded-full text-sm font-semibold border"
                    style={{ borderColor: `${C.indigo}40`, color: C.indigo, background: `${C.indigo}08` }}
                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  >{t}</motion.span>
                ))}
              </div>
            </motion.div>
            <motion.div className="rounded-3xl p-8 bg-white border border-gray-100 shadow-sm"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: C.cyan }}>Tone of Voice</p>
              <div className="flex flex-wrap gap-2">
                {['Concise', 'Action-oriented', 'Direct', 'Respectful'].map((t, i) => (
                  <motion.span key={t}
                    className="px-4 py-2 rounded-full text-sm font-semibold border"
                    style={{ borderColor: `${C.cyan}50`, color: '#0d9488', background: `${C.cyan}10` }}
                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  >{t}</motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          <FadeUp>
            <p className="text-xs font-bold tracking-widest uppercase text-center mb-8" style={{ color: C.indigo }}>Key Features of AI Agent</p>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aiFeatures.map(({ icon: Icon, label, sub }, i) => (
              <motion.div key={label}
                className="rounded-2xl p-5 bg-white border border-gray-100 flex flex-col gap-3 shadow-sm"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.indigo}12` }}>
                  <Icon className="w-4 h-4" style={{ color: C.indigo }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs leading-snug">{label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 PATHS ───────────────────────────────────────────────────────── */}
      <section
        className="relative py-32 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0f0e2e 0%, #0d0b4a 100%)` }}
      >
        <Particles count={10} />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: C.cyan }}>Clinical Data Integration</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Three paths.<br />One outcome.
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              The system adapts to how much the patient uploads. In every case, the doctor receives a structured, pre-filled record ready to approve.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {paths.map(({ id, label, color, bg, patient, doctor, outcome }, i) => (
              <motion.div key={id}
                className="rounded-2xl p-7 border border-white/8 flex flex-col gap-5"
                style={{ background: bg }}
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{label}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Patient</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{patient}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Doctor</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{doctor}</p>
                  </div>
                </div>
                <div className="border-t border-white/8 pt-4 mt-auto">
                  <p className="text-xs font-medium leading-relaxed" style={{ color }}>{outcome}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARGET USERS ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: C.indigo }}>Who it's for</span>
            <h2 className="text-4xl md:text-5xl font-extrabold" style={{ color: C.deep }}>Built for two roles.</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                id: '#1', title: 'Doctor',
                desc: 'Swiss hospital professional needing seamless multilingual interfaces without manual translation.',
                motto: '"I want to focus on my work, not handle data inputs!"',
                pains: ['Too many documents to analyse', 'Too many patients to monitor', 'Must approach different cultures'],
                wants: ['Prioritise efficiency', 'Clear communication', 'Speed up the work'],
                color: C.indigo,
              },
              {
                id: '#2', title: 'Patient',
                desc: 'Foreign patient handling fragmented medical records, including foreign language documents.',
                motto: '"I would like clear communication between my clinical data and local healthcare."',
                pains: ['Documents in different languages/formats', 'Navigating a different healthcare system', 'A lot of documents in different formats'],
                wants: ['Translate documents across languages', 'Navigate a new healthcare system', 'Access and share medical information'],
                color: C.cyan,
              },
            ].map(({ id, title, desc, motto, pains, wants, color }, i) => (
              <motion.div key={title}
                className="rounded-3xl p-8 border bg-white shadow-sm"
                style={{ borderColor: `${color}30` }}
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: color }}>{title[0]}</div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>Target User {id}</p>
                    <p className="font-extrabold text-lg" style={{ color: C.deep }}>{title}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">{desc}</p>
                <p className="italic text-gray-600 text-sm border-l-2 pl-4 mb-5" style={{ borderColor: color }}>{motto}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-400">Pain Points</p>
                    <div className="space-y-1.5">
                      {pains.map(p => (
                        <div key={p} className="flex items-start gap-2 text-xs text-gray-500">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: color }} />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-400">Intent</p>
                    <div className="space-y-1.5">
                      {wants.map(w => (
                        <div key={w} className="flex items-start gap-2 text-xs text-gray-500">
                          <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color }} />
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTENT MAP ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 overflow-hidden" style={{ background: C.ice }}>
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: C.indigo }}>Intent Map</span>
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: C.deep }}>Where we focus first.</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div className="rounded-3xl p-8 bg-white border shadow-sm"
              style={{ borderColor: `${C.indigo}30` }}
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.indigo}15` }}>
                  <Zap className="w-4 h-4" style={{ color: C.indigo }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.indigo }}>Strategic Initiatives</p>
                  <p className="text-xs text-gray-400">High value · High effort</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Get a pre-filled record ready to review and confirm.', 'Patient understands what to do after the visit.'].map(t => (
                  <div key={t} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${C.indigo}08` }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: C.indigo }} />
                    <p className="text-sm text-gray-700">{t}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="rounded-3xl p-8 bg-white border shadow-sm"
              style={{ borderColor: `${C.cyan}40` }}
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.cyan}15` }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#0d9488' }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0d9488' }}>Quick Wins</p>
                  <p className="text-xs text-gray-400">High value · Low effort</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Identify a foreign drug and its Swiss equivalent.",
                  "Help patients in a system they don't know.",
                  "Start treating without re-entering data manually.",
                  "Knowing the patient's history without friction.",
                ].map(t => (
                  <div key={t} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${C.cyan}08` }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: C.cyan }} />
                    <p className="text-sm text-gray-700">{t}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SCALABILITY ───────────────────────────────────────────────────── */}
      <section
        className="relative py-32 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0f0e2e 0%, ${C.deep} 100%)` }}
      >
        <Particles count={12} />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.cyan }}>Scalability</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Is our product limited<br />to Switzerland?
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {scaleSteps.map(({ flag, region, current, role, desc, constraints, color }, i) => (
              <motion.div key={region}
                className="rounded-2xl p-7 border flex flex-col gap-4 relative overflow-hidden"
                style={{
                  background: current ? `rgba(61,53,232,0.22)` : 'rgba(255,255,255,0.04)',
                  borderColor: current ? `${C.indigo}80` : 'rgba(255,255,255,0.08)',
                }}
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
              >
                {current && (
                  <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${C.cyan}20`, color: C.cyan }}>Current</div>
                )}
                <span className="text-3xl">{flag}</span>
                <div>
                  <p className="text-white font-bold text-lg">{region}</p>
                  <p className="text-xs mt-0.5" style={{ color }}>{role}</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                <div className="border-t border-white/8 pt-4 space-y-1.5">
                  {constraints.map(c => (
                    <div key={c} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                      {c}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Closing line */}
          <FadeUp delay={0.2} className="text-center">
            <p className="text-2xl md:text-4xl font-extrabold text-white">
              When data becomes usable,{' '}
              <span style={{ color: C.cyan }}>care begins sooner.</span>
            </p>
          </FadeUp>
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
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/70 text-sm font-medium mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live demo — no account required
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] mb-5">
              See it in action.
            </h2>
            <p className="text-slate-300 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
              Explore the Doctor Portal with sample patient data, AI clinical assistant, and real-time transcription — in your browser, right now.
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
