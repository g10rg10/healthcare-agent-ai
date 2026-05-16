import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionTemplate, type MotionValue } from 'motion/react';
import {
  ArrowRight, ChevronDown, Globe, FileText,
  Pill, Brain, ShieldCheck, Zap, Users, Activity,
  CheckCircle, AlertTriangle, Layers, Cpu, Stethoscope,
  Hospital, ClipboardList, UserRound, Siren
} from 'lucide-react';
import avatarDoctor from '../../assets/avatar-doctor.png';
import avatarPatient from '../../assets/avatar-patient.png';
import sanoIcon from '../../assets/sano-icon.png';
import sanoLogotype from '../../assets/sano-logotype.png';

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
    icon: ShieldCheck, region: 'Switzerland', current: true, role: 'Bridge / Enabler', color: C.indigo,
    desc: 'Integrates external data into local hospital systems. Reduces manual workload and data entry effort.',
    constraints: ['Fragmented systems', 'Limited data exchange', 'Less defined AI regulation'],
  },
  {
    icon: Layers, region: 'European Union', current: false, role: 'Last-mile layer', color: '#6366f1',
    desc: 'Builds on MyHealth@EU infrastructure — ePrescriptions, Patient Summaries, lab results, discharge reports.',
    constraints: ['Strong data regulation (GDPR)', 'High-risk AI constraints', 'Overlap with institutional systems'],
  },
  {
    icon: Globe, region: 'Worldwide', current: false, role: 'Primary enabler', color: C.cyan,
    desc: 'Aligns with WHO SMART Guidelines. Adapts to heterogeneous local systems for therapy initialisation.',
    constraints: ['Variable regulations', 'Infrastructure gaps', 'Trust and adoption barriers'],
  },
];

// ── Doctor Time Block (scroll-animated) ───────────────────────────────────
function DoctorTimeBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });

  // Main bar width grows
  const barW = useTransform(scrollYProgress, [0, 0.45], ['0%', '100%'], { clamp: true });
  // Main counter 0 → 5.2
  const mainVal = useTransform(scrollYProgress, [0, 0.45], [0, 5.2], { clamp: true });
  // Sub cards stagger
  const sub0Op = useTransform(scrollYProgress, [0.35, 0.55], [0, 1], { clamp: true });
  const sub0Y  = useTransform(scrollYProgress, [0.35, 0.55], [20, 0], { clamp: true });
  const sub1Op = useTransform(scrollYProgress, [0.45, 0.65], [0, 1], { clamp: true });
  const sub1Y  = useTransform(scrollYProgress, [0.45, 0.65], [20, 0], { clamp: true });
  const sub2Op = useTransform(scrollYProgress, [0.55, 0.75], [0, 1], { clamp: true });
  const sub2Y  = useTransform(scrollYProgress, [0.55, 0.75], [20, 0], { clamp: true });
  // Sub counters
  const val0 = useTransform(scrollYProgress, [0.35, 0.55], [0, 2.4], { clamp: true });
  const val1 = useTransform(scrollYProgress, [0.45, 0.65], [0, 1.7], { clamp: true });
  const val2 = useTransform(scrollYProgress, [0.55, 0.75], [0, 0.7], { clamp: true });
  // Source
  const srcOp = useTransform(scrollYProgress, [0.75, 0.90], [0, 1], { clamp: true });

  const subs = [
    { val: val0, label: 'Rounds & other', color: C.indigo, op: sub0Op, y: sub0Y },
    { val: val1, label: 'Patient contact', color: C.indigo, op: sub1Op, y: sub1Y },
    { val: val2, label: 'Pure admin', color: C.cyan, op: sub2Op, y: sub2Y },
  ];

  return (
    <div ref={ref}>
      <FadeUp>
        <h3 className="text-white font-bold text-xl mb-4">Where a Swiss doctor's time goes</h3>
      </FadeUp>
      <div className="flex flex-col gap-3">
        {/* Main bar — grows with scroll */}
        <div className="rounded-2xl py-7 relative overflow-hidden" style={{ minHeight: 120, background: '#0d0b4a' }}>
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              width: barW,
              background: `linear-gradient(135deg, #0d0b4a 0%, ${C.indigo} 50%, ${C.cyan} 100%)`,
            }}
          />
          <div className="relative z-10 px-8">
            <motion.span className="text-5xl font-extrabold text-white tabular-nums leading-none block">
              {mainVal.get !== undefined ? <ScrollCounter value={mainVal} suffix="h" /> : '5.2h'}
            </motion.span>
            <span className="text-xs font-bold tracking-widest uppercase text-white/70 mt-1 block">At the computer</span>
          </div>
        </div>

        {/* Sub cards */}
        <div className="grid grid-cols-3 gap-3">
          {subs.map((s, i) => (
            <motion.div key={s.label}
              className="rounded-2xl px-4 py-5 flex flex-col gap-1"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', opacity: s.op, y: s.y }}
            >
              <span className="text-2xl font-extrabold tabular-nums" style={{ color: s.color }}>
                <ScrollCounter value={s.val} suffix="h" />
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/50 leading-tight">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.p className="text-xs text-slate-500 mt-3" style={{ opacity: srcOp }}>Source: Reuters</motion.p>
    </div>
  );
}

// ── Scroll Counter (reads MotionValue, renders number) ────────────────────
function ScrollCounter({ value, suffix = '' }: { value: MotionValue<number>; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const unsub = value.on('change', (v: number) => {
      setDisplay(v < 10 ? v.toFixed(1) : Math.round(v).toString());
    });
    return unsub;
  }, [value]);
  return <>{display}{suffix}</>;
}

