import { useState, useEffect, useRef, useMemo } from "react";

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CARBONSCOPE — Design System Showcase                               ║
 * ║  Dark Engineering Base + Emerald Green Accent                       ║
 * ║  EN 15978 Lifecycle-Aligned · Production-Ready                      ║
 * ║                                                                      ║
 * ║  ⚡ SINGLE SOURCE OF TRUTH:                                          ║
 * ║     suna-init/packages/shared/design-system/                         ║
 * ║     • tokens.ts          → canonical design tokens (T alias below)   ║
 * ║     • global.css         → keyframe animations & utility classes     ║
 * ║     • components/atoms/  → Badge, Button, Divider, Input,            ║
 * ║                            LifecycleStageTag, Skeleton, SectionTitle ║
 * ║     • components/molecules/ → KPICard, LifecycleBarChart, EPDCard,   ║
 * ║                            BenchmarkGauge, MaterialComparisonRow,    ║
 * ║                            ComplianceCard, Tabs, AccordionItem,      ║
 * ║                            Toast, StackedBarComparison,              ║
 * ║                            ProjectSidebar                            ║
 * ║     • components/hooks/  → useInView, useCountUp                     ║
 * ║                                                                      ║
 * ║  This file is the visual reference / playground. In production,      ║
 * ║  import from @suna/design-system instead.                            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS — mirrors suna-init/packages/shared/design-system/tokens.ts
// Production code: import { tokens } from '@suna/design-system/tokens'
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const T = {
  bg: { 
    base: "#0B1120", surface: "#111827", elevated: "#1A2332", 
    card: "#162032", hover: "#1E293B", overlay: "rgba(0,0,0,0.6)",
    subtle: "#0F172A", input: "#0D1526"
  },
  border: { 
    default: "#1E293B", muted: "#1a2236", active: "#059669", 
    hover: "#334155", focus: "rgba(5,150,105,0.5)" 
  },
  text: { 
    primary: "#E2E8F0", secondary: "#94A3B8", muted: "#64748B", 
    inverse: "#0B1120", accent: "#34D399", warning: "#FBBF24",
    danger: "#F87171", link: "#38BDF8"
  },
  green: { 
    50: "#ECFDF5", 100: "#D1FAE5", 200: "#A7F3D0", 300: "#6EE7B7",
    400: "#34D399", 500: "#10B981", 600: "#059669", 700: "#047857",
    800: "#065F46", 900: "#064E3B", glow: "rgba(52,211,153,0.15)",
    glowStrong: "rgba(52,211,153,0.25)"
  },
  // EN 15978 Lifecycle Stage Colors
  lifecycle: {
    A1A3: "#3B82F6", A4A5: "#60A5FA", B1B5: "#F59E0B",
    B6B7: "#EA580C", C1C4: "#6B7280", D: "#10B981",
    A1A3_bg: "rgba(59,130,246,0.12)", A4A5_bg: "rgba(96,165,250,0.12)",
    B1B5_bg: "rgba(245,158,11,0.12)", B6B7_bg: "rgba(234,88,12,0.12)",
    C1C4_bg: "rgba(107,114,128,0.12)", D_bg: "rgba(16,185,129,0.12)"
  },
  status: {
    good: "#10B981", warning: "#F59E0B", danger: "#EF4444", info: "#3B82F6",
    good_bg: "rgba(16,185,129,0.1)", warning_bg: "rgba(245,158,11,0.1)",
    danger_bg: "rgba(239,68,68,0.1)", info_bg: "rgba(59,130,246,0.1)"
  },
  font: {
    display: "'Instrument Serif', Georgia, serif",
    heading: "'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', 'Consolas', monospace",
    data: "'Tabular Nums', 'Plus Jakarta Sans', system-ui, sans-serif"
  },
  radius: { sm: "6px", md: "10px", lg: "14px", xl: "20px", full: "9999px" },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.3)",
    md: "0 4px 12px rgba(0,0,0,0.4)",
    lg: "0 8px 32px rgba(0,0,0,0.5)",
    glow: "0 0 20px rgba(52,211,153,0.08)",
    inner: "inset 0 1px 2px rgba(0,0,0,0.3)"
  },
  ease: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    smooth: "cubic-bezier(0.45, 0, 0.15, 1)"
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128]
};

const LIFECYCLE_STAGES = [
  { key: "A1A3", label: "A1–A3", name: "Product", color: T.lifecycle.A1A3, bg: T.lifecycle.A1A3_bg },
  { key: "A4A5", label: "A4–A5", name: "Construction", color: T.lifecycle.A4A5, bg: T.lifecycle.A4A5_bg },
  { key: "B1B5", label: "B1–B5", name: "Maintenance", color: T.lifecycle.B1B5, bg: T.lifecycle.B1B5_bg },
  { key: "B6B7", label: "B6–B7", name: "Operational", color: T.lifecycle.B6B7, bg: T.lifecycle.B6B7_bg },
  { key: "C1C4", label: "C1–C4", name: "End of Life", color: T.lifecycle.C1C4, bg: T.lifecycle.C1C4_bg },
  { key: "D",    label: "D",     name: "Beyond Lifecycle", color: T.lifecycle.D, bg: T.lifecycle.D_bg },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL CSS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:${T.bg.base}}
::-webkit-scrollbar-thumb{background:${T.border.default};border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:${T.border.hover}}
@keyframes cs-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes cs-scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
@keyframes cs-slideRight{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes cs-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes cs-glow{0%,100%{box-shadow:0 0 8px rgba(52,211,153,0.1)}50%{box-shadow:0 0 20px rgba(52,211,153,0.2)}}
@keyframes cs-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes cs-countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes cs-fillUp{from{height:0%}to{height:var(--target-h)}}
@keyframes cs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes cs-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.cs-stagger>*{animation:cs-fadeUp 0.5s ${T.ease.smooth} both}
.cs-stagger>*:nth-child(1){animation-delay:0ms}
.cs-stagger>*:nth-child(2){animation-delay:60ms}
.cs-stagger>*:nth-child(3){animation-delay:120ms}
.cs-stagger>*:nth-child(4){animation-delay:180ms}
.cs-stagger>*:nth-child(5){animation-delay:240ms}
.cs-stagger>*:nth-child(6){animation-delay:300ms}
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); }}, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
}

