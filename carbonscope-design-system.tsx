import { useState, useEffect, useRef, useMemo } from "react";

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  CARBONSCOPE — Design System for Embodied & Operational Carbon     ║
 * ║  Dark Engineering Base + Emerald Green Accent                       ║
 * ║  EN 15978 Lifecycle-Aligned · Production-Ready                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN TOKENS
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

// [Rest of the design system code - truncated for brevity]
// See full implementation in the original file

export default T;
export { LIFECYCLE_STAGES };
