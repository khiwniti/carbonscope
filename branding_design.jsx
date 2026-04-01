import { useState, useEffect, useRef } from "react";

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CARBONSCOPE — Brand Identity & Logo System                        ║
 * ║  "Strata" Logo · Three Geological Layers of Carbon Lifecycle       ║
 * ║  Dark Engineering · Emerald Accent · EN 15978 Aligned              ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const T = {
  bg: { base: "#0B1120", surface: "#111827", elevated: "#1A2332", card: "#162032", hover: "#1E293B" },
  border: { default: "#1E293B", muted: "#1a2236", active: "#059669", hover: "#334155" },
  text: { primary: "#E2E8F0", secondary: "#94A3B8", muted: "#64748B", accent: "#34D399" },
  green: { 50:"#ECFDF5",100:"#D1FAE5",200:"#A7F3D0",300:"#6EE7B7",400:"#34D399",500:"#10B981",600:"#059669",700:"#047857",800:"#065F46",900:"#064E3B",glow:"rgba(52,211,153,0.15)",glowStrong:"rgba(52,211,153,0.25)" },
  cyan: { 400: "#22D3EE", 500: "#06B6D4", 600: "#0891B2", 700: "#0E7490" },
  lifecycle: { A1A3:"#3B82F6", A4A5:"#60A5FA", B1B5:"#F59E0B", B6B7:"#EA580C", C1C4:"#6B7280", D:"#10B981" },
  font: {
    display: "'Instrument Serif', Georgia, serif",
    heading: "'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', 'Consolas', monospace",
  },
  radius: { sm:"6px", md:"10px", lg:"14px", xl:"20px", full:"9999px" },
  shadow: { sm:"0 1px 3px rgba(0,0,0,0.3)", md:"0 4px 12px rgba(0,0,0,0.4)", lg:"0 8px 32px rgba(0,0,0,0.5)", glow:"0 0 20px rgba(52,211,153,0.08)" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${T.bg.base}}::-webkit-scrollbar-thumb{background:${T.border.default};border-radius:3px}
html{scroll-behavior:smooth}

@keyframes cs-fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes cs-scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes cs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes cs-glow{0%,100%{filter:drop-shadow(0 0 12px rgba(52,211,153,0.15))}50%{filter:drop-shadow(0 0 28px rgba(52,211,153,0.35))}}
@keyframes cs-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes cs-layerIn1{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-layerIn2{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-layerIn3{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-gridPulse{0%,100%{opacity:0.03}50%{opacity:0.08}}
@keyframes cs-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

.stagger>*{animation:cs-fadeUp 0.7s cubic-bezier(0.45,0,0.15,1) both}
.stagger>*:nth-child(1){animation-delay:0ms}
.stagger>*:nth-child(2){animation-delay:80ms}
.stagger>*:nth-child(3){animation-delay:160ms}
.stagger>*:nth-child(4){animation-delay:240ms}
.stagger>*:nth-child(5){animation-delay:320ms}
.stagger>*:nth-child(6){animation-delay:400ms}
.stagger>*:nth-child(7){animation-delay:480ms}
.stagger>*:nth-child(8){animation-delay:560ms}

.logo-hover:hover .layer-1{transform:translateY(-3px);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1)}
.logo-hover:hover .layer-2{transform:translateY(0px);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.05s}
.logo-hover:hover .layer-3{transform:translateY(3px);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s}
.logo-hover .layer-1,.logo-hover .layer-2,.logo-hover .layer-3{transition:transform 0.3s ease}
`;

function CarbonScopeLogo({ size = 40, animate = false, glow = false, className = "" }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      style={{ filter: glow ? "drop-shadow(0 0 16px rgba(52,211,153,0.3))" : "none", animation: animate ? "cs-glow 3s ease-in-out infinite" : "none" }}>
      <path className="layer-1" d="M20 4L6 11L20 18L34 11L20 4Z" fill="url(#sg-cyan)" style={{ animation: animate ? "cs-layerIn1 0.6s ease both 0.1s" : "none" }} />
      <path className="layer-2" d="M6 16L20 23L34 16L34 21L20 28L6 21V16Z" fill="url(#sg-emerald)" style={{ animation: animate ? "cs-layerIn2 0.6s ease both 0.3s" : "none" }} />
      <path className="layer-3" d="M6 26L20 33L34 26L34 31L20 38L6 31V26Z" fill="url(#sg-dark)" style={{ animation: animate ? "cs-layerIn3 0.6s ease both 0.5s" : "none" }} />
      <defs>
        <linearGradient id="sg-cyan" x1="6" y1="4" x2="34" y2="18" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE" /><stop offset="1" stopColor="#0891B2" /></linearGradient>
        <linearGradient id="sg-emerald" x1="6" y1="16" x2="34" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#34D399" /><stop offset="1" stopColor="#059669" /></linearGradient>
        <linearGradient id="sg-dark" x1="6" y1="26" x2="34" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" /><stop offset="1" stopColor="#064E3B" /></linearGradient>
      </defs>
    </svg>
  );
}

function Lockup({ size = "md", vertical = false, glow = false }) {
  const s = { sm: { logo: 28, gap: 8, f: 16, sub: 7 }, md: { logo: 36, gap: 10, f: 22, sub: 9 }, lg: { logo: 48, gap: 14, f: 32, sub: 11 }, xl: { logo: 64, gap: 18, f: 44, sub: 14 } }[size];
  return (
    <div className="logo-hover" style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: vertical ? "center" : "center", gap: s.gap, cursor: "default" }}>
      <CarbonScopeLogo size={s.logo} glow={glow} />
      <div style={{ textAlign: vertical ? "center" : "left" }}>
        <span style={{ fontFamily: T.font.heading, fontSize: s.f, fontWeight: 800, color: T.text.primary, letterSpacing: "-0.03em", lineHeight: 1, display: "block" }}>
          Carbon<span style={{ color: T.green[400] }}>Scope</span>
        </span>
        <span style={{ fontFamily: T.font.mono, fontSize: s.sub, fontWeight: 500, color: T.text.muted, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1, display: "block" }}>
          Embodied Carbon Intelligence
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ tag, title, desc }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <span style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: T.green[500], letterSpacing: "0.14em", textTransform: "uppercase" }}>{tag}</span>
      <h2 style={{ fontFamily: T.font.display, fontSize: 36, fontWeight: 400, color: T.text.primary, lineHeight: 1.1, marginTop: 8, letterSpacing: "-0.01em" }}>{title}</h2>
      {desc && <p style={{ fontFamily: T.font.body, fontSize: 14, color: T.text.muted, marginTop: 10, maxWidth: 640, lineHeight: 1.7 }}>{desc}</p>}
    </div>
  );
}

function ShowcaseCard({ label, bg, children }) {
  return (
    <div style={{ borderRadius: T.radius.lg, overflow: "hidden", border: `1px solid ${T.border.default}` }}>
      <div style={{ background: bg || T.bg.card, padding: 40, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
        {children}
      </div>
      {label && <div style={{ padding: "10px 16px", background: T.bg.surface, borderTop: `1px solid ${T.border.default}` }}><span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted, letterSpacing: "0.06em" }}>{label}</span></div>}
    </div>
  );
}

function Swatch({ color, name, hex, wide = false }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ flex: wide ? 2 : 1, cursor: "pointer", transition: "transform 0.2s ease", transform: h ? "scale(1.04)" : "none" }}>
      <div style={{ height: 64, borderRadius: `${T.radius.md} ${T.radius.md} 0 0`, background: color, boxShadow: h ? `0 0 20px ${color}44` : "none", transition: "box-shadow 0.3s ease" }} />
      <div style={{ padding: "8px 10px", background: T.bg.surface, borderRadius: `0 0 ${T.radius.md} ${T.radius.md}`, border: `1px solid ${T.border.default}`, borderTop: "none" }}>
        <div style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: T.text.primary }}>{name}</div>
        <div style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, marginTop: 1 }}>{hex}</div>
      </div>
    </div>
  );
}

function AttributePill({ icon, label, desc }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      padding: "16px 20px", borderRadius: T.radius.lg, background: h ? T.green.glow : T.bg.card,
      border: `1px solid ${h ? T.green[800] : T.border.default}`, cursor: "default",
      transition: "all 0.3s ease", transform: h ? "translateY(-2px)" : "none", boxShadow: h ? T.shadow.glow : "none",
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.font.body, fontSize: 11, color: T.text.muted, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function HeroLogo() {
  return (
    <div style={{ position: "relative", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", inset: 0, animation: "cs-fadeIn 2s ease both 0.8s" }}>
        <circle cx="140" cy="140" r="110" stroke={T.green[800]} strokeWidth="0.5" fill="none" strokeDasharray="4 8" opacity="0.4" />
        <circle cx="140" cy="140" r="130" stroke={T.cyan[700]} strokeWidth="0.5" fill="none" strokeDasharray="2 12" opacity="0.25" />
        {[0,60,120,180,240,300].map((deg, i) => {
          const r = 110, x = 140 + r * Math.cos((deg * Math.PI) / 180), y = 140 + r * Math.sin((deg * Math.PI) / 180);
          return <circle key={i} cx={x} cy={y} r="2" fill={i % 2 === 0 ? T.green[400] : T.cyan[400]} opacity="0.5" />;
        })}
      </svg>
      <div style={{ animation: "cs-float 5s ease-in-out infinite, cs-scaleIn 0.8s ease both 0.3s", zIndex: 1 }}>
        <CarbonScopeLogo size={120} animate glow />
      </div>
    </div>
  );
}

export default function CarbonScopeBranding() {
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { setTimeout(() => setHeroReady(true), 200); }, []);

  return (
    <div style={{ fontFamily: T.font.body, background: T.bg.base, color: T.text.primary, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 40px" }}>
        {/* Grid background */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${T.border.muted} 1px, transparent 1px), linear-gradient(90deg, ${T.border.muted} 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.4, animation: "cs-gridPulse 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 800px 400px at 50% 0%, ${T.green.glowStrong}, transparent)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 600px 300px at 80% 100%, rgba(6,182,212,0.08), transparent)` }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div className="stagger" style={{ opacity: heroReady ? 1 : 0, transition: "opacity 0.3s" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: T.radius.full, background: T.green.glow, border: `1px solid ${T.green[800]}`, fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: T.green[400], letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.green[400], animation: "cs-pulse 2s ease infinite" }} />
                Brand Identity v1.0
              </span>
            </div>
            <div>
              <h1 style={{ fontFamily: T.font.display, fontSize: 62, fontWeight: 400, color: T.text.primary, lineHeight: 1.05, letterSpacing: "-0.025em", marginTop: 20 }}>
                Carbon<span style={{ color: T.green[400], fontStyle: "italic" }}>Scope</span>
              </h1>
            </div>
            <div>
              <p style={{ fontFamily: T.font.body, fontSize: 17, color: T.text.secondary, lineHeight: 1.7, maxWidth: 420, marginTop: 6 }}>
                Embodied carbon intelligence for the built environment. Three strata of insight — from raw materials to circular futures.
              </p>
            </div>
            <div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <div style={{ padding: "10px 22px", borderRadius: T.radius.md, background: T.green[600], color: "#fff", fontFamily: T.font.body, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 20px ${T.green.glow}` }}>Download Brand Kit</div>
                <div style={{ padding: "10px 22px", borderRadius: T.radius.md, background: "transparent", color: T.text.primary, fontFamily: T.font.body, fontSize: 13, fontWeight: 600, border: `1px solid ${T.border.default}`, cursor: "pointer" }}>Design System</div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: 24, marginTop: 28, fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>
                <span>EN 15978 Aligned</span><span style={{ color: T.border.hover }}>·</span>
                <span>ISO 14044 Ready</span><span style={{ color: T.border.hover }}>·</span>
                <span>EDGE · LEED · TREES</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", animation: "cs-fadeIn 1.5s ease both 0.5s" }}><HeroLogo /></div>
        </div>
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "cs-fadeIn 1s ease both 2s" }}>
          <span style={{ fontFamily: T.font.mono, fontSize: 9, color: T.text.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll to explore</span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(180deg, ${T.green[500]}, transparent)`, animation: "cs-pulse 2s ease infinite" }} />
        </div>
      </section>

      {/* ═══ BRAND CONCEPT ═══ */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Brand Concept" title="Three Strata of Carbon Intelligence" desc="The CarbonScope logomark represents three geological strata — layers of the earth that mirror the EN 15978 lifecycle stages." />
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { gradient: ["#22D3EE","#0891B2"], label: "Layer 1 — Product", stage: "A1–A3", desc: "Raw material extraction, transport, and manufacturing. The foundational layer — where 70% of embodied carbon originates.", color: T.cyan[400], bg: "rgba(34,211,238,0.06)", border: "rgba(34,211,238,0.15)" },
            { gradient: [T.green[400],T.green[600]], label: "Layer 2 — Construction & Use", stage: "A4–B7", desc: "Construction process, maintenance, and operational energy. The living layer — where design decisions compound over decades.", color: T.green[400], bg: T.green.glow, border: T.green[800] },
            { gradient: [T.green[500],T.green[900]], label: "Layer 3 — Circular Future", stage: "C1–D", desc: "End of life and beyond-lifecycle benefits. The deepest layer — where demolition meets reuse and carbon debts are settled.", color: T.green[500], bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.15)" },
          ].map((layer, i) => (
            <div key={i} style={{ padding: 28, borderRadius: T.radius.lg, background: layer.bg, border: `1px solid ${layer.border}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${layer.gradient[0]}, ${layer.gradient[1]})` }} />
              <div style={{ fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: layer.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{layer.label}</div>
              <div style={{ fontFamily: T.font.heading, fontSize: 20, fontWeight: 800, color: T.text.primary, marginBottom: 8 }}>{layer.stage}</div>
              <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.secondary, lineHeight: 1.6 }}>{layer.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ LOGO SHOWCASE ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Logo System" title="Logomark, Wordmark & Lockups" desc="Multiple configurations for different contexts — from app icons to full horizontal lockups." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
          <ShowcaseCard label="Logomark — Dark Background" bg={T.bg.base}><div className="logo-hover"><CarbonScopeLogo size={80} glow /></div></ShowcaseCard>
          <ShowcaseCard label="Logomark — Light Background" bg="#F8FAFC"><div className="logo-hover"><CarbonScopeLogo size={80} /></div></ShowcaseCard>
          <ShowcaseCard label="Logomark — Monochrome" bg={T.bg.elevated}>
            <svg viewBox="0 0 40 40" width={80} height={80} fill="none">
              <path d="M20 4L6 11L20 18L34 11L20 4Z" fill={T.text.primary} opacity="0.9" />
              <path d="M6 16L20 23L34 16L34 21L20 28L6 21V16Z" fill={T.text.primary} opacity="0.55" />
              <path d="M6 26L20 33L34 26L34 31L20 38L6 31V26Z" fill={T.text.primary} opacity="0.25" />
            </svg>
          </ShowcaseCard>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 40 }}>
          <ShowcaseCard label="Horizontal Lockup — Primary" bg={T.bg.surface}><Lockup size="lg" glow /></ShowcaseCard>
          <ShowcaseCard label="Vertical Lockup" bg={T.bg.surface}><Lockup size="md" vertical /></ShowcaseCard>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {["sm", "md", "lg", "xl"].map(s => (
            <ShowcaseCard key={s} label={`Lockup — ${s.toUpperCase()}`} bg={T.bg.card}><Lockup size={s} /></ShowcaseCard>
          ))}
        </div>
      </section>

      {/* ═══ CLEAR SPACE & MIN SIZE ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Usage Guidelines" title="Clear Space & Minimum Sizes" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 40, border: `1px solid ${T.border.default}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", padding: 32 }}>
              <div style={{ position: "absolute", inset: 0, border: `1px dashed ${T.green[700]}`, borderRadius: T.radius.md, opacity: 0.5 }} />
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%) translateY(-50%)", background: T.bg.card, padding: "0 6px", fontFamily: T.font.mono, fontSize: 8, color: T.green[500] }}>x = logo height / 4</div>
              <Lockup size="md" />
            </div>
          </div>
          <div style={{ background: T.bg.card, borderRadius: T.radius.lg, padding: 40, border: `1px solid ${T.border.default}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
            <div style={{ fontFamily: T.font.heading, fontSize: 13, fontWeight: 700, color: T.text.primary, marginBottom: 8 }}>Minimum Sizes</div>
            {[{ label: "Digital — Logomark", size: 24, desc: "24px minimum" },{ label: "Digital — Lockup", size: 20, desc: "120px width minimum" },{ label: "Print — Logomark", size: 0, desc: "10mm minimum" }].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 14px", borderRadius: T.radius.md, background: T.bg.hover }}>
                {item.size > 0 ? <CarbonScopeLogo size={item.size} /> : <span style={{ width: 20, height: 20, borderRadius: 4, background: T.border.hover, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font.mono, fontSize: 7, color: T.text.muted }}>10</span>}
                <div><div style={{ fontFamily: T.font.body, fontSize: 12, fontWeight: 600, color: T.text.primary }}>{item.label}</div><div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>{item.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COLOR PALETTE ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Color System" title="Brand Palette" desc="A three-tier gradient system echoing the logo strata — from cyan atmosphere through emerald core to deep forest foundation." />
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 10 }}>Logo Gradient Palette</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Swatch color="#22D3EE" name="Cyan 400" hex="#22D3EE" wide />
            <Swatch color="#0891B2" name="Cyan 600" hex="#0891B2" />
            <Swatch color="#34D399" name="Emerald 400" hex="#34D399" wide />
            <Swatch color="#059669" name="Emerald 600" hex="#059669" />
            <Swatch color="#10B981" name="Green 500" hex="#10B981" />
            <Swatch color="#064E3B" name="Green 900" hex="#064E3B" />
          </div>
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 10 }}>Surface System</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["Base","#0B1120"],["Surface","#111827"],["Elevated","#1A2332"],["Card","#162032"],["Hover","#1E293B"]].map(([n,h])=><Swatch key={n} color={h} name={n} hex={h} />)}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: T.font.heading, fontSize: 12, fontWeight: 700, color: T.text.secondary, marginBottom: 10 }}>EN 15978 Lifecycle Stages</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["A1-A3","#3B82F6"],["A4-A5","#60A5FA"],["B1-B5","#F59E0B"],["B6-B7","#EA580C"],["C1-C4","#6B7280"],["D","#10B981"]].map(([n,c])=><Swatch key={n} color={c} name={n} hex={c} />)}
          </div>
        </div>
      </section>

      {/* ═══ TYPOGRAPHY ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Typography" title="Type System" desc="Instrument Serif for editorial weight, Plus Jakarta Sans for clarity, IBM Plex Mono for data precision." />
        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { face: "Instrument Serif", role: "Display", css: T.font.display, sample: "Whole Life Carbon", size: 48, weight: 400, st: "italic" },
            { face: "Plus Jakarta Sans", role: "Heading", css: T.font.heading, sample: "Embodied Carbon Dashboard", size: 28, weight: 800, st: "normal" },
            { face: "Plus Jakarta Sans", role: "Body", css: T.font.body, sample: "Sustainability consultants use lifecycle assessment to quantify the carbon impact of buildings across all EN 15978 modules.", size: 15, weight: 400, st: "normal" },
            { face: "IBM Plex Mono", role: "Data", css: T.font.mono, sample: "847,300 kgCO\u2082e  \u00b7  412 kgCO\u2082e/m\u00b2  \u00b7  LETI Band B", size: 14, weight: 500, st: "normal" },
          ].map((t, i) => (
            <div key={i} style={{ padding: "24px 28px", background: T.bg.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.default}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ padding: "2px 10px", borderRadius: T.radius.full, background: T.green.glow, border: `1px solid ${T.green[800]}`, fontFamily: T.font.mono, fontSize: 10, fontWeight: 600, color: T.green[400] }}>{t.role}</span>
                  <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>{t.face}</span>
                </div>
                <span style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>{t.size}px · {t.weight} · {t.st}</span>
              </div>
              <div style={{ fontFamily: t.css, fontSize: t.size, fontWeight: t.weight, fontStyle: t.st, color: T.text.primary, lineHeight: 1.25 }}>{t.sample}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BRAND ATTRIBUTES ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Brand Personality" title="Design Principles" />
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <AttributePill icon="\u25C7" label="Precision" desc="Every data point verified. No greenwashing. Carbon figures reported to EN 15804+A2 standards." />
          <AttributePill icon="\u25C8" label="Clarity" desc="Complex lifecycle data rendered instantly legible. Dark engineering aesthetic reduces cognitive load." />
          <AttributePill icon="\u25A3" label="Accountability" desc="Transparent methodology. Auditable baselines. EDGE, LEED, and TREES compliant from day one." />
          <AttributePill icon="\u25C9" label="Action" desc="Not just measurement — active material substitution, design optimization, and carbon budget management." />
        </div>
      </section>

      {/* ═══ APP ICONS ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Application" title="App Icons & Favicon" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {[128, 96, 64, 48, 32].map(size => (
            <ShowcaseCard key={size} label={`${size}\u00d7${size}px`} bg={T.bg.surface}>
              <div style={{ width: size, height: size, borderRadius: size > 48 ? 20 : size > 32 ? 12 : 8, background: `linear-gradient(135deg, ${T.bg.surface}, ${T.bg.base})`, border: `1px solid ${T.border.default}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.shadow.lg }}>
                <CarbonScopeLogo size={size * 0.6} />
              </div>
            </ShowcaseCard>
          ))}
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <section style={{ padding: "60px 0", borderTop: `1px solid ${T.border.default}`, borderBottom: `1px solid ${T.border.default}`, overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "cs-marquee 25s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 40, paddingRight: 40 }}>
              <CarbonScopeLogo size={28} />
              <span style={{ fontFamily: T.font.heading, fontSize: 28, fontWeight: 800, color: T.text.primary, letterSpacing: "-0.02em", opacity: 0.15 }}>CarbonScope</span>
              <span style={{ fontFamily: T.font.mono, fontSize: 11, color: T.green[700], letterSpacing: "0.1em", textTransform: "uppercase" }}>Embodied Carbon Intelligence</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ DONT'S ═══ */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle tag="Usage Guidelines" title="Logo Don'ts" desc="Maintain brand integrity by avoiding these common misuses." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Don't rotate", transform: "rotate(15deg)", filter: "" },
            { label: "Don't stretch", transform: "scaleX(1.5)", filter: "" },
            { label: "Don't recolor", transform: "", filter: "hue-rotate(180deg)" },
            { label: "Don't add effects", transform: "", filter: "blur(1px) brightness(1.5)" },
          ].map((d, i) => (
            <div key={i} style={{ background: T.bg.card, borderRadius: T.radius.lg, overflow: "hidden", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120, position: "relative" }}>
                <div style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: T.radius.full, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#EF4444", fontWeight: 700 }}>\u2715</div>
                <div style={{ transform: d.transform || "none", filter: d.filter || "none" }}><CarbonScopeLogo size={48} /></div>
              </div>
              <div style={{ padding: "10px 16px", background: T.bg.surface, borderTop: `1px solid ${T.border.default}` }}><span style={{ fontFamily: T.font.mono, fontSize: 10, color: "#F87171" }}>{d.label}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section style={{ padding: "60px 40px", borderTop: `1px solid ${T.border.default}`, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <Lockup size="md" />
            <div style={{ fontFamily: T.font.body, fontSize: 12, color: T.text.muted, marginTop: 12, lineHeight: 1.6, maxWidth: 360 }}>
              CarbonScope Brand Identity v1.0 — designed for the sustainable built environment. EN 15978-aligned. Built for Thailand & ASEAN construction markets.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 12 }}>
              {["EDGE", "LEED v5", "TREES", "ISO 14044", "EN 15978"].map(f => (
                <span key={f} style={{ padding: "3px 10px", borderRadius: T.radius.full, background: T.bg.hover, border: `1px solid ${T.border.default}`, fontFamily: T.font.mono, fontSize: 9, fontWeight: 600, color: T.text.muted }}>{f}</span>
              ))}
            </div>
            <div style={{ fontFamily: T.font.mono, fontSize: 10, color: T.text.muted }}>&copy; 2026 CarbonScope &middot; KCB &times; BKS</div>
          </div>
        </div>
      </section>
    </div>
  );
}