function useCountUp(end, duration = 1200, trigger = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, trigger]);
  return val;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ATOMS (Base Components)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Badge({ children, variant = "default", dot }) {
  const m = {
    default: { bg: T.bg.hover, color: T.text.secondary, border: T.border.default },
    success: { bg: T.status.good_bg, color: T.status.good, border: "rgba(16,185,129,0.2)" },
    warning: { bg: T.status.warning_bg, color: T.status.warning, border: "rgba(245,158,11,0.2)" },
    danger:  { bg: T.status.danger_bg, color: T.status.danger, border: "rgba(239,68,68,0.2)" },
    info:    { bg: T.status.info_bg, color: T.status.info, border: "rgba(59,130,246,0.2)" },
    accent:  { bg: T.green.glow, color: T.green[400], border: "rgba(52,211,153,0.2)" },
  }[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: T.radius.full,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      fontFamily: T.font.body, fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: "18px",
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color }} />}
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", icon, onClick, disabled }) {
  const [h, setH] = useState(false);
  const sz = { sm: { p: "6px 14px", f: 12 }, md: { p: "9px 20px", f: 13 }, lg: { p: "12px 28px", f: 14 } }[size];
  const v = {
    primary:   { bg: h ? T.green[700] : T.green[600], color: "#fff", border: "none", shadow: `0 0 16px ${T.green.glow}` },
    secondary: { bg: h ? T.bg.hover : "transparent", color: T.text.primary, border: `1px solid ${h ? T.border.hover : T.border.default}`, shadow: "none" },
    ghost:     { bg: h ? T.green.glow : "transparent", color: T.green[400], border: "none", shadow: "none" },
    danger:    { bg: h ? "#991B1B" : T.status.danger, color: "#fff", border: "none", shadow: "none" },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        ...sz, padding: sz.p, fontSize: sz.f,
        background: v.bg, color: v.color, border: v.border || "none",
        borderRadius: T.radius.md, fontFamily: T.font.body, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: `all 0.2s ${T.ease.default}`, letterSpacing: "0.01em",
        boxShadow: variant === "primary" && h ? v.shadow : "none",
      }}
    >{icon}{children}</button>
  );
}

function Input({ label, placeholder, suffix, type = "text", mono }) {
  const [f, setF] = useState(false);
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontFamily: T.font.body, fontSize: 11, fontWeight: 600, color: T.text.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center",
        background: T.bg.input, borderRadius: T.radius.md,
        border: `1.5px solid ${f ? T.border.active : T.border.default}`,
        boxShadow: f ? `0 0 0 3px ${T.border.focus}` : "none",
        transition: `all 0.2s ${T.ease.default}`,
      }}>
        <input type={type} placeholder={placeholder} value={v}
          onChange={e => setV(e.target.value)}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            padding: "10px 14px", color: T.text.primary,
            fontFamily: mono ? T.font.mono : T.font.body, fontSize: 13,
          }}
        />
        {suffix && <span style={{ padding: "0 12px 0 0", fontFamily: T.font.mono, fontSize: 11, color: T.text.muted }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
      <div style={{ flex: 1, height: 1, background: T.border.default }} />
      {label && <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: T.border.default }} />
    </div>
  );
}

