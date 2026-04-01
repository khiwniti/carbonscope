'use client';

import { useState } from 'react';

interface MarkProps {
  size?: number;
  color?: string;
  weight?: number | null;
  animate?: boolean;
  delay?: number;
}

interface TypeProps {
  sz?: number;
  dark?: boolean;
  full?: boolean;
}

interface LockupProps {
  sz?: number;
  vertical?: boolean;
  dark?: boolean;
  animate?: boolean;
}

function Mark({ size = 100, color = '#10B981', weight = null, animate = false, delay = 0 }: MarkProps) {
  const s = size;
  const w = weight || s * 0.08;
  const r = s * 0.36;
  const cx = s * 0.48;
  const cy = s * 0.5;
  const gapDeg = 65;
  const gapRad = (gapDeg * Math.PI) / 180;
  const startAngle = Math.PI / 2 + gapRad / 2;
  const endAngle = Math.PI / 2 - gapRad / 2 + 2 * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const arcPath = `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 1,1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  const colW = w;
  const colH = s * 0.44;
  const colX = cx - colW / 2;
  const colY = cy - colH / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ display: 'block' }}
    >
      {animate && (
        <style>{`
          @keyframes fadeInMark {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      )}
      <g style={{
        animation: animate ? `fadeInMark 0.6s ease-out ${delay}s both` : 'none',
      }}>
        <path
          d={arcPath}
          stroke={color}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
        />
        <rect
          x={colX}
          y={colY}
          width={colW}
          height={colH}
          fill={color}
          rx={w / 2}
        />
      </g>
    </svg>
  );
}

function Type({ sz = 1, dark = true, full = false }: TypeProps) {
  const fg = dark ? '#F1F5F9' : '#0F172A';
  const ac = dark ? '#10B981' : '#047857';
  const mu = dark ? '#94A3B8' : '#64748B';

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 * sz, fontFamily: 'system-ui' }}>
      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32 * sz, fontWeight: 400, color: ac, letterSpacing: '-0.02em' }}>
        c
      </span>
      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32 * sz, fontWeight: 400, color: fg, letterSpacing: '-0.02em' }}>
        BIM
      </span>
      <span style={{ fontFamily: "'IBM Plex Mono', 'Consolas', monospace", fontSize: 11 * sz, fontWeight: 500, color: mu, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        AI
      </span>
      {full && (
        <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 14 * sz, fontWeight: 400, color: mu, marginLeft: 6 * sz }}>
          Carbon Scope
        </span>
      )}
    </div>
  );
}

function Lockup({ sz = 1, vertical = false, dark = true, animate = false }: LockupProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      alignItems: vertical ? 'flex-start' : 'center',
      gap: vertical ? 8 * sz : 12 * sz,
    }}>
      <Mark size={48 * sz} color={dark ? '#10B981' : '#047857'} animate={animate} />
      <Type sz={sz} dark={dark} />
    </div>
  );
}

export default function BrandGuidePage() {
  const [showAnimated, setShowAnimated] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B1120',
      backgroundImage: `
        linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      color: '#E2E8F0',
      padding: '4rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '3rem',
            fontWeight: 400,
            color: '#F1F5F9',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            cBIM AI Brand Guide
          </h1>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.125rem',
            color: '#94A3B8',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}>
            Our visual identity system for the Carbon Building Information Modeling AI platform.
          </p>
        </div>

        {/* Logo Mark Section */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#10B981',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            Logo Mark
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(30, 41, 59, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mark size={120} />
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(30, 41, 59, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mark size={120} color="#047857" />
            </div>
            <div style={{
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mark size={120} color="#047857" />
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid rgba(30, 41, 59, 0.5)',
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
              fontSize: '0.875rem',
              color: '#94A3B8',
              margin: 0,
              lineHeight: 1.6,
            }}>
              The mark consists of an arc (representing continuous flow) and a column (representing structure). Use emerald green #10B981 on dark backgrounds, or #047857 on light backgrounds.
            </p>
          </div>
        </section>

        {/* Typography Section */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#10B981',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            Typography
          </h2>
          <div style={{
            display: 'grid',
            gap: '2rem',
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '3rem',
              border: '1px solid rgba(30, 41, 59, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Type sz={2} />
            </div>
            <div style={{
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '3rem',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Type sz={2} dark={false} />
            </div>
          </div>
        </section>

        {/* Lockups Section */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#10B981',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            Lockups
          </h2>
          <div style={{
            display: 'grid',
            gap: '2rem',
          }}>
            {/* Horizontal Lockup - Dark */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '3rem',
              border: '1px solid rgba(30, 41, 59, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lockup sz={1.5} />
            </div>

            {/* Horizontal Lockup - Light */}
            <div style={{
              background: '#F1F5F9',
              borderRadius: '12px',
              padding: '3rem',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lockup sz={1.5} dark={false} />
            </div>

            {/* Vertical Lockup - Dark */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              padding: '3rem',
              border: '1px solid rgba(30, 41, 59, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lockup sz={1.5} vertical />
            </div>
          </div>
        </section>

        {/* Animation Demo */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#10B981',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            Animation
          </h2>
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '12px',
            padding: '3rem',
            border: '1px solid rgba(30, 41, 59, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {showAnimated ? (
                <Lockup sz={1.5} animate key={Date.now()} />
              ) : (
                <Lockup sz={1.5} />
              )}
            </div>
            <button
              onClick={() => setShowAnimated(!showAnimated)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
            >
              {showAnimated ? 'Reset Animation' : 'Show Animation'}
            </button>
          </div>
        </section>

        {/* Color Palette */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#10B981',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            Color Palette
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { name: 'Background', color: '#0B1120', text: '#E2E8F0' },
              { name: 'Surface', color: '#0F172A', text: '#E2E8F0' },
              { name: 'Emerald', color: '#10B981', text: '#FFFFFF' },
              { name: 'Emerald Dark', color: '#047857', text: '#FFFFFF' },
              { name: 'Text Primary', color: '#F1F5F9', text: '#0F172A' },
              { name: 'Text Secondary', color: '#94A3B8', text: '#0F172A' },
            ].map((item) => (
              <div key={item.name} style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(30, 41, 59, 0.5)',
              }}>
                <div style={{
                  width: '100%',
                  height: '80px',
                  background: item.color,
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                }} />
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#E2E8F0',
                  marginBottom: '0.25rem',
                }}>
                  {item.name}
                </p>
                <p style={{
                  fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
                  fontSize: '0.75rem',
                  color: '#64748B',
                  margin: 0,
                }}>
                  {item.color}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Grid System */}
        <section>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#10B981',
            marginBottom: '2rem',
            letterSpacing: '-0.01em',
          }}>
            Grid System
          </h2>
          <div style={{
            background: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid rgba(30, 41, 59, 0.5)',
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', 'Consolas', monospace",
              fontSize: '0.875rem',
              color: '#94A3B8',
              margin: 0,
              lineHeight: 1.6,
            }}>
              Background grid: 40px × 40px with 5% opacity (#94A3B8). Applied via linear gradients for optimal performance.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
