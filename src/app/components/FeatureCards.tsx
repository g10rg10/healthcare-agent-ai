import { useState, useCallback, useRef, type FC } from 'react';

/* ------------------------------------------------------------------ */
/*  CSS-in-JS style tag (keyframes + scoped classes)                  */
/* ------------------------------------------------------------------ */

const STYLES = `
/* ── variables ── */
.fc-root {
  --bg: #f3f3fb;
  --card: #ffffff;
  --ink: #0e1234;
  --ink-2: #4b5174;
  --muted: #8a90b2;
  --line: #e7e8f3;
  --indigo: #3b3bef;
  --indigo-2: #5b5bff;
  --indigo-soft: #eeeefd;
  --indigo-soft-2: #e3e3fb;
  --sky: #1aa0ff;
  --grad: linear-gradient(90deg, #2d2ef0 0%, #4b8dff 55%, #21b5ff 100%);
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

/* ── layout ── */
.fc-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 24px 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.fc-head {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; margin-bottom: 16px; text-align: center;
  flex-shrink: 0;
}
.fc-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 10px 18px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--indigo);
  font-weight: 600;
  box-shadow: 0 1px 0 rgba(20,22,60,0.02);
}
.fc-eyebrow .fc-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--indigo);
}
.fc-h1 {
  margin: 0;
  font-size: 36px; line-height: 1.1; letter-spacing: -0.02em;
  font-weight: 700; max-width: 720px;
}
.fc-h1 .fc-grad {
  background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.fc-sub {
  margin: 0; color: var(--ink-2); font-size: 15px; max-width: 600px; line-height: 1.5;
}

/* ── grid ── */
.fc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
}
@media (max-width: 1080px) { .fc-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 800px)  { .fc-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px)  { .fc-grid { grid-template-columns: 1fr; } }

/* ── card ── */
.fc-card {
  position: relative;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px;
  min-height: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s, border-color .35s;
  box-shadow: 0 1px 0 rgba(20,22,60,0.02);
}
.fc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 60px -28px rgba(40,50,180,.35), 0 2px 0 rgba(20,22,60,0.02);
  border-color: #d9daf2;
}

/* face / dissolve */
.fc-face {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; gap: 14px;
  transition: opacity .45s cubic-bezier(.2,.7,.2,1), filter .45s, transform .55s;
}
.fc-card.is-live .fc-face {
  opacity: 0; filter: blur(6px); transform: scale(.96); pointer-events: none;
}
.fc-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--indigo-soft);
  display: grid; place-items: center;
  color: var(--indigo);
  border: 1px solid #e2e3fb;
  transition: transform .4s cubic-bezier(.2,.7,.2,1), background .35s;
}
.fc-card:hover .fc-icon-wrap { background: var(--indigo-soft-2); transform: scale(1.05) rotate(-3deg); }
.fc-icon-wrap svg { width: 22px; height: 22px; }
.fc-title {
  font-size: 17px; font-weight: 700; letter-spacing: -0.01em;
  background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.fc-desc { font-size: 13.5px; color: var(--muted); line-height: 1.45; margin: 0; }

/* stage */
.fc-stage {
  position: absolute; inset: 0; z-index: 3;
  opacity: 0; pointer-events: none;
  padding: 18px;
  display: flex; flex-direction: column; justify-content: space-between;
  transition: opacity .35s cubic-bezier(.2,.7,.2,1);
}
.fc-card.is-live .fc-stage { opacity: 1; }
.fc-stage-title {
  font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--indigo); display: flex; align-items: center; gap: 8px;
}
.fc-pulse {
  width: 6px; height: 6px; border-radius: 50%; background: var(--indigo);
  box-shadow: 0 0 0 0 rgba(59,59,239,.5);
  animation: fc-pulse 1.4s infinite;
}
@keyframes fc-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(59,59,239,.45); }
  70%  { box-shadow: 0 0 0 10px rgba(59,59,239,0); }
  100% { box-shadow: 0 0 0 0 rgba(59,59,239,0); }
}
.fc-stage-caption { font-size: 12.5px; color: var(--ink-2); line-height: 1.4; }
.fc-scene { flex: 1; position: relative; margin: 8px 0; }

/* shared pill */
.fc-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  background: #fff; border: 1px solid var(--line); border-radius: 999px;
  font-size: 11px; color: var(--ink-2); font-weight: 500;
}
.fc-pill .fc-sw { width: 6px; height: 6px; border-radius: 50%; background: var(--indigo); }

/* ───────────────────────────────── */
/* SCENE 1 : Process documents       */
/* ───────────────────────────────── */
.docs-scene .paper {
  position: absolute; width: 44px; height: 56px; border-radius: 6px;
  background: #fff; border: 1px solid var(--line);
  box-shadow: 0 6px 14px -8px rgba(40,50,180,.25); opacity: 0;
}
.docs-scene .paper::before, .docs-scene .paper::after {
  content: ""; position: absolute; left: 6px; right: 6px; height: 3px; border-radius: 2px; background: var(--indigo-soft-2);
}
.docs-scene .paper::before { top: 10px; }
.docs-scene .paper::after  { top: 18px; right: 18px; }
.docs-scene .target {
  position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%);
  width: 70px; height: 70px; border-radius: 14px;
  background: linear-gradient(180deg, #fff, #f4f5ff);
  border: 1px solid #d9daf2; display: grid; place-items: center; color: var(--indigo);
}
.fc-card.is-live .docs-scene .paper { animation: fc-paperIn .9s forwards; }
.fc-card.is-live .docs-scene .p1 { animation-delay: .05s; }
.fc-card.is-live .docs-scene .p2 { animation-delay: .25s; }
.fc-card.is-live .docs-scene .p3 { animation-delay: .45s; }
.fc-card.is-live .docs-scene .p4 { animation-delay: .65s; }
@keyframes fc-paperIn {
  0%   { opacity: 0; transform: translate(var(--fx,-80px), var(--fy,-50px)) rotate(var(--fr,-20deg)) scale(.7); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: translate(calc(50% - 22px), 12px) rotate(0deg) scale(.55); }
}

/* ───────────────────────────────── */
/* SCENE 2 : Detect type & origin    */
/* ───────────────────────────────── */
.scan-scene .doc {
  position: absolute; left: 50%; top: 8px; transform: translateX(-50%);
  width: 78px; height: 100px; border-radius: 8px; background: #fff;
  border: 1px solid var(--line); box-shadow: 0 8px 18px -10px rgba(40,50,180,.18); overflow: hidden;
}
.scan-scene .doc .ln { height: 4px; background: var(--indigo-soft-2); margin: 8px; border-radius: 2px; }
.scan-scene .doc .ln.short { width: 40%; }
.scan-scene .laser {
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 86px; height: 2px; background: linear-gradient(90deg, transparent, var(--indigo), transparent);
  top: 8px; opacity: 0; box-shadow: 0 0 12px rgba(59,59,239,.6);
}
.fc-card.is-live .scan-scene .laser { animation: fc-scan 1.6s ease-in-out infinite; }
@keyframes fc-scan {
  0%   { top: 8px; opacity: 0; }
  10%  { opacity: 1; }
  50%  { top: 100px; opacity: 1; }
  60%  { opacity: 0; }
  100% { opacity: 0; top: 8px; }
}
.scan-scene .tags {
  position: absolute; left: 0; right: 0; bottom: 4px;
  display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
}
.scan-scene .tags .fc-pill { opacity: 0; transform: translateY(6px); }
.fc-card.is-live .scan-scene .tags .fc-pill { animation: fc-tagIn .5s forwards; }
.fc-card.is-live .scan-scene .tags .fc-pill:nth-child(1) { animation-delay: .8s; }
.fc-card.is-live .scan-scene .tags .fc-pill:nth-child(2) { animation-delay: 1.05s; }
.fc-card.is-live .scan-scene .tags .fc-pill:nth-child(3) { animation-delay: 1.3s; }
@keyframes fc-tagIn { to { opacity: 1; transform: translateY(0); } }

/* ───────────────────────────────── */
/* SCENE 3 : Extract clinical data   */
/* ───────────────────────────────── */
.extract-scene .doc {
  position: absolute; left: 14px; top: 6px; bottom: 6px; width: 80px;
  background: #fff; border: 1px solid var(--line); border-radius: 8px; overflow: hidden;
}
.extract-scene .doc .ln { height: 4px; background: var(--indigo-soft-2); margin: 8px; border-radius: 2px; }
.extract-scene .doc .hl {
  position: absolute; left: 6px; right: 6px; height: 8px; border-radius: 3px;
  background: linear-gradient(90deg, #d9defe, #b8c1fb); opacity: 0;
}
.fc-card.is-live .extract-scene .hl.h1 { top: 18px; animation: fc-hl 1.6s forwards; animation-delay: .1s; }
.fc-card.is-live .extract-scene .hl.h2 { top: 38px; animation: fc-hl 1.6s forwards; animation-delay: .35s; }
.fc-card.is-live .extract-scene .hl.h3 { top: 58px; animation: fc-hl 1.6s forwards; animation-delay: .6s; }
@keyframes fc-hl {
  0%   { opacity: 0; transform: scaleX(0); transform-origin: left; }
  30%  { opacity: 1; transform: scaleX(1); }
  100% { opacity: 1; transform: scaleX(1); }
}
.extract-scene .out {
  position: absolute; right: 10px; top: 14px; bottom: 14px; width: 110px;
}
.extract-scene .out .row {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; background: #fff; border: 1px solid var(--line);
  border-radius: 8px; margin-bottom: 6px; font-size: 10px;
  color: var(--ink-2); opacity: 0; transform: translateX(8px);
}
.extract-scene .out .row b { color: var(--indigo); font-weight: 600; }
.fc-card.is-live .extract-scene .out .row { animation: fc-rowIn .45s forwards; }
.fc-card.is-live .extract-scene .out .row:nth-child(1) { animation-delay: .7s; }
.fc-card.is-live .extract-scene .out .row:nth-child(2) { animation-delay: .95s; }
.fc-card.is-live .extract-scene .out .row:nth-child(3) { animation-delay: 1.2s; }
@keyframes fc-rowIn { to { opacity: 1; transform: translateX(0); } }

/* ───────────────────────────────── */
/* SCENE 4 : Standardise data        */
/* ───────────────────────────────── */
.std-scene { display: flex; align-items: center; gap: 8px; padding: 0 6px; }
.std-scene .col { flex: 1; }
.std-scene .row {
  display: flex; align-items: center; gap: 6px; height: 18px;
  background: #fff; border: 1px solid var(--line); border-radius: 6px;
  padding: 0 8px; margin-bottom: 6px; font-size: 10px; color: var(--ink-2);
  font-family: 'JetBrains Mono', monospace;
}
.std-scene .col.before .row { color: #b0556a; }
.std-scene .arrow { color: var(--indigo); }
.std-scene .col.after .row {
  color: var(--indigo); border-color: #d9daf2; background: #fff;
  opacity: 0; transform: translateY(4px);
}
.fc-card.is-live .std-scene .col.after .row { animation: fc-stdIn .45s forwards; }
.fc-card.is-live .std-scene .col.after .row:nth-child(1) { animation-delay: .35s; }
.fc-card.is-live .std-scene .col.after .row:nth-child(2) { animation-delay: .55s; }
.fc-card.is-live .std-scene .col.after .row:nth-child(3) { animation-delay: .75s; }
@keyframes fc-stdIn { to { opacity: 1; transform: translateY(0); } }

/* ───────────────────────────────── */
/* SCENE 5 : Convert formats         */
/* ───────────────────────────────── */
.conv-scene { display: flex; align-items: center; justify-content: center; gap: 18px; height: 100%; }
.conv-scene .blob {
  width: 64px; height: 80px; border-radius: 10px; background: #fff;
  border: 1px solid var(--line); position: relative; display: grid; place-items: center;
  color: var(--ink-2); font-family: 'JetBrains Mono', monospace; font-size: 11px;
}
.conv-scene .blob .tag {
  position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
  padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 600; letter-spacing: .04em;
  background: var(--indigo-soft); color: var(--indigo); border: 1px solid #dadbfa;
}
.conv-scene .arrow {
  width: 36px; height: 2px; background: var(--indigo); position: relative;
  transform-origin: left; transform: scaleX(0);
}
.conv-scene .arrow::after {
  content: ""; position: absolute; right: -6px; top: -4px;
  border: 5px solid transparent; border-left: 7px solid var(--indigo);
}
.fc-card.is-live .conv-scene .arrow { animation: fc-arr .8s forwards; }
@keyframes fc-arr { to { transform: scaleX(1); } }
.conv-scene .blob.b { opacity: 0; }
.fc-card.is-live .conv-scene .blob.b { animation: fc-blobIn .5s forwards .7s; }
@keyframes fc-blobIn { to { opacity: 1; } }

/* ───────────────────────────────── */
/* SCENE 6 : Pre-fill records         */
/* ───────────────────────────────── */
.form-scene { padding: 4px 6px; }
.form-scene .field {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid var(--line); border-radius: 8px;
  padding: 6px 10px; margin-bottom: 6px; font-size: 11px; color: var(--ink-2);
  font-family: 'JetBrains Mono', monospace;
}
.form-scene .field .lbl { color: var(--muted); width: 56px; font-size: 10px; }
.form-scene .field .val { color: var(--indigo); }
.form-scene .field .typed {
  display: inline-block; white-space: nowrap; overflow: hidden; max-width: 0;
  border-right: 1px solid var(--indigo);
}
.fc-card.is-live .form-scene .field .typed { animation: fc-typing 1s steps(18,end) forwards, fc-caret 1s steps(1) infinite; }
.fc-card.is-live .form-scene .field:nth-child(1) .typed { animation-delay: .2s, .2s; }
.fc-card.is-live .form-scene .field:nth-child(2) .typed { animation-delay: .9s, .9s; }
.fc-card.is-live .form-scene .field:nth-child(3) .typed { animation-delay: 1.5s, 1.5s; }
@keyframes fc-typing { to { max-width: 140px; } }
@keyframes fc-caret  { 50% { border-color: transparent; } }

/* ───────────────────────────────── */
/* SCENE 7 : Map medications          */
/* ───────────────────────────────── */
.map-scene { display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; }
.map-scene .stack { display: flex; flex-direction: column; gap: 6px; }
.map-scene .chip {
  background: #fff; border: 1px solid var(--line); border-radius: 8px;
  padding: 4px 8px; font-size: 10px; color: var(--ink-2);
  font-family: 'JetBrains Mono', monospace; min-width: 78px;
}
.map-scene .chip.match { color: var(--indigo); border-color: #d9daf2; background: #fff; }
.map-scene .lines { position: relative; flex: 1; height: 60px; margin: 0 6px; }
.map-scene .lines svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.map-scene .lines path {
  stroke: var(--indigo); stroke-width: 1.5; fill: none;
  stroke-dasharray: 80; stroke-dashoffset: 80;
}
.fc-card.is-live .map-scene .lines path { animation: fc-dash 1s forwards; }
.fc-card.is-live .map-scene .lines path:nth-child(1) { animation-delay: .2s; }
.fc-card.is-live .map-scene .lines path:nth-child(2) { animation-delay: .5s; }
.fc-card.is-live .map-scene .lines path:nth-child(3) { animation-delay: .8s; }
@keyframes fc-dash { to { stroke-dashoffset: 0; } }

/* ───────────────────────────────── */
/* SCENE 8 : Suggest alternatives     */
/* ───────────────────────────────── */
.alt-scene { position: relative; height: 100%; }
.alt-scene .center {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  padding: 8px 12px; border-radius: 10px; border: 1px dashed #c7c8e8;
  background: #f9f9ff; color: var(--muted); font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
}
.alt-scene .alt {
  position: absolute; padding: 4px 9px; border-radius: 999px;
  background: #fff; border: 1px solid #d9daf2; color: var(--indigo);
  font-size: 10px; font-weight: 600; opacity: 0;
}
.alt-scene .alt.a1 { left: 6%;  top: 8%; }
.alt-scene .alt.a2 { right: 4%; top: 14%; }
.alt-scene .alt.a3 { left: 10%; bottom: 6%; }
.alt-scene .alt.a4 { right: 8%; bottom: 10%; }
.fc-card.is-live .alt-scene .alt { animation: fc-altPop .6s forwards cubic-bezier(.4,1.6,.5,1); }
.fc-card.is-live .alt-scene .alt.a1 { animation-delay: .3s; }
.fc-card.is-live .alt-scene .alt.a2 { animation-delay: .5s; }
.fc-card.is-live .alt-scene .alt.a3 { animation-delay: .7s; }
.fc-card.is-live .alt-scene .alt.a4 { animation-delay: .9s; }
@keyframes fc-altPop { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }

/* ───────────────────────────────── */
/* SCENE 9 : Flag missing data       */
/* ───────────────────────────────── */
.flag-scene { padding: 4px 6px; }
.flag-scene .row {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border: 1px solid var(--line); border-radius: 8px;
  padding: 6px 10px; margin-bottom: 6px; font-size: 10px; color: var(--ink-2);
  font-family: 'JetBrains Mono', monospace;
}
.flag-scene .row.miss { border-color: #f4d4d6; background: #fff5f6; color: #c54a58; }
.flag-scene .row .flag-ic { color: #d8434f; opacity: 0; transform: scale(.5); }
.fc-card.is-live .flag-scene .row .flag-ic { animation: fc-flagPop .5s forwards cubic-bezier(.4,1.6,.5,1); }
.fc-card.is-live .flag-scene .row:nth-of-type(1) .flag-ic { animation-delay: .4s; }
.fc-card.is-live .flag-scene .row:nth-of-type(2) .flag-ic { animation-delay: .8s; }
@keyframes fc-flagPop { to { opacity: 1; transform: scale(1); } }

/* ───────────────────────────────── */
/* SCENE 10 : Request input           */
/* ───────────────────────────────── */
.ask-scene { padding: 6px; display: flex; flex-direction: column; gap: 8px; }
.ask-scene .bubble {
  max-width: 80%; padding: 8px 10px; border-radius: 12px;
  font-size: 11px; line-height: 1.35;
  opacity: 0; transform: translateY(6px);
}
.ask-scene .bubble.ai {
  background: var(--indigo-soft); color: var(--indigo);
  border: 1px solid #d9daf2; border-bottom-left-radius: 4px;
  align-self: flex-start;
}
.ask-scene .bubble.dr {
  background: #fff; color: var(--ink-2);
  border: 1px solid var(--line); border-bottom-right-radius: 4px;
  align-self: flex-end;
}
.fc-card.is-live .ask-scene .bubble { animation: fc-bubbleIn .45s forwards; }
.fc-card.is-live .ask-scene .bubble:nth-child(1) { animation-delay: .25s; }
.fc-card.is-live .ask-scene .bubble:nth-child(2) { animation-delay: 1.0s; }
@keyframes fc-bubbleIn { to { opacity: 1; transform: translateY(0); } }

/* ───────────────────────────────── */
/* SCENE 11 : Escalate cases          */
/* ───────────────────────────────── */
.esc-scene { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; height: 100%; }
.esc-scene .case {
  padding: 6px 10px; border-radius: 8px; background: #fff; border: 1px solid var(--line);
  font-size: 10px; color: var(--ink-2); font-family: 'JetBrains Mono', monospace;
}
.esc-scene .specialists { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; }
.esc-scene .spec {
  display: flex; align-items: center; gap: 6px; padding: 4px 8px;
  border-radius: 999px; background: #fff; border: 1px solid var(--line); font-size: 10px; color: var(--ink-2);
}
.esc-scene .spec .av {
  width: 14px; height: 14px; border-radius: 50%; background: var(--indigo-soft); border: 1px solid #d9daf2;
}
.esc-scene .spec.active { border-color: var(--indigo); color: var(--indigo); }
.esc-scene .spec.active .av { background: var(--indigo); }
.esc-scene .conn { flex: 1; position: relative; height: 60px; margin: 0 8px; }
.esc-scene .conn svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.esc-scene .conn path {
  stroke: var(--indigo); stroke-width: 1.5; fill: none;
  stroke-dasharray: 4 4; stroke-dashoffset: 100; opacity: 0;
}
.fc-card.is-live .esc-scene .conn path { animation: fc-escDash 1s forwards; }
@keyframes fc-escDash {
  0%   { opacity: 0; stroke-dashoffset: 100; }
  30%  { opacity: 1; }
  100% { opacity: 1; stroke-dashoffset: 0; }
}

/* ───────────────────────────────── */
/* SCENE 12 : Hospital integration    */
/* ───────────────────────────────── */
.hosp-scene { position: relative; height: 100%; }
.hosp-scene .center {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 56px; height: 56px; border-radius: 14px;
  background: linear-gradient(180deg, #fff, #f4f5ff);
  border: 1px solid #d9daf2; display: grid; place-items: center; color: var(--indigo);
  box-shadow: 0 8px 20px -10px rgba(40,50,180,.25);
}
.hosp-scene .node {
  position: absolute; padding: 4px 8px; border-radius: 999px;
  background: #fff; border: 1px solid var(--line); font-size: 10px; color: var(--ink-2); opacity: 0;
}
.hosp-scene .node.n1 { left: 4%;  top: 10%; }
.hosp-scene .node.n2 { right: 4%; top: 14%; }
.hosp-scene .node.n3 { left: 8%;  bottom: 8%; }
.hosp-scene .node.n4 { right: 8%; bottom: 12%; }
.fc-card.is-live .hosp-scene .node { animation: fc-nodeIn .5s forwards; }
.fc-card.is-live .hosp-scene .node.n1 { animation-delay: .35s; }
.fc-card.is-live .hosp-scene .node.n2 { animation-delay: .55s; }
.fc-card.is-live .hosp-scene .node.n3 { animation-delay: .75s; }
.fc-card.is-live .hosp-scene .node.n4 { animation-delay: .95s; }
@keyframes fc-nodeIn { to { opacity: 1; } }
.hosp-scene .links { position: absolute; inset: 0; }
.hosp-scene .links svg { width: 100%; height: 100%; overflow: visible; }
.hosp-scene .links line {
  stroke: var(--indigo); stroke-width: 1.5; stroke-dasharray: 60; stroke-dashoffset: 60; opacity: .8;
}
.fc-card.is-live .hosp-scene .links line { animation: fc-linkDraw .7s forwards; }
.fc-card.is-live .hosp-scene .links line:nth-child(1) { animation-delay: .2s; }
.fc-card.is-live .hosp-scene .links line:nth-child(2) { animation-delay: .4s; }
.fc-card.is-live .hosp-scene .links line:nth-child(3) { animation-delay: .6s; }
.fc-card.is-live .hosp-scene .links line:nth-child(4) { animation-delay: .8s; }
@keyframes fc-linkDraw { to { stroke-dashoffset: 0; } }
`;