function Skeleton({ w = "100%", h = "20px", r = T.radius.md }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(90deg, ${T.bg.hover} 25%, ${T.bg.elevated} 50%, ${T.bg.hover} 75%)`, backgroundSize: "200% 100%", animation: "cs-shimmer 1.5s ease-in-out infinite" }} />;
}

function LifecycleStageTag({ stageKey }) {
  const s = LIFECYCLE_STAGES.find(x => x.key === stageKey) || LIFECYCLE_STAGES[0];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: T.radius.sm, background: s.bg, border: `1px solid ${s.color}22`, fontFamily: T.font.mono, fontSize: 11, fontWeight: 600, color: s.color }}><span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />{s.label}</span>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOLECULES (Composite Components)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function KPICard({ label, value, unit, trend, trendLabel, target, targetLabel, sparkData, icon, status = "good" }) {
  const [ref, inView] = useInView();
  const num = useCountUp(typeof value === "number" ? value : 0, 1000, inView);
  const trendColor = trend > 0 ? T.status.danger : T.status.good;
  const trendIcon = trend > 0 ? "↑" : "↓";
  return (
    <div ref={ref} style={{
      background: T.bg.card, borderRadius: T.radius.lg, padding: "20px 22px",
      border: `1px solid ${T.border.default}`,
      animation: inView ? "cs-fadeUp 0.5s ease both" : "none",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: status === "good" ? T.status.good : status === "warning" ? T.status.warning : T.status.danger, opacity: 0.6 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: T.font.body, fontSize: 11, fontWeight: 600, color: T.text.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
        {icon && <span style={{ fontSize: 16, opacity: 0.5 }}>{icon}</span>}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: T.font.heading, fontSize: 32, fontWeight: 800, color: T.text.primary, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
          {typeof value === "number" ? num.toLocaleString() : value}
        </span>
        {unit && <span style={{ fontFamily: T.font.mono, fontSize: 12, color: T.text.muted }}>{unit}</span>}
      </div>
      {(trend !== undefined || target) && (
        <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {trend !== undefined && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: T.font.mono, fontSize: 11, fontWeight: 600, color: trendColor }}>
              {trendIcon} {Math.abs(trend)}%
              {trendLabel && <span style={{ color: T.text.muted, fontWeight: 400 }}>{trendLabel}</span>}
            </span>
          )}
          {target && (
            <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.muted }}>
              Target: {targetLabel || target}
            </span>
          )}
        </div>
      )}
      {sparkData && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
          {sparkData.map((v, i) => (
            <div key={i} style={{
              flex: 1, background: `${T.green[500]}${i === sparkData.length - 1 ? "" : "44"}`,
              borderRadius: 2, height: `${(v / Math.max(...sparkData)) * 100}%`,
              transition: "height 0.4s ease",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function LifecycleBarChart({ data, height = 260 }) {
  const [ref, inView] = useInView();
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div ref={ref} style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 24, border: `1px solid ${T.border.default}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: T.font.heading, fontSize: 15, fontWeight: 700, color: T.text.primary }}>Lifecycle Stage Breakdown</div>
          <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.muted, marginTop: 2 }}>kgCO₂e by EN 15978 module</div>
        </div>
        <Badge variant="accent">EN 15978</Badge>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, paddingBottom: 28, position: "relative" }}>
        {/* Y-axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <div key={pct} style={{ position: "absolute", left: 0, right: 0, bottom: 28 + (height - 28) * pct, borderBottom: `1px ${pct === 0 ? "solid" : "dashed"} ${T.border.muted}`, display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: -4, transform: "translateX(-100%)", fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, paddingRight: 4 }}>{Math.round(maxVal * pct / 1000)}k</span>
          </div>
        ))}
        {data.map((d, i) => {
          const stage = LIFECYCLE_STAGES.find(s => s.key === d.key) || LIFECYCLE_STAGES[0];
          const barH = (d.value / maxVal) * (height - 28);
          const isNeg = d.key === "D";
          return (
            <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", zIndex: 1 }}>
              <span style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: stage.color, opacity: inView ? 1 : 0, transition: "opacity 0.4s ease", transitionDelay: `${i * 80}ms` }}>
                {(d.value / 1000).toFixed(0)}k
              </span>
              <div style={{
                width: "100%", maxWidth: 52, height: barH, borderRadius: "6px 6px 2px 2px",
                background: `linear-gradient(180deg, ${stage.color}, ${stage.color}88)`,
                transformOrigin: "bottom", transform: inView ? "scaleY(1)" : "scaleY(0)",
                transition: `transform 0.6s ${T.ease.spring}`, transitionDelay: `${i * 80}ms`,
                boxShadow: `0 0 12px ${stage.color}22`,
                opacity: isNeg ? 0.6 : 1,
              }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 700, color: stage.color }}>{stage.label}</div>
                <div style={{ fontFamily: T.font.body, fontSize: 9, color: T.text.muted }}>{stage.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EPDCard({ product, manufacturer, gwp, unit, category, percentile, verified, stage = "A1A3" }) {
  const [h, setH] = useState(false);
  const pctColor = percentile <= 30 ? T.status.good : percentile <= 60 ? T.status.warning : T.status.danger;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: T.bg.card, borderRadius: T.radius.lg, padding: 20,
      border: `1px solid ${h ? T.green[800] : T.border.default}`,
      transition: `all 0.25s ${T.ease.default}`,
      transform: h ? "translateY(-2px)" : "none",
      boxShadow: h ? T.shadow.glow : "none", cursor: "pointer",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font.heading, fontSize: 14, fontWeight: 700, color: T.text.primary }}>{product}</div>
          <div style={{ fontFamily: T.font.body, fontSize: 11, color: T.text.muted, marginTop: 2 }}>{manufacturer}</div>
        </div>
        <LifecycleStageTag stageKey={stage} />
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: T.font.heading, fontSize: 26, fontWeight: 800, color: T.green[400], fontVariantNumeric: "tabular-nums" }}>{gwp}</span>
        <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.muted }}>{unit}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: T.font.body, fontSize: 10, color: T.text.muted }}>Category Percentile</span>
          <span style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: pctColor }}>{percentile}th</span>
        </div>
        <div style={{ height: 4, background: T.bg.hover, borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${percentile}%`, background: pctColor, borderRadius: 2, transition: "width 0.6s ease" }} />
          <div style={{ position: "absolute", left: "20%", top: -2, bottom: -2, width: 1, background: T.text.muted, opacity: 0.3 }} />
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Badge variant="default">{category}</Badge>
        {verified && <Badge variant="success" dot>Verified EPD</Badge>}
      </div>
    </div>
  );
}

function BenchmarkGauge({ value, bands, label, unit = "kgCO₂e/m²" }) {
  const [ref, inView] = useInView();
  const total = bands[bands.length - 1].max;
  const pct = Math.min((value / total) * 100, 100);
  const currentBand = bands.find(b => value >= b.min && value < b.max) || bands[bands.length - 1];
  return (
    <div ref={ref} style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 20, border: `1px solid ${T.border.default}` }}>
      <div style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 14 }}>
        <span style={{ fontFamily: T.font.heading, fontSize: 24, fontWeight: 800, color: currentBand.color }}>{value}</span>
        <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.muted }}>{unit}</span>
        <Badge variant={currentBand.variant || "default"}>{currentBand.label}</Badge>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 5, overflow: "hidden", display: "flex" }}>
        {bands.map((b, i) => (
          <div key={i} style={{ flex: b.max - b.min, height: "100%", background: `${b.color}44` }} />
        ))}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: inView ? `${pct}%` : "0%", transition: "width 1s cubic-bezier(0.45,0,0.15,1)",
          background: currentBand.color, borderRadius: 5,
          boxShadow: `0 0 8px ${currentBand.color}44`,
        }} />
      </div>
      <div style={{ display: "flex", marginTop: 6 }}>
        {bands.map((b, i) => (
          <div key={i} style={{ flex: b.max - b.min, fontFamily: T.font.mono, fontSize: 8, color: T.text.muted, textAlign: "center" }}>{b.label}</div>
        ))}
      </div>
    </div>
  );
}

function MaterialComparisonRow({ name, options }) {
  const best = Math.min(...options.map(o => o.gwp));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border.muted}` }}>
      <span style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 600, color: T.text.primary }}>{name}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map((o, i) => (
          <div key={i} style={{
            flex: 1, padding: "10px 12px", borderRadius: T.radius.md,
            background: o.gwp === best ? T.green.glow : T.bg.hover,
            border: `1px solid ${o.gwp === best ? T.green[800] : T.border.muted}`,
            position: "relative",
          }}>
            {o.gwp === best && <span style={{ position: "absolute", top: -6, right: 8, background: T.green[600], color: "#fff", padding: "1px 6px", borderRadius: T.radius.full, fontFamily: T.font.mono, fontSize: 8, fontWeight: 700 }}>BEST</span>}
            <div style={{ fontFamily: T.font.heading, fontSize: 16, fontWeight: 700, color: o.gwp === best ? T.green[400] : T.text.primary }}>{o.gwp}<span style={{ fontSize: 10, color: T.text.muted, marginLeft: 3 }}>kgCO₂e</span></div>
            <div style={{ fontFamily: T.font.body, fontSize: 11, color: T.text.secondary, marginTop: 2 }}>{o.name}</div>
            {o.source && <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, marginTop: 4 }}>{o.source}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceCard({ framework, status, score, maxScore, details }) {
  const pct = (score / maxScore) * 100;
  const statusMap = {
    pass: { color: T.status.good, icon: "✓", bg: T.status.good_bg },
    warning: { color: T.status.warning, icon: "⚠", bg: T.status.warning_bg },
    fail: { color: T.status.danger, icon: "✕", bg: T.status.danger_bg },
  };
  const s = statusMap[status] || statusMap.pass;
  return (
    <div style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border.default}`, borderLeft: `3px solid ${s.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.font.heading, fontSize: 14, fontWeight: 700, color: T.text.primary }}>{framework}</div>
        <span style={{
          width: 24, height: 24, borderRadius: T.radius.full,
          background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
        }}>{s.icon}</span>
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: T.font.heading, fontSize: 22, fontWeight: 800, color: s.color }}>{score}</span>
        <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.muted }}>/ {maxScore}</span>
      </div>
      <div style={{ marginTop: 8, height: 4, background: T.bg.hover, borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      {details && <div style={{ fontFamily: T.font.body, fontSize: 11, color: T.text.muted, marginTop: 8, lineHeight: 1.5 }}>{details}</div>}
    </div>
  );
}

function Tabs({ items, defaultActive = 0 }) {
  const [a, setA] = useState(defaultActive);
  return (
    <div>
      <div style={{ display: "flex", gap: 2, background: T.bg.base, borderRadius: T.radius.md, padding: 3, border: `1px solid ${T.border.default}` }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => setA(i)} style={{
            flex: 1, padding: "8px 16px", borderRadius: T.radius.sm,
            background: a === i ? T.bg.elevated : "transparent", border: "none", cursor: "pointer",
            fontFamily: T.font.body, fontSize: 12, fontWeight: a === i ? 700 : 500,
            color: a === i ? T.green[400] : T.text.muted,
            transition: `all 0.2s ${T.ease.default}`,
            boxShadow: a === i ? T.shadow.sm : "none",
          }}>{item.label}</button>
        ))}
      </div>
      <div style={{ marginTop: 16, animation: "cs-fadeIn 0.3s ease" }}>{items[a]?.content}</div>
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen = false, badge }) {
  const [o, setO] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.border.muted}` }}>
      <button onClick={() => setO(!o)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "none", border: "none", cursor: "pointer", padding: "14px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 600, color: T.text.primary }}>{title}</span>
          {badge}
        </div>
        <span style={{ color: T.green[400], fontSize: 14, transform: o ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s ease" }}>+</span>
      </button>
      <div style={{ maxHeight: o ? 400 : 0, overflow: "hidden", transition: "all 0.3s ease", opacity: o ? 1 : 0 }}>
        <div style={{ padding: "0 0 14px", fontFamily: T.font.body, fontSize: 13, lineHeight: 1.6, color: T.text.secondary }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ message, type = "success", visible }) {
  const map = {
    success: { icon: "✓", color: T.status.good, bg: T.status.good_bg, border: "rgba(16,185,129,0.3)" },
    warning: { icon: "⚠", color: T.status.warning, bg: T.status.warning_bg, border: "rgba(245,158,11,0.3)" },
    error:   { icon: "✕", color: T.status.danger, bg: T.status.danger_bg, border: "rgba(239,68,68,0.3)" },
    info:    { icon: "ℹ", color: T.status.info, bg: T.status.info_bg, border: "rgba(59,130,246,0.3)" },
  }[type];
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: T.bg.elevated, border: `1px solid ${map.border}`,
      borderRadius: T.radius.lg, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: T.shadow.lg, backdropFilter: "blur(8px)",
      transform: visible ? "translateY(0)" : "translateY(120%)",
      opacity: visible ? 1 : 0, transition: `all 0.4s ${T.ease.spring}`,
    }}>
      <span style={{ width: 22, height: 22, borderRadius: T.radius.full, background: map.bg, color: map.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, border: `1px solid ${map.border}` }}>{map.icon}</span>
      <span style={{ fontFamily: T.font.body, fontSize: 13, fontWeight: 500, color: T.text.primary }}>{message}</span>
    </div>
  );
}

function StackedBarComparison({ options }) {
  const [ref, inView] = useInView();
  const maxTotal = Math.max(...options.map(o => LIFECYCLE_STAGES.reduce((s, st) => s + (o.data[st.key] || 0), 0)));
  return (
    <div ref={ref} style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 24, border: `1px solid ${T.border.default}` }}>
      <div style={{ fontFamily: T.font.heading, fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 20 }}>Design Option Comparison</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {options.map((opt, oi) => {
          const total = LIFECYCLE_STAGES.reduce((s, st) => s + (opt.data[st.key] || 0), 0);
          return (
            <div key={oi}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 600, color: T.text.primary }}>{opt.label}</span>
                <span style={{ fontFamily: T.font.mono, fontSize: 12, fontWeight: 600, color: opt.best ? T.green[400] : T.text.secondary }}>
                  {(total / 1000).toFixed(0)}k kgCO₂e
                  {opt.best && <span style={{ marginLeft: 6, color: T.green[400] }}>✓ Best</span>}
                </span>
              </div>
              <div style={{ display: "flex", height: 28, borderRadius: T.radius.sm, overflow: "hidden", border: `1px solid ${opt.best ? T.green[800] : T.border.muted}` }}>
                {LIFECYCLE_STAGES.map(st => {
                  const val = opt.data[st.key] || 0;
                  const w = (val / maxTotal) * 100;
                  return (
                    <div key={st.key} title={`${st.label}: ${val.toLocaleString()} kgCO₂e`} style={{
                      width: inView ? `${w}%` : "0%", background: st.color, transition: `width 0.8s ${T.ease.smooth}`,
                      transitionDelay: `${oi * 100}ms`,
                    }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        {LIFECYCLE_STAGES.map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted }}>{s.label} {s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectSidebar() {
  const [scope, setScope] = useState("A-C");
  const [framework, setFramework] = useState("RICS");
  const scopes = ["A1-A3", "A1-A5", "A-C", "A-D"];
  const frameworks = ["RICS", "LETI", "BREEAM", "LEED", "DGNB", "RE2020"];
  return (
    <div style={{ width: 240, background: T.bg.surface, borderRight: `1px solid ${T.border.default}`, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20, fontSize: 12 }}>
      <div>
        <div style={{ fontFamily: T.font.heading, fontSize: 16, fontWeight: 800, color: T.green[400], display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: T.radius.md, background: T.green.glow, border: `1px solid ${T.green[800]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>◇</span>
          CarbonScope
        </div>
      </div>
      <Divider label="navigation" />
      {["Dashboard", "Materials", "BIM Import", "Reports", "Settings"].map((item, i) => (
        <button key={item} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: T.radius.md,
          background: i === 0 ? T.green.glow : "transparent", border: "none", cursor: "pointer",
          color: i === 0 ? T.green[400] : T.text.muted, fontFamily: T.font.body, fontSize: 13, fontWeight: i === 0 ? 600 : 400,
          transition: "all 0.15s ease", width: "100%", textAlign: "left",
          borderLeft: i === 0 ? `2px solid ${T.green[500]}` : "2px solid transparent",
        }}>
          {["📊", "🧱", "📐", "📄", "⚙"][i]} {item}
        </button>
      ))}
      <Divider label="scope" />
      <div>
        <div style={{ fontFamily: T.font.body, fontSize: 10, fontWeight: 600, color: T.text.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Lifecycle Scope</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {scopes.map(s => (
            <button key={s} onClick={() => setScope(s)} style={{
              padding: "4px 10px", borderRadius: T.radius.sm,
              background: scope === s ? T.green[600] : T.bg.hover, border: `1px solid ${scope === s ? T.green[500] : T.border.muted}`,
              color: scope === s ? "#fff" : T.text.muted, fontFamily: T.font.mono, fontSize: 10, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s ease",
            }}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: T.font.body, fontSize: 10, fontWeight: 600, color: T.text.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Framework</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {frameworks.map(f => (
            <button key={f} onClick={() => setFramework(f)} style={{
              padding: "5px 10px", borderRadius: T.radius.sm, textAlign: "left",
              background: framework === f ? T.green.glow : "transparent", border: "none",
              color: framework === f ? T.green[400] : T.text.muted, fontFamily: T.font.mono, fontSize: 11, fontWeight: framework === f ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s ease",
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "auto", padding: "12px", borderRadius: T.radius.md, background: T.bg.base, border: `1px solid ${T.border.muted}` }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Study Period</div>
        <div style={{ fontFamily: T.font.heading, fontSize: 18, fontWeight: 800, color: T.text.primary }}>60 <span style={{ fontSize: 11, color: T.text.muted, fontWeight: 400 }}>years</span></div>
        <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, marginTop: 4 }}>GIA: 12,450 m²</div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SectionTitle({ tag, title, desc }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: T.green[500], letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{tag}</div>
      <h2 style={{ fontFamily: T.font.display, fontSize: 32, fontWeight: 400, color: T.text.primary, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{title}</h2>
      {desc && <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, marginTop: 8, maxWidth: 600, lineHeight: 1.6 }}>{desc}</p>}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DESIGN SYSTEM APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SAMPLE_LIFECYCLE = [
  { key: "A1A3", value: 285000 }, { key: "A4A5", value: 42000 },
  { key: "B1B5", value: 95000 }, { key: "B6B7", value: 186000 },
  { key: "C1C4", value: 31000 }, { key: "D", value: -38000 },
];

const SAMPLE_COMPARISON = [
  { label: "Option A — RC Frame", data: { A1A3: 285000, A4A5: 42000, B1B5: 95000, B6B7: 186000, C1C4: 31000, D: 12000 } },
  { label: "Option B — Steel + CLT", best: true, data: { A1A3: 198000, A4A5: 35000, B1B5: 72000, B6B7: 186000, C1C4: 18000, D: 8000 } },
  { label: "Option C — Mass Timber", data: { A1A3: 165000, A4A5: 48000, B1B5: 110000, B6B7: 195000, C1C4: 22000, D: 5000 } },
];

const LETI_BANDS = [
  { min: 0, max: 150, label: "A+", color: T.status.good, variant: "success" },
  { min: 150, max: 300, label: "A", color: "#22C55E", variant: "success" },
  { min: 300, max: 500, label: "B", color: T.status.warning, variant: "warning" },
  { min: 500, max: 600, label: "C", color: "#F97316", variant: "warning" },
  { min: 600, max: 850, label: "D", color: T.status.danger, variant: "danger" },
  { min: 850, max: 1200, label: "E", color: "#991B1B", variant: "danger" },
];

export default function CarbonDesignSystem() {
  const [activeView, setActiveView] = useState("system");
  const [toast, setToast] = useState(false);

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 3000); };

  return (
    <div style={{ fontFamily: T.font.body, background: T.bg.base, color: T.text.primary, minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ━━ TOP NAV BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: `${T.bg.surface}ee`, backdropFilter: "blur(12px) saturate(150%)",
        borderBottom: `1px solid ${T.border.default}`,
        padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: T.radius.md, background: `linear-gradient(135deg, ${T.green[600]}, ${T.green[800]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>C</span>
          <span style={{ fontFamily: T.font.heading, fontSize: 15, fontWeight: 800, color: T.text.primary, letterSpacing: "-0.02em" }}>CarbonScope</span>
          <Badge variant="accent">Design System v1.0</Badge>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["system", "dashboard"].map(v => (
            <button key={v} onClick={() => setActiveView(v)} style={{
              padding: "6px 14px", borderRadius: T.radius.md,
              background: activeView === v ? T.green.glow : "transparent",
              border: `1px solid ${activeView === v ? T.green[800] : "transparent"}`,
              color: activeView === v ? T.green[400] : T.text.muted,
              fontFamily: T.font.body, fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s ease", textTransform: "capitalize",
            }}>{v === "system" ? "Design Tokens" : "Dashboard Preview"}</button>
          ))}
        </div>
      </div>

      {activeView === "dashboard" ? (
        /* ━━ DASHBOARD PREVIEW ━━━━━━━━━━━━━━━━━━━━ */
        <div style={{ display: "flex", minHeight: "calc(100vh - 52px)" }}>
          <ProjectSidebar />
          <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: T.font.heading, fontSize: 20, fontWeight: 800, color: T.text.primary }}>Riverside Tower — WLC Assessment</div>
                <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.muted, marginTop: 2 }}>Mixed-use residential · 12,450 m² GIA · 60-year study period</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" icon={<span>📤</span>}>Export</Button>
                <Button variant="primary" size="sm" icon={<span>📄</span>} onClick={showToast}>Generate Report</Button>
              </div>
            </div>

            {/* KPI Row */}
            <div className="cs-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
              <KPICard label="Total Embodied Carbon" value={847300} unit="kgCO₂e" trend={-12.3} trendLabel="vs baseline" icon="🏗" status="good" sparkData={[85,92,88,79,72,68,65]} />
              <KPICard label="Carbon Intensity" value={412} unit="kgCO₂e/m²" trend={-8.1} trendLabel="vs baseline" icon="📏" status="warning" />
              <KPICard label="LETI Rating" value="B" unit="" icon="🏅" status="warning" />
              <KPICard label="Operational Carbon" value={28.4} unit="kgCO₂e/m²/yr" trend={-15.7} trendLabel="vs typical" icon="⚡" status="good" />
              <KPICard label="Carbon Budget Used" value={72} unit="%" target="1,175,000" targetLabel="Budget: 1,175t" icon="🎯" status="good" />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <LifecycleBarChart data={SAMPLE_LIFECYCLE.map(d => ({ ...d, value: Math.abs(d.value) }))} />
              <StackedBarComparison options={SAMPLE_COMPARISON} />
            </div>

            {/* Benchmark + Compliance Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
              <BenchmarkGauge value={412} bands={LETI_BANDS} label="LETI Embodied Carbon Rating" unit="kgCO₂e/m² (A1-A5)" />
              <ComplianceCard framework="RICS WLC v2" status="pass" score={8} maxScore={10} details="All A-D modules reported. Operational energy from approved software. 60-yr study period compliant." />
              <ComplianceCard framework="BREEAM Mat 01" status="warning" score={6} maxScore={9} details="LCA at design stage complete. Missing Stage 4 technical design update for full credits." />
            </div>

            {/* EPD Cards */}
            <div style={{ fontFamily: T.font.heading, fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 14 }}>Material Library — Recent EPDs</div>
            <div className="cs-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <EPDCard product="CEM I 42.5N Concrete" manufacturer="CEMEX UK" gwp={234} unit="kgCO₂e/m³" category="Ready-mix" percentile={45} verified stage="A1A3" />
              <EPDCard product="Structural Steel S355" manufacturer="ArcelorMittal" gwp={1.95} unit="kgCO₂e/kg" category="Hot-rolled" percentile={32} verified stage="A1A3" />
              <EPDCard product="CLT Panel 120mm" manufacturer="Stora Enso" gwp={-48} unit="kgCO₂e/m²" category="Mass Timber" percentile={15} verified stage="A1A3" />
              <EPDCard product="Mineral Wool 100mm" manufacturer="Rockwool" gwp={4.2} unit="kgCO₂e/m²" category="Insulation" percentile={28} verified stage="A1A3" />
            </div>
          </div>
        </div>
      ) : (
        /* ━━ DESIGN SYSTEM TOKENS & COMPONENTS ━━━━ */
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px 96px" }}>

          {/* HERO */}
          <div style={{ marginBottom: 72, position: "relative" }}>
            <div style={{ position: "absolute", top: -80, right: -40, width: 300, height: 300, background: `radial-gradient(circle, ${T.green.glowStrong} 0%, transparent 70%)`, pointerEvents: "none" }} />
            <Badge variant="accent" dot>v1.0 — Production Ready</Badge>
            <h1 style={{ fontFamily: T.font.display, fontSize: 52, fontWeight: 400, color: T.text.primary, lineHeight: 1.1, marginTop: 16, letterSpacing: "-0.02em", position: "relative" }}>
              CarbonScope<br />
              <span style={{ color: T.green[400], fontStyle: "italic" }}>Design System</span>
            </h1>
            <p style={{ fontFamily: T.font.body, fontSize: 16, color: T.text.secondary, marginTop: 16, maxWidth: 560, lineHeight: 1.7 }}>
              A comprehensive component library for embodied & operational carbon assessment platforms. Built for sustainability consultants. EN 15978-aligned. Dark engineering aesthetic with emerald green accents.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <Button variant="primary" size="lg" onClick={() => setActiveView("dashboard")}>View Dashboard Preview →</Button>
              <Button variant="secondary" size="lg">Component Reference</Button>
            </div>
          </div>

          {/* ── COLOR TOKENS ── */}
          <SectionTitle tag="Design Tokens" title="Color System" desc="Dark engineering base with emerald green accent. EN 15978 lifecycle stage colors are standardized across all chart types." />
          
          <div style={{ display: "grid", gap: 24, marginBottom: 56 }}>
            {/* Green scale */}
            <div>
              <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 8 }}>Primary — Emerald Green</div>
              <div style={{ display: "flex", borderRadius: T.radius.lg, overflow: "hidden" }}>
                {Object.entries(T.green).filter(([k]) => !k.includes("glow") && !isNaN(k)).map(([k, v]) => (
                  <div key={k} style={{ flex: 1, height: 56, background: v, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "4px 6px", cursor: "pointer", transition: "flex 0.2s ease" }}
                    onMouseEnter={e => e.currentTarget.style.flex = "2"}
                    onMouseLeave={e => e.currentTarget.style.flex = "1"}
                  >
                    <span style={{ fontFamily: T.font.mono, fontSize: 8, color: parseInt(k) > 500 ? "#fff" : T.bg.base, opacity: 0.8 }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifecycle colors */}
            <div>
              <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 8 }}>EN 15978 Lifecycle Stages</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {LIFECYCLE_STAGES.map(s => (
                  <div key={s.key} style={{ padding: 14, borderRadius: T.radius.md, background: s.bg, border: `1px solid ${s.color}22`, textAlign: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: T.radius.sm, background: s.color, margin: "0 auto 8px" }} />
                    <div style={{ fontFamily: T.font.mono, fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</div>
                    <div style={{ fontFamily: T.font.body, fontSize: 10, color: T.text.muted, marginTop: 2 }}>{s.name}</div>
                    <div style={{ fontFamily: T.font.mono, fontSize: 8, color: T.text.muted, marginTop: 4 }}>{s.color}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface + Status colors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 8 }}>Surface Layers</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {Object.entries(T.bg).filter(([k]) => !k.includes("overlay")).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: T.radius.sm, background: T.bg.hover }}>
                      <div style={{ width: 28, height: 28, borderRadius: T.radius.sm, background: v, border: `1px solid ${T.border.default}` }} />
                      <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.secondary, flex: 1 }}>{k}</span>
                      <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 8 }}>Semantic Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[["Good / Low Carbon", T.status.good], ["Warning / Medium", T.status.warning], ["Danger / High Carbon", T.status.danger], ["Info / Neutral", T.status.info]].map(([l, c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: T.radius.sm, background: T.bg.hover }}>
                      <div style={{ width: 28, height: 28, borderRadius: T.radius.sm, background: c }} />
                      <span style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.secondary, flex: 1 }}>{l}</span>
                      <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── TYPOGRAPHY ── */}
          <SectionTitle tag="Design Tokens" title="Typography" desc="Instrument Serif for display headlines, Plus Jakarta Sans for headings and body, IBM Plex Mono for data values and code." />
          <div className="cs-stagger" style={{ display: "grid", gap: 16, marginBottom: 56 }}>
            {[
              { family: "Instrument Serif", css: T.font.display, sample: "Whole Life Carbon Assessment", size: 40, weight: 400, italic: false },
              { family: "Plus Jakarta Sans", css: T.font.heading, sample: "Embodied Carbon Dashboard", size: 24, weight: 800, italic: false },
              { family: "Plus Jakarta Sans", css: T.font.body, sample: "Sustainability consultants use lifecycle assessment to quantify building carbon impact across all EN 15978 modules.", size: 14, weight: 400, italic: false },
              { family: "IBM Plex Mono", css: T.font.mono, sample: "847,300 kgCO₂e  |  412 kgCO₂e/m²  |  A1-A5: 327,000", size: 14, weight: 500, italic: false },
            ].map((t, i) => (
              <div key={i} style={{ padding: "20px 24px", background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <Badge variant="accent">{t.family}</Badge>
                  <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>{t.size}px · {t.weight}</span>
                </div>
                <div style={{ fontFamily: t.css, fontSize: t.size, fontWeight: t.weight, fontStyle: t.italic ? "italic" : "normal", color: T.text.primary, lineHeight: 1.35 }}>{t.sample}</div>
              </div>
            ))}
          </div>

          {/* ── BUTTONS ── */}
          <SectionTitle tag="Components" title="Buttons" />
          <div style={{ padding: 28, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}`, marginBottom: 56 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
              <Button variant="primary" size="lg" icon={<span>📄</span>}>Generate Report</Button>
              <Button variant="secondary" size="lg">Compare Options</Button>
              <Button variant="ghost" size="lg">View EPDs →</Button>
              <Button variant="danger" size="md">Delete Assessment</Button>
              <Button variant="primary" size="md" disabled>Processing...</Button>
            </div>
            <Divider label="sizes" />
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* ── BADGES ── */}
          <SectionTitle tag="Components" title="Badges & Tags" />
          <div style={{ padding: 28, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}`, marginBottom: 56 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="success" dot>Below Target</Badge>
              <Badge variant="warning" dot>Near Limit</Badge>
              <Badge variant="danger" dot>Over Budget</Badge>
              <Badge variant="info">EN 15978</Badge>
              <Badge variant="accent">Verified EPD</Badge>
            </div>
            <Divider label="lifecycle stage tags" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {LIFECYCLE_STAGES.map(s => <LifecycleStageTag key={s.key} stageKey={s.key} />)}
            </div>
          </div>

          {/* ── FORM ELEMENTS ── */}
          <SectionTitle tag="Components" title="Form Inputs" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 56 }}>
            <Input label="Gross Internal Area" placeholder="12,450" suffix="m²" mono />
            <Input label="Study Period" placeholder="60" suffix="years" mono />
            <Input label="Carbon Budget" placeholder="1,175,000" suffix="kgCO₂e" mono />
          </div>

          {/* ── KPI CARDS ── */}
          <SectionTitle tag="Components" title="KPI Cards" desc="5 essential carbon metrics per dashboard. Animated count-up, trend indicators, and optional sparklines." />
          <div className="cs-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 56 }}>
            <KPICard label="Total Embodied Carbon" value={847300} unit="kgCO₂e" trend={-12.3} trendLabel="vs baseline" icon="🏗" status="good" sparkData={[85,92,88,79,72,68,65]} />
            <KPICard label="Carbon Intensity" value={412} unit="kgCO₂e/m²" trend={-8.1} trendLabel="vs baseline" icon="📏" status="warning" />
            <KPICard label="Operational Carbon" value={28.4} unit="kgCO₂e/m²/yr" trend={-15.7} trendLabel="vs typical" icon="⚡" status="good" />
          </div>

          {/* ── LIFECYCLE BAR CHART ── */}
          <SectionTitle tag="Data Visualization" title="Lifecycle Stage Breakdown" desc="EN 15978 stacked bars with animated reveal and grid. Primary analysis chart for sustainability consultants." />
          <div style={{ marginBottom: 56 }}>
            <LifecycleBarChart data={SAMPLE_LIFECYCLE.map(d => ({ ...d, value: Math.abs(d.value) }))} />
          </div>

          {/* ── STACKED COMPARISON ── */}
          <SectionTitle tag="Data Visualization" title="Design Option Comparison" desc="Side-by-side stacked bars for comparing structural systems. Best option highlighted in green." />
          <div style={{ marginBottom: 56 }}>
            <StackedBarComparison options={SAMPLE_COMPARISON} />
          </div>

          {/* ── BENCHMARK GAUGE ── */}
          <SectionTitle tag="Data Visualization" title="Benchmark Gauge" desc="LETI-banded carbon rating with animated fill. Configurable for RIBA 2030, DGNB, or custom thresholds." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 56 }}>
            <BenchmarkGauge value={412} bands={LETI_BANDS} label="LETI Embodied Carbon — A1-A5" unit="kgCO₂e/m²" />
            <BenchmarkGauge value={625} bands={[
              { min: 0, max: 625, label: "On Track", color: T.status.good, variant: "success" },
              { min: 625, max: 750, label: "Caution", color: T.status.warning, variant: "warning" },
              { min: 750, max: 1200, label: "Over", color: T.status.danger, variant: "danger" },
            ]} label="RIBA 2030 WLC Target (A–C)" unit="kgCO₂e/m²" />
          </div>

          {/* ── EPD CARDS ── */}
          <SectionTitle tag="Components" title="EPD Data Cards" desc="Environmental Product Declaration cards with GWP, percentile position, verification status, and lifecycle stage." />
          <div className="cs-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 56 }}>
            <EPDCard product="CEM I 42.5N Concrete C30/37" manufacturer="CEMEX UK" gwp={234} unit="kgCO₂e/m³" category="Ready-mix Concrete" percentile={45} verified stage="A1A3" />
            <EPDCard product="CLT Panel 120mm" manufacturer="Stora Enso" gwp={-48} unit="kgCO₂e/m²" category="Mass Timber" percentile={15} verified stage="A1A3" />
            <EPDCard product="Mineral Wool Insulation 100mm" manufacturer="Rockwool" gwp={4.2} unit="kgCO₂e/m²" category="Insulation" percentile={28} verified stage="A1A3" />
          </div>

          {/* ── MATERIAL COMPARISON ── */}
          <SectionTitle tag="Components" title="Material Comparison Table" desc="Side-by-side EPD comparison with best-option highlighting. Supports up to 4 options per material." />
          <div style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 24, border: `1px solid ${T.border.default}`, marginBottom: 56 }}>
            <MaterialComparisonRow name="Structural Concrete" options={[
              { name: "CEM I C30/37", gwp: 234, source: "CEMEX EPD" },
              { name: "CEM II/B C30/37", gwp: 188, source: "Hanson EPD" },
              { name: "GGBS 50% C30/37", gwp: 142, source: "Aggregate Ind." },
            ]} />
            <MaterialComparisonRow name="Reinforcement Steel" options={[
              { name: "UK Rebar", gwp: 1.99, source: "CARES EPD" },
              { name: "EAF Rebar", gwp: 0.84, source: "ArcelorMittal" },
              { name: "Recycled 97%", gwp: 0.52, source: "Celsa EPD" },
            ]} />
            <MaterialComparisonRow name="Insulation" options={[
              { name: "Mineral Wool", gwp: 4.2, source: "Rockwool EPD" },
              { name: "Wood Fibre", gwp: -2.1, source: "Steico EPD" },
              { name: "EPS", gwp: 7.8, source: "BPF Generic" },
            ]} />
          </div>

          {/* ── COMPLIANCE CARDS ── */}
          <SectionTitle tag="Components" title="Compliance Cards" desc="Real-time compliance status against multiple frameworks. Color-coded with score progress." />
          <div className="cs-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 56 }}>
            <ComplianceCard framework="RICS WLC v2" status="pass" score={8} maxScore={10} details="All modules A–D reported. 60-yr study period." />
            <ComplianceCard framework="BREEAM Mat 01" status="warning" score={6} maxScore={9} details="Missing Stage 4 update." />
            <ComplianceCard framework="LEED v5 MRc" status="pass" score={3} maxScore={4} details="14.2% reduction demonstrated." />
            <ComplianceCard framework="DGNB ENV1.1" status="fail" score={12} maxScore={30} details="Below reference building threshold." />
          </div>

          {/* ── TABS ── */}
          <SectionTitle tag="Components" title="Tabs & Accordions" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 56 }}>
            <Tabs items={[
              { label: "Summary", content: <div style={{ fontSize: 13, color: T.text.secondary, lineHeight: 1.7 }}>Total whole-life carbon: 847,300 kgCO₂e across modules A1–C4. Module D credits: -38,000 kgCO₂e from steel recycling and timber biogenic storage. Carbon intensity: 412 kgCO₂e/m² (LETI Band B).</div> },
              { label: "By Element", content: <div style={{ fontSize: 13, color: T.text.secondary, lineHeight: 1.7 }}>Substructure: 18% · Superstructure: 42% · Envelope: 15% · MEP: 12% · Internal Finishes: 8% · External Works: 5%</div> },
              { label: "By Module", content: <div style={{ fontSize: 13, color: T.text.secondary, lineHeight: 1.7 }}>A1-A3 Product: 285,000 · A4-A5 Construction: 42,000 · B1-B5 Maintenance: 95,000 · B6-B7 Operational: 186,000 · C1-C4 End of Life: 31,000</div> },
            ]} />
            <div style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 20, border: `1px solid ${T.border.default}` }}>
              <AccordionItem title="What lifecycle stages are included?" badge={<Badge variant="info">EN 15978</Badge>} defaultOpen>
                The assessment covers modules A1–A5 (product & construction), B1–B7 (use stage including operational energy), C1–C4 (end of life), and Module D (beyond lifecycle benefits). Study period is 60 years per RICS v2 methodology.
              </AccordionItem>
              <AccordionItem title="Which EPD databases are used?">
                Primary data from manufacturer-specific EPDs where available (EN 15804+A2 compliant). Generic data from ICE Database v3.0 and ÖKOBAUDAT 2024-I for materials without product-specific EPDs.
              </AccordionItem>
              <AccordionItem title="How is operational carbon calculated?">
                B6 operational energy from dynamic energy simulation (approved software per RICS v2). Grid decarbonization factors applied using BEIS projections. B7 water use from CIBSE benchmarks.
              </AccordionItem>
            </div>
          </div>

          {/* ── LOADING STATES ── */}
          <SectionTitle tag="Components" title="Loading States" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 56 }}>
            <div style={{ padding: 20, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton w="40%" h="12px" />
              <Skeleton w="60%" h="28px" />
              <Skeleton w="80%" h="12px" />
              <Skeleton w="100%" h="80px" r={T.radius.md} />
            </div>
            <div style={{ padding: 20, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton w="50%" h="12px" />
              <Skeleton w="100%" h="28px" />
              <div style={{ display: "flex", gap: 8 }}>
                <Skeleton w="60px" h="20px" r={T.radius.full} />
                <Skeleton w="80px" h="20px" r={T.radius.full} />
              </div>
            </div>
            <div style={{ padding: 20, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Skeleton w="28px" h="28px" r={T.radius.sm} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Skeleton w="70%" h="12px" />
                  <Skeleton w="40%" h="10px" />
                </div>
              </div>
              <Skeleton w="100%" h="4px" />
              <Skeleton w="100%" h="60px" r={T.radius.md} />
            </div>
          </div>

          {/* ── TOAST DEMO ── */}
          <SectionTitle tag="Components" title="Toast Notifications" />
          <div style={{ display: "flex", gap: 10, marginBottom: 56 }}>
            <Button variant="primary" size="sm" onClick={showToast}>Trigger Success Toast</Button>
            <Button variant="secondary" size="sm">Info Toast</Button>
            <Button variant="danger" size="sm">Error Toast</Button>
          </div>

          {/* ── TOKEN REFERENCE ── */}
          <SectionTitle tag="Reference" title="Spacing, Radius & Shadows" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 56 }}>
            <div style={{ padding: 24, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}` }}>
              <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 14 }}>Spacing Scale</div>
              {T.spacing.slice(1, 10).map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted, width: 32 }}>{v}</span>
                  <div style={{ width: v, height: 8, background: `linear-gradient(90deg, ${T.green[500]}, ${T.green[700]})`, borderRadius: 2 }} />
                  <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted }}>{v}px</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 24, background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}` }}>
              <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 14 }}>Elevation / Shadow</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(T.shadow).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: T.radius.md, background: T.bg.elevated, boxShadow: v, border: `1px solid ${T.border.muted}` }} />
                    <div>
                      <div style={{ fontFamily: T.font.mono, fontSize: 11, color: T.text.secondary }}>{k}</div>
                      <div style={{ fontFamily: T.font.mono, fontSize: 8, color: T.text.muted, marginTop: 2, maxWidth: 200, wordBreak: "break-all" }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── MOTION REFERENCE ── */}
          <SectionTitle tag="Reference" title="Animation Library" desc="10 keyframe animations with configurable easing. CSS-only, GPU-accelerated." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 56 }}>
            {[
              { name: "fadeUp", anim: "cs-fadeUp", dur: "0.5s ease both" },
              { name: "fadeIn", anim: "cs-fadeIn", dur: "0.5s ease both" },
              { name: "scaleIn", anim: "cs-scaleIn", dur: "0.4s ease both" },
              { name: "slideRight", anim: "cs-slideRight", dur: "0.4s ease both" },
              { name: "float", anim: "cs-float", dur: "3s ease-in-out infinite" },
              { name: "pulse", anim: "cs-pulse", dur: "1.5s ease infinite" },
              { name: "glow", anim: "cs-glow", dur: "2s ease infinite" },
              { name: "shimmer", anim: "cs-shimmer", dur: "1.5s ease infinite" },
              { name: "countUp", anim: "cs-countUp", dur: "0.4s ease both" },
              { name: "spin", anim: "cs-spin", dur: "2s linear infinite" },
            ].map(a => (
              <div key={a.name} style={{ padding: 16, borderRadius: T.radius.md, background: T.bg.card, border: `1px solid ${T.border.default}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: T.radius.sm,
                  background: `linear-gradient(135deg, ${T.green[500]}, ${T.green[700]})`,
                  animation: `${a.anim} ${a.dur}`,
                  ...(a.name === "shimmer" ? { background: `linear-gradient(90deg, ${T.bg.hover} 25%, ${T.bg.elevated} 50%, ${T.bg.hover} 75%)`, backgroundSize: "200% 100%" } : {}),
                }} />
                <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted }}>{a.name}</span>
              </div>
            ))}
          </div>

          {/* ── EASING CURVES ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 56 }}>
            {Object.entries(T.ease).map(([k, v]) => (
              <div key={k} style={{ padding: 14, borderRadius: T.radius.md, background: T.bg.card, border: `1px solid ${T.border.default}`, textAlign: "center" }}>
                <div style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{k}</div>
                <code style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, wordBreak: "break-all" }}>{v}</code>
              </div>
            ))}
          </div>

          {/* ── FOOTER ── */}
          <div style={{ borderTop: `1px solid ${T.border.default}`, paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: T.font.heading, fontSize: 14, fontWeight: 700, color: T.text.primary }}>CarbonScope Design System</div>
              <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.muted, marginTop: 2 }}>v1.0 · EN 15978-aligned · Built for sustainability consultants</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge variant="accent">25+ Components</Badge>
              <Badge variant="info">10 Animations</Badge>
              <Badge variant="default">Dark Mode</Badge>
            </div>
          </div>

        </div>
      )}

      <Toast message="RICS WLC Report generated successfully" type="success" visible={toast} />
    </div>
  );
}