// ── Agent Identity Section (scroll-animated) ──────────────────────────────
function AgentIdentitySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sp } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  /* ── Icon — persistent across phases 1-3, centered ── */
  const iconOp    = useTransform(sp, [0.02, 0.08, 0.78, 0.84], [0, 1, 1, 0], { clamp: true });
  const iconScale = useTransform(sp, [0.02, 0.10], [0.6, 1], { clamp: true });

  /* ── Phase 1: "Introducing:" + logotype next to icon (0 → 22%) ── */
  const introOp     = useTransform(sp, [0.03, 0.08], [0, 1], { clamp: true });
  const introY      = useTransform(sp, [0.03, 0.08], [20, 0], { clamp: true });
  const logotypeOp  = useTransform(sp, [0.04, 0.10, 0.16, 0.22], [0, 1, 1, 0], { clamp: true });
  const logotypeX   = useTransform(sp, [0.16, 0.22], [0, 40], { clamp: true });
  // Icon shifts left when logotype is visible, then centers
  const iconX       = useTransform(sp, [0.16, 0.24], [-60, 0], { clamp: true });

  /* ── Phase 2: Personality (22 → 52%) ── */
  const persLabelOp = useTransform(sp, [0.24, 0.30, 0.46, 0.52], [0, 1, 1, 0], { clamp: true });
  const persLabelY  = useTransform(sp, [0.24, 0.30], [24, 0], { clamp: true });

  const persPills = [
    { text: 'Precise',    xr: [-280, -160], yr: [-55, -55],  delay: 0 },
    { text: 'Structured', xr: [280, 160],   yr: [-55, -55],  delay: 0.02 },
    { text: 'Reliable',   xr: [-230, -140], yr: [55, 55],    delay: 0.04 },
    { text: 'Safe',       xr: [230, 140],   yr: [55, 55],    delay: 0.06 },
  ];
  const ppAnims = persPills.map((p) => {
    const s = 0.30 + p.delay;
    const e = 0.46;
    return {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      op: useTransform(sp, [s, s + 0.06, e, e + 0.06], [0, 1, 1, 0], { clamp: true }),
      // eslint-disable-next-line react-hooks/rules-of-hooks
      x:  useTransform(sp, [s, s + 0.06], p.xr, { clamp: true }),
      // eslint-disable-next-line react-hooks/rules-of-hooks
      y:  useTransform(sp, [s, s + 0.06], p.yr, { clamp: true }),
    };
  });

  /* ── Phase 3: Tone of Voice (52 → 80%) ── */
  const toneLabelOp = useTransform(sp, [0.52, 0.58, 0.74, 0.80], [0, 1, 1, 0], { clamp: true });
  const toneLabelY  = useTransform(sp, [0.52, 0.58], [24, 0], { clamp: true });

  const tonePills = [
    { text: 'Concise',          xr: [-280, -160], yr: [-55, -55],  delay: 0 },
    { text: 'Action-oriented',  xr: [280, 160],   yr: [-55, -55],  delay: 0.02 },
    { text: 'Direct',           xr: [-230, -140], yr: [55, 55],    delay: 0.04 },
    { text: 'Respectful',       xr: [230, 140],   yr: [55, 55],    delay: 0.06 },
  ];
  const tpAnims = tonePills.map((p) => {
    const s = 0.58 + p.delay;
    const e = 0.74;
    return {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      op: useTransform(sp, [s, s + 0.06, e, e + 0.06], [0, 1, 1, 0], { clamp: true }),
      // eslint-disable-next-line react-hooks/rules-of-hooks
      x:  useTransform(sp, [s, s + 0.06], p.xr, { clamp: true }),
      // eslint-disable-next-line react-hooks/rules-of-hooks
      y:  useTransform(sp, [s, s + 0.06], p.yr, { clamp: true }),
    };
  });

  /* ── Phase 4: Key Features (84 → 100%) ── */
  const featOp = useTransform(sp, [0.84, 0.90], [0, 1], { clamp: true });
  const featY  = useTransform(sp, [0.84, 0.90], [40, 0], { clamp: true });

  return (
    <div ref={ref} style={{ minHeight: '400vh', background: C.ice }}>
      <div className="sticky top-0 h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${C.ice} 0%, #e8e6ff 100%)` }}>

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 50% 40% at 50% 50%, rgba(61,53,232,0.06) 0%, transparent 100%)` }} />

        {/* Badge */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: C.indigo }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.indigo }}>AI Agent Identity</span>
        </div>

        {/* ── Persistent icon — visible across phases 1-3, always centered ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <motion.div style={{ opacity: iconOp, scale: iconScale, x: iconX }}>
            <img src={sanoIcon} alt="Sano" className="w-32 h-32 md:w-44 md:h-44 object-contain" />
          </motion.div>
        </div>

        {/* ── Phase 1: "Introducing:" label + logotype next to icon ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          {/* "Introducing:" above icon */}
          <div className="absolute" style={{ top: '50%', marginTop: -140 }}>
            <motion.p
              className="text-sm md:text-base font-semibold tracking-widest uppercase text-center"
              style={{ opacity: introOp, y: introY, color: C.indigo }}>
              Introducing
            </motion.p>
          </div>
          {/* Logotype (text only) to the right of icon */}
          <motion.div
            className="absolute"
            style={{
              left: '50%', top: '50%',
              marginLeft: 90, marginTop: -50,
              opacity: logotypeOp, x: logotypeX,
            }}>
            <img src={sanoLogotype} alt="Sano Clinical Data Intelligence"
              className="h-20 md:h-24 object-contain" />
          </motion.div>
        </div>

        {/* ── Phase 2: Personality label + pills ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative" style={{ width: '80vw', maxWidth: 700, height: 400 }}>
            {/* "PERSONALITY" label above icon */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 16 }}>
              <motion.h2
                className="text-2xl md:text-4xl font-extrabold tracking-wide uppercase text-center whitespace-nowrap"
                style={{
                  opacity: persLabelOp, y: persLabelY,
                  backgroundImage: `linear-gradient(90deg, ${C.deep}, ${C.indigo}, ${C.cyan})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Personality</motion.h2>
            </div>
            {/* Pills — wrapper centers, motion.span offsets via x/y */}
            {persPills.map((p, i) => (
              <div key={p.text} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.span
                  className="block px-5 py-2.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap text-white"
                  style={{
                    background: C.indigo,
                    opacity: ppAnims[i].op, x: ppAnims[i].x, y: ppAnims[i].y,
                  }}>{p.text}</motion.span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Phase 3: Tone of Voice label + pills ── */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative" style={{ width: '80vw', maxWidth: 700, height: 400 }}>
            {/* "TONE OF VOICE" label above icon */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 16 }}>
              <motion.h2
                className="text-2xl md:text-4xl font-extrabold tracking-wide uppercase text-center whitespace-nowrap"
                style={{
                  opacity: toneLabelOp, y: toneLabelY,
                  backgroundImage: `linear-gradient(90deg, ${C.cyan}, ${C.indigo}, ${C.deep})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Tone of Voice</motion.h2>
            </div>
            {/* Pills */}
            {tonePills.map((p, i) => (
              <div key={p.text} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.span
                  className="block px-5 py-2.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap text-white"
                  style={{
                    background: C.cyan,
                    opacity: tpAnims[i].op, x: tpAnims[i].x, y: tpAnims[i].y,
                  }}>{p.text}</motion.span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Phase 4: Key Features ── */}
        <motion.div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10"
          style={{ opacity: featOp, y: featY }}>
          <p className="text-xs font-bold tracking-widest uppercase text-center mb-4" style={{ color: C.indigo }}>
            Key Features
          </p>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {aiFeatures.map(({ icon: FeatIcon, label, sub }) => (
              <div key={label}
                className="rounded-xl p-4 bg-white border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${C.indigo}12` }}>
                  <FeatIcon className="w-4 h-4" style={{ color: C.indigo }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs leading-snug">{label}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Onliness Section (scroll-animated) ────────────────────────────────────
function OnlinessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 50%'] });

  // Each card reveals progressively
  const ops = onliness.map((_, i) => {
    const start = i * 0.12;
    const end = start + 0.18;
    return {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      op: useTransform(scrollYProgress, [start, end], [0, 1], { clamp: true }),
      // eslint-disable-next-line react-hooks/rules-of-hooks
      y:  useTransform(scrollYProgress, [start, end], [40, 0], { clamp: true }),
      // eslint-disable-next-line react-hooks/rules-of-hooks
      scale: useTransform(scrollYProgress, [start, end], [0.92, 1], { clamp: true }),
    };
  });

  return (
    <section className="relative py-28 px-6 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${C.deep} 0%, #1e1b6e 50%, #0d0b4a 100%)` }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(62,207,207,0.07) 0%, transparent 100%)` }} />

      <div ref={ref} className="max-w-5xl mx-auto relative z-10">
        <FadeUp className="text-center mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: C.cyan }}>Onliness Statement</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            What makes us{' '}
            <span style={{ backgroundImage: `linear-gradient(90deg, ${C.cyan}, ${C.indigo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              unique.
            </span>
          </h2>
        </FadeUp>

        {/* WHAT — hero card, full width */}
        <motion.div
          className="rounded-2xl p-8 md:p-10 border border-white/10 bg-white/[0.06] backdrop-blur-sm mb-5"
          style={{ opacity: ops[0].op, y: ops[0].y, scale: ops[0].scale }}
        >
          <span className="text-lg md:text-xl font-extrabold tracking-widest uppercase block mb-3" style={{ color: C.cyan }}>
            {onliness[0].label}
          </span>
          <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-3xl">{onliness[0].text}</p>
        </motion.div>

        {/* HOW + WHO — two columns */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {[1, 2].map(i => (
            <motion.div key={onliness[i].label}
              className="rounded-2xl p-7 border border-white/10 bg-white/[0.06] backdrop-blur-sm"
              style={{ opacity: ops[i].op, y: ops[i].y, scale: ops[i].scale }}
            >
              <span className="text-base md:text-lg font-extrabold tracking-widest uppercase block mb-2" style={{ color: C.cyan }}>
                {onliness[i].label}
              </span>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">{onliness[i].text}</p>
            </motion.div>
          ))}
        </div>

        {/* WHERE + WHY + WHEN — three columns */}
        <div className="grid md:grid-cols-3 gap-5">
          {[3, 4, 5].map(i => (
            <motion.div key={onliness[i].label}
              className="rounded-2xl p-6 border border-white/10 bg-white/[0.06] backdrop-blur-sm"
              style={{ opacity: ops[i].op, y: ops[i].y, scale: ops[i].scale }}
            >
              <span className="text-base font-extrabold tracking-widest uppercase block mb-2" style={{ color: C.cyan }}>
                {onliness[i].label}
              </span>
              <p className="text-white/75 text-sm leading-relaxed">{onliness[i].text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works Flow (scroll-animated) ───────────────────────────────────
function HowItWorksFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] });

  // Step reveals
  const s1Op = useTransform(scrollYProgress, [0, 0.15], [0, 1], { clamp: true });
  const s1Y  = useTransform(scrollYProgress, [0, 0.15], [30, 0], { clamp: true });
  // Arrow 1
  const a1Op = useTransform(scrollYProgress, [0.12, 0.25], [0, 1], { clamp: true });
  const a1W  = useTransform(scrollYProgress, [0.12, 0.25], ['0%', '100%'], { clamp: true });
  // Step 2
  const s2Op = useTransform(scrollYProgress, [0.22, 0.40], [0, 1], { clamp: true });
  const s2Y  = useTransform(scrollYProgress, [0.22, 0.40], [30, 0], { clamp: true });
  const s2Scale = useTransform(scrollYProgress, [0.22, 0.40], [0.9, 1], { clamp: true });
  // Arrow 2
  const a2Op = useTransform(scrollYProgress, [0.38, 0.52], [0, 1], { clamp: true });
  const a2W  = useTransform(scrollYProgress, [0.38, 0.52], ['0%', '100%'], { clamp: true });
  // Step 3
  const s3Op = useTransform(scrollYProgress, [0.48, 0.65], [0, 1], { clamp: true });
  const s3Y  = useTransform(scrollYProgress, [0.48, 0.65], [30, 0], { clamp: true });
  // Callout
  const cOp  = useTransform(scrollYProgress, [0.70, 0.90], [0, 1], { clamp: true });

  return (
    <div ref={ref} className="mb-14">
      <div className="rounded-3xl p-8 md:p-10 border border-gray-100 bg-white shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase mb-8 text-center" style={{ color: C.indigo }}>How it works</p>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-0">

          {/* Step 1 — Patient */}
          <motion.div className="flex-1 flex flex-col items-center text-center px-4"
            style={{ opacity: s1Op, y: s1Y }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${C.indigo}10` }}>
              <Users className="w-7 h-7" style={{ color: C.indigo }} />
            </div>
            <p className="font-bold text-base mb-1" style={{ color: C.deep }}>Patient uploads</p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
              Medical documents, prescriptions, lab results — in any language or format
            </p>
          </motion.div>

          {/* Arrow 1 */}
          <motion.div className="flex-shrink-0 flex items-center justify-center md:mt-7"
            style={{ opacity: a1Op }}>
            <div className="hidden md:flex items-center gap-1 overflow-hidden">
              <motion.div className="h-[2px] rounded-full" style={{ width: a1W, minWidth: 2, background: `linear-gradient(90deg, ${C.indigo}40, ${C.indigo})` }} />
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: C.indigo }} />
            </div>
            <div className="md:hidden">
              <ChevronDown className="w-5 h-5" style={{ color: C.indigo }} />
            </div>
          </motion.div>

          {/* Step 2 — AI Agent */}
          <motion.div className="flex-1 flex flex-col items-center text-center px-4"
            style={{ opacity: s2Op, y: s2Y, scale: s2Scale }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
              style={{ background: `linear-gradient(135deg, ${C.indigo}15, ${C.cyan}15)` }}>
              <Brain className="w-7 h-7" style={{ color: C.indigo }} />
              <motion.div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: C.cyan }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Zap className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <p className="font-bold text-base mb-1" style={{ color: C.deep }}>AI Agent processes</p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
              Extracts, structures, translates and maps medications automatically
            </p>
          </motion.div>

          {/* Arrow 2 */}
          <motion.div className="flex-shrink-0 flex items-center justify-center md:mt-7"
            style={{ opacity: a2Op }}>
            <div className="hidden md:flex items-center gap-1 overflow-hidden">
              <motion.div className="h-[2px] rounded-full" style={{ width: a2W, minWidth: 2, background: `linear-gradient(90deg, ${C.cyan}40, ${C.cyan})` }} />
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: C.cyan }} />
            </div>
            <div className="md:hidden">
              <ChevronDown className="w-5 h-5" style={{ color: C.cyan }} />
            </div>
          </motion.div>

          {/* Step 3 — Doctor */}
          <motion.div className="flex-1 flex flex-col items-center text-center px-4"
            style={{ opacity: s3Op, y: s3Y }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${C.cyan}12` }}>
              <Stethoscope className="w-7 h-7" style={{ color: C.cyan }} />
            </div>
            <p className="font-bold text-base mb-1" style={{ color: C.deep }}>Doctor reviews</p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
              Pre-filled, structured record ready to approve — no manual re-entry
            </p>
          </motion.div>

        </div>

        {/* Time saved callout */}
        <motion.div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3"
          style={{ opacity: cOp }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${C.indigo}10` }}>
            <Zap className="w-4 h-4" style={{ color: C.indigo }} />
          </div>
          <p className="text-sm text-gray-500">
            From <span className="font-bold" style={{ color: C.indigo }}>unstructured documents</span> to <span className="font-bold" style={{ color: C.cyan }}>system-ready data</span> — in seconds, not hours
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Scroll Transform Card ──────────────────────────────────────────────────
function ScrollTransformCard({
  issue, solution, progress,
}: {
  issue: { icon: React.ElementType; title: string; desc: string; color: string };
  solution: { from: string; to: string; desc: string; color: string };
  progress: MotionValue<number>;
}) {
  const Icon = issue.icon;
  // Progressive strikethrough via clip-path reveal
  const stripPct   = useTransform(progress, [0.05, 0.45], [100, 0]);
  const strikeClip = useMotionTemplate`inset(0 ${stripPct}% 0 0)`;
  const issueOp    = useTransform(progress, [0.35, 0.60], [1, 0]);
  const issueY     = useTransform(progress, [0.35, 0.60], [0, -20]);
  const solOp      = useTransform(progress, [0.50, 0.80], [0, 1]);
  const solY       = useTransform(progress, [0.50, 0.80], [20, 0]);
  const barW       = useTransform(progress, [0, 1], ['0%', '100%']);
  const borderA    = useTransform(progress, [0, 0.5, 1], ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)', solution.color + '55']);
  // Icon: gray in issue state → colored in solution state
  const iconColor  = useTransform(progress, [0.50, 0.80], ['#6b7280', issue.color]);
  const iconBg     = useTransform(progress, [0.50, 0.80], ['rgba(107,114,128,0.15)', issue.color + '40']);

  const titleStyle = {
    backgroundImage: `linear-gradient(90deg, #f87171, #94a3b8)`,
    WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent',
    fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.25,
  };

  return (
    <motion.div
      className="rounded-2xl relative overflow-hidden flex flex-col"
      style={{ background: 'rgba(255,255,255,0.04)', height: 280, border: '1px solid', borderColor: borderA }}
    >
      <div className="p-6 flex flex-col flex-1">
        <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
          style={{ background: iconBg }}>
          <motion.div style={{ color: iconColor }}>
            <Icon className="w-5 h-5" />
          </motion.div>
        </motion.div>

        <div className="relative flex-1" style={{ minHeight: 0 }}>
          {/* ── Issue state ── */}
          <motion.div className="absolute inset-0 flex flex-col gap-3 justify-start" style={{ opacity: issueOp, y: issueY }}>
            <div className="relative">
              <h3 style={titleStyle}>{issue.title}</h3>
              {/* Strikethrough overlay — clip-path reveals progressively left→right */}
              <motion.h3
                className="absolute top-0 left-0 right-0"
                aria-hidden="true"
                style={{
                  ...titleStyle,
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(255,255,255,0.8)',
                  textDecorationThickness: '2px',
                  clipPath: strikeClip,
                }}
              >{issue.title}</motion.h3>
            </div>
            <p className="text-white/55 text-sm leading-relaxed">{issue.desc}</p>
          </motion.div>

          {/* ── Solution state ── */}
          <motion.div className="absolute inset-0 flex flex-col gap-3 justify-start" style={{ opacity: solOp, y: solY }}>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-1"
                style={{ background: `${solution.color}30` }}>
                <CheckCircle className="w-3 h-3" style={{ color: solution.color }} />
              </div>
              <h3 style={{
                backgroundImage: `linear-gradient(135deg, ${solution.color}, ${C.cyan})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.25,
              }}>{solution.to}</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{solution.desc}</p>
          </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div className="absolute bottom-0 left-0 h-[3px]"
        style={{ width: barW, background: `linear-gradient(90deg, ${issue.color}, ${C.cyan})` }} />
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function StoryPage({ onEnterApp }: { onEnterApp: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const issuesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: issuesSP } = useScroll({ target: issuesRef, offset: ['start start', 'end end'] });
  const cProg0 = useTransform(issuesSP, [0.02, 0.35], [0, 1]);
  const cProg1 = useTransform(issuesSP, [0.22, 0.55], [0, 1]);
  const cProg2 = useTransform(issuesSP, [0.42, 0.72], [0, 1]);
  const cProg3 = useTransform(issuesSP, [0.60, 0.90], [0, 1]);
  // Header: fade out / fade in when first card begins animating
  const issueHdrOp = useTransform(cProg0, [0, 0.15], [1, 0], { clamp: true });
  const solveHdrOp = useTransform(cProg0, [0.10, 0.25], [0, 1], { clamp: true });

  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 240}px, ${e.clientY - 240}px)`;
      }
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div className="font-sans" style={{ background: '#080717', overflowX: 'clip' }}>

      {/* ── CURSOR GLOW (global, no re-render) ────────────────────────── */}
      <div className="pointer-events-none" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
        <div
          ref={glowRef}
          style={{
            width: 480, height: 480,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(62,207,207,0.12) 0%, transparent 70%)`,
            willChange: 'transform',
          }}
        />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${C.deep} 0%, #1e1b6e 50%, #0d0b4a 100%)` }}
      >
        <Particles />

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

            {/* 1 — Where a Swiss doctor's time goes (scroll-animated) */}
            <DoctorTimeBlock />


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
                  <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/80 flex items-center gap-2">
                    <UserRound className="w-3.5 h-3.5" style={{ color: C.cyan }} /> Swiss Resident
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(61,53,232,0.15)' }}>
                      <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 flex-shrink-0" style={{ color: C.cyan }} /> Private Doctor Practice
                      </p>
                      <p className="text-white/60 text-xs leading-snug">Own IT system, not connected to hospital</p>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-white/70" />
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(61,53,232,0.15)' }}>
                      <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: C.cyan }} /> Private Specialist
                      </p>
                      <p className="text-white/60 text-xs leading-snug">Referral letter or PDF sent manually</p>
                    </div>
                  </div>
                </div>

                {/* Foreign Patient track */}
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/80 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" style={{ color: C.cyan }} /> Foreign Patient
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(62,207,207,0.12)' }}>
                      <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 flex-shrink-0" style={{ color: C.cyan }} /> Medical history from abroad
                      </p>
                      <p className="text-white/60 text-xs leading-snug">Foreign language, formats, coding systems</p>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-white/70" />
                    <div className="flex-1 rounded-xl p-4 border border-white/10" style={{ background: 'rgba(62,207,207,0.12)' }}>
                      <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                        <Siren className="w-4 h-4 flex-shrink-0" style={{ color: C.cyan }} /> Swiss Doctor or Emergency Room
                      </p>
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${C.cyan}20` }}>
                  <Hospital className="w-5 h-5" style={{ color: C.cyan }} />
                </div>
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

      {/* ── ISSUES → SOLUTIONS (sticky scroll) ───────────────────────────── */}
      <div ref={issuesRef} style={{ minHeight: '200vh', background: '#0a0920' }}>
        <div className="sticky top-0 min-h-screen flex flex-col justify-center py-3 px-6 overflow-hidden"
          style={{ background: '#0a0920' }}>

          {/* Subtle radial glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(61,53,232,0.07) 0%, transparent 100%)` }} />

          <div className="max-w-5xl mx-auto w-full relative z-10">

            {/* Header — fade out / fade in */}
            <div className="relative mb-8 text-center" style={{ height: 64 }}>
              <motion.div style={{ opacity: issueHdrOp }}
                className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">Issues behind time loss</h2>
              </motion.div>
              <motion.div style={{ opacity: solveHdrOp }}
                className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">How could we improve that?</h2>
              </motion.div>
            </div>

            {/* 4 cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScrollTransformCard issue={issues[0]} solution={solutions[0]} progress={cProg0} />
              <ScrollTransformCard issue={issues[1]} solution={solutions[1]} progress={cProg1} />
              <ScrollTransformCard issue={issues[2]} solution={solutions[2]} progress={cProg2} />
              <ScrollTransformCard issue={issues[3]} solution={solutions[3]} progress={cProg3} />
            </div>

            {/* Sources */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-white/45 text-xs">Source — <span className="text-white/70 font-medium">Frontiers in Public Health</span></p>
            </div>

          </div>
        </div>
      </div>

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

          {/* Infographic — How it works (scroll-animated) */}
          <HowItWorksFlow />

        </div>
      </section>

      {/* ── ONLINESS STATEMENT ────────────────────────────────────────────── */}
      <OnlinessSection />

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
                desc: <>Swiss hospital professional needing <strong>seamless multilingual interfaces</strong> without <strong>manual translation</strong>.</>,
                motto: '"I want to focus on my work, not handle data inputs!"',
                pains: [
                  <><strong>Too many documents</strong> to analyse</>,
                  <><strong>Too many patients</strong> to monitor</>,
                  <>Must approach <strong>different cultures</strong></>,
                ],
                wants: [
                  <>Prioritise <strong>efficiency</strong></>,
                  <><strong>Clear communication</strong></>,
                  <><strong>Speed up</strong> the work</>,
                ],
                color: C.indigo,
              },
              {
                id: '#2', title: 'Patient',
                desc: <>Foreign patient handling <strong>fragmented medical records</strong>, including <strong>foreign language</strong> documents.</>,
                motto: '"I would like clear communication between my clinical data and local healthcare."',
                pains: [
                  <>Documents in <strong>different languages</strong>/formats</>,
                  <>Navigating a <strong>different healthcare system</strong></>,
                  <>A lot of documents in <strong>different formats</strong></>,
                ],
                wants: [
                  <><strong>Translate</strong> documents across languages</>,
                  <>Navigate a <strong>new healthcare system</strong></>,
                  <><strong>Access and share</strong> medical information</>,
                ],
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
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={title === 'Doctor' ? avatarDoctor : avatarPatient}
                    alt={title}
                    className={`${title === 'Doctor' ? 'w-16 h-16' : 'w-14 h-14'} object-contain`}
                  />
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>Target User {id}</p>
                    <p className="font-extrabold text-xl" style={{ color: C.deep }}>{title}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{desc}</p>
                <p className="italic text-gray-600 text-sm border-l-2 pl-4 mb-6 leading-relaxed" style={{ borderColor: color }}>{motto}</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-400">Pain Points</p>
                    <div className="space-y-2.5">
                      {pains.map((p, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-400">Intent</p>
                    <div className="space-y-2.5">
                      {wants.map((w, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                          <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color }} />
                          <span>{w}</span>
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

      {/* ── AI AGENT IDENTITY (scroll-animated) ────────────────────────── */}
      <AgentIdentitySection />

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
            {scaleSteps.map(({ icon: ScaleIcon, region, current, role, desc, constraints, color }, i) => (
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                  <ScaleIcon className="w-5 h-5" style={{ color }} />
                </div>
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