/* ------------------------------------------------------------------ */
/*  Feature data                                                       */
/* ------------------------------------------------------------------ */

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: JSX.Element;
  stageTitle: string;
  stageCaption?: string;
  scene: JSX.Element;
}

/* SVG helpers – stroke icons matching the HTML source */
const icon = (d: JSX.Element) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const FEATURES: Feature[] = [
  /* 1 */ {
    id: 'docs',
    title: 'Process documents',
    desc: 'PDFs, images and scans from any country',
    icon: icon(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></>),
    stageTitle: 'Ingesting',
    stageCaption: 'Any format, any source — pulled into one pipeline.',
    scene: (
      <div className="fc-scene">
        <div className="docs-scene" style={{ position: 'absolute', inset: 0 }}>
          <div className="paper p1" style={{ '--fx': '-90px', '--fy': '-40px', '--fr': '-14deg' } as React.CSSProperties} />
          <div className="paper p2" style={{ '--fx': '80px', '--fy': '-50px', '--fr': '18deg' } as React.CSSProperties} />
          <div className="paper p3" style={{ '--fx': '-70px', '--fy': '30px', '--fr': '-8deg' } as React.CSSProperties} />
          <div className="paper p4" style={{ '--fx': '90px', '--fy': '20px', '--fr': '12deg' } as React.CSSProperties} />
          <div className="target">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/>
            </svg>
          </div>
        </div>
      </div>
    ),
  },
  /* 2 */ {
    id: 'scan',
    title: 'Detect type & origin',
    desc: 'Language, category and institution',
    icon: icon(<><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></>),
    stageTitle: 'Scanning',
    stageCaption: 'Auto-detect language, document class and source.',
    scene: (
      <div className="fc-scene">
        <div className="scan-scene" style={{ position: 'absolute', inset: 0 }}>
          <div className="doc">
            <div className="ln" /><div className="ln short" /><div className="ln" /><div className="ln short" /><div className="ln" />
          </div>
          <div className="laser" />
          <div className="tags">
            <span className="fc-pill"><span className="fc-sw" />German</span>
            <span className="fc-pill"><span className="fc-sw" />Discharge</span>
            <span className="fc-pill"><span className="fc-sw" />Charit&eacute;</span>
          </div>
        </div>
      </div>
    ),
  },
  /* 3 */ {
    id: 'extract',
    title: 'Extract clinical data',
    desc: 'Diagnoses, meds, labs and allergies',
    icon: icon(<><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></>),
    stageTitle: 'Extracting',
    scene: (
      <div className="fc-scene">
        <div className="extract-scene" style={{ position: 'absolute', inset: 0 }}>
          <div className="doc">
            <div className="ln" /><div className="ln short" /><div className="ln" /><div className="ln short" /><div className="ln" />
            <div className="hl h1" /><div className="hl h2" /><div className="hl h3" />
          </div>
          <div className="out">
            <div className="row"><b>Dx</b>&nbsp;· I10 hypertension</div>
            <div className="row"><b>Rx</b>&nbsp;· Ramipril 5 mg</div>
            <div className="row"><b>Lab</b>&nbsp;· HbA1c 7.2 %</div>
          </div>
        </div>
      </div>
    ),
  },
  /* 4 */ {
    id: 'std',
    title: 'Standardise data',
    desc: 'Coding, units and terminology',
    icon: icon(<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>),
    stageTitle: 'Normalising',
    stageCaption: 'Mapped to ICD-10 · SNOMED · SI units.',
    scene: (
      <div className="fc-scene">
        <div className="std-scene" style={{ position: 'absolute', inset: 0 }}>
          <div className="col before">
            <div className="row">HTN</div>
            <div className="row">130/85</div>
            <div className="row">7.2 %</div>
          </div>
          <div className="arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </div>
          <div className="col after">
            <div className="row">I10</div>
            <div className="row">mmHg</div>
            <div className="row">53 mmol/mol</div>
          </div>
        </div>
      </div>
    ),
  },
  /* 5 */ {
    id: 'conv',
    title: 'Convert formats',
    desc: 'Foreign formats to local standards',
    icon: icon(<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/><path d="m13 2 3 4-3 0"/></>),
    stageTitle: 'Transforming',
    stageCaption: 'PDF, HL7v2 or CSV — out as Swiss-compliant FHIR.',
    scene: (
      <div className="fc-scene conv-scene">
        <div className="blob a"><span className="tag">PDF</span>DE</div>
        <div className="arrow" />
        <div className="blob b"><span className="tag">FHIR</span>CH</div>
      </div>
    ),
  },
  /* 6 */ {
    id: 'form',
    title: 'Pre-fill records',
    desc: 'Structured records for the hospital',
    icon: icon(<><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h4"/></>),
    stageTitle: 'Auto-filling',
    scene: (
      <div className="fc-scene form-scene">
        <div className="field"><span className="lbl">name</span><span className="val"><span className="typed">Maria · Schneider</span></span></div>
        <div className="field"><span className="lbl">DOB</span><span className="val"><span className="typed">1962-04-11</span></span></div>
        <div className="field"><span className="lbl">allergy</span><span className="val"><span className="typed">Penicillin</span></span></div>
      </div>
    ),
  },
  /* 7 */ {
    id: 'map',
    title: 'Map medications',
    desc: 'Foreign drugs to Swiss equivalents',
    icon: icon(<><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></>),
    stageTitle: 'Matching',
    scene: (
      <div className="fc-scene map-scene">
        <div className="stack">
          <div className="chip">Aspirin EC</div>
          <div className="chip">Norvasc 5</div>
          <div className="chip">Plavix 75</div>
        </div>
        <div className="lines">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <path d="M0 10 Q 50 10, 100 10"/>
            <path d="M0 30 Q 50 30, 100 30"/>
            <path d="M0 50 Q 50 50, 100 50"/>
          </svg>
        </div>
        <div className="stack">
          <div className="chip match">Aspegic 100</div>
          <div className="chip match">Amlodipin Mepha</div>
          <div className="chip match">Clopidogrel CH</div>
        </div>
      </div>
    ),
  },
  /* 8 */ {
    id: 'alt',
    title: 'Suggest alternatives',
    desc: 'When exact matches are unavailable',
    icon: icon(<><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.9.7 1.5 1.7 1.5 2.8V18h5v-.5c0-1.1.6-2.1 1.5-2.8A7 7 0 0 0 12 2z"/></>),
    stageTitle: 'Suggesting',
    scene: (
      <div className="fc-scene alt-scene">
        <div className="center">Adalat 30</div>
        <div className="alt a1">Amlodipin</div>
        <div className="alt a2">Felodipin</div>
        <div className="alt a3">Nifedipin ER</div>
        <div className="alt a4">Lercanidipin</div>
      </div>
    ),
  },
  /* 9 */ {
    id: 'flag',
    title: 'Flag missing data',
    desc: 'Gaps and inconsistencies highlighted',
    icon: icon(<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>),
    stageTitle: 'Auditing',
    scene: (
      <div className="fc-scene flag-scene">
        <div className="row">
          Diagnosis · I10
          <span className="flag-ic">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2v20h2v-8c2-1 5 1 8 0V4c-3 1-6-1-8 0V2H3z"/></svg>
          </span>
        </div>
        <div className="row miss">
          Weight · —
          <span className="flag-ic">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2v20h2v-8c2-1 5 1 8 0V4c-3 1-6-1-8 0V2H3z"/></svg>
          </span>
        </div>
        <div className="row miss">
          Allergy · —
          <span className="flag-ic">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2v20h2v-8c2-1 5 1 8 0V4c-3 1-6-1-8 0V2H3z"/></svg>
          </span>
        </div>
      </div>
    ),
  },
  /* 10 */ {
    id: 'ask',
    title: 'Request input',
    desc: 'Ask doctors to clarify ambiguities',
    icon: icon(<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
    stageTitle: 'Clarifying',
    scene: (
      <div className="fc-scene ask-scene">
        <div className="bubble ai">Is &ldquo;Adalat&rdquo; 20 mg or 30 mg in this report?</div>
        <div className="bubble dr">30 mg — confirmed.</div>
      </div>
    ),
  },
  /* 11 */ {
    id: 'esc',
    title: 'Escalate cases',
    desc: 'Route complex cases to specialists',
    icon: icon(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
    stageTitle: 'Routing',
    scene: (
      <div className="fc-scene esc-scene">
        <div className="case">Case&nbsp;#4821<br/>Oncology · complex</div>
        <div className="conn">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <path d="M0 30 C 30 30, 50 8, 100 8"/>
            <path d="M0 30 C 30 30, 50 30, 100 30"/>
            <path d="M0 30 C 30 30, 50 52, 100 52"/>
          </svg>
        </div>
        <div className="specialists">
          <div className="spec"><span className="av" />Dr. Keller</div>
          <div className="spec active"><span className="av" />Dr. Roth · ONC</div>
          <div className="spec"><span className="av" />Dr. Meier</div>
        </div>
      </div>
    ),
  },
  /* 12 */ {
    id: 'hosp',
    title: 'Hospital integration',
    desc: 'Compatible with HIS and EHR systems',
    icon: icon(<><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 8v6"/><path d="M9 11h6"/><path d="M8 21v-4h8v4"/></>),
    stageTitle: 'Connecting',
    scene: (
      <div className="fc-scene hosp-scene">
        <div className="links">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="14" y1="18" x2="50" y2="50"/>
            <line x1="86" y1="22" x2="50" y2="50"/>
            <line x1="18" y1="86" x2="50" y2="50"/>
            <line x1="82" y1="84" x2="50" y2="50"/>
          </svg>
        </div>
        <div className="center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 8v6"/><path d="M9 11h6"/>
          </svg>
        </div>
        <div className="node n1">Epic</div>
        <div className="node n2">SAP IS-H</div>
        <div className="node n3">KISIM</div>
        <div className="node n4">Phoenix</div>
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const FeatureCards: FC = () => {
  const [liveId, setLiveId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleEnter = useCallback((id: string) => {
    // Force reflow to restart CSS animations
    const el = cardRefs.current.get(id);
    if (el) {
      el.classList.remove('is-live');
      void el.offsetWidth; // reflow
    }
    setLiveId(id);
  }, []);

  const handleLeave = useCallback(() => {
    setLiveId(null);
  }, []);

  return (
    <div
      className="fc-root"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: `
          radial-gradient(900px 600px at 8% 90%, #d8e8ff 0%, transparent 60%),
          radial-gradient(800px 600px at 95% 10%, #e9defc 0%, transparent 60%),
          #f3f3fb
        `,
      }}
    >
      {/* Inject scoped styles */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="fc-wrap">
        {/* Header */}
        <div className="fc-head">
          <span className="fc-eyebrow">
            <span className="fc-dot" />
            Key features of AI agent
          </span>
          <h1 className="fc-h1">
            Hover any card to see{' '}
            <span className="fc-grad">how the agent works</span>
          </h1>
          <p className="fc-sub">
            Twelve capabilities that turn unstructured medical documents into clean, hospital-ready records.
          </p>
        </div>

        {/* Grid */}
        <div className="fc-grid">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              ref={(el) => {
                if (el) cardRefs.current.set(f.id, el);
              }}
              className={`fc-card${liveId === f.id ? ' is-live' : ''}`}
              onMouseEnter={() => handleEnter(f.id)}
              onMouseLeave={handleLeave}
            >
              {/* Face (default) */}
              <div className="fc-face">
                <div className="fc-icon-wrap">{f.icon}</div>
                <div className="fc-title">{f.title}</div>
                <p className="fc-desc">{f.desc}</p>
              </div>

              {/* Stage (hover animation) */}
              <div className="fc-stage">
                <div className="fc-stage-title">
                  <span className="fc-pulse" />
                  {f.stageTitle}
                </div>
                {f.scene}
                {f.stageCaption && (
                  <div className="fc-stage-caption">{f.stageCaption}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;
