/**
 * SUNA BIM Design System Showcase
 * Combines Luxury Forest Theme + CarbonBank Patterns
 *
 * This file demonstrates all major component patterns from the design system
 */

import React, { useState } from 'react';
import {
  Leaf, TrendingUp, MapPin, Zap, Droplets, Users,
  Trophy, Crown, Bell, Scan, ArrowUpRight, CheckCircle,
  Building2, BarChart3, FileCheck, Sparkles
} from 'lucide-react';

// ============================================
// 🎨 HERO CARD (Dashboard Main Asset)
// ============================================
export const HeroCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  onClick?: () => void;
}> = ({ title, value, subtitle, trend, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-[2rem] p-7 text-white shadow-2xl shadow-green-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all duration-300"
    >
      {/* Glossy Effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/15 transition duration-700" />

      {/* Animated Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M10 0v20M0 10h20\' stroke=\'%23fff\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")'
      }} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">{title}</span>
          {trend && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-full">
              <TrendingUp size={12} />
              {trend}
            </span>
          )}
        </div>

        <h2 className="text-4xl font-extrabold mb-2 tracking-tight leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h2>

        <p className="text-sm text-emerald-200 font-medium">
          {subtitle}
        </p>

        {/* Decorative Icon */}
        <div className="absolute bottom-4 right-4 opacity-10">
          <Leaf size={64} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 METRIC CARD (Glass Effect)
// ============================================
export const MetricCard: React.FC<{
  value: string | number;
  label: string;
  trend?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning';
}> = ({ value, label, trend, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-emerald-500 border-emerald-500',
    success: 'text-green-400 border-green-400',
    warning: 'text-yellow-400 border-yellow-400'
  };

  return (
    <div className="bg-[rgba(15,25,20,0.7)] backdrop-blur-xl rounded-xl p-6 border border-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(16,185,129,0.25)] cursor-pointer group">
      {/* Icon Badge */}
      {icon && (
        <div className="mb-4 inline-flex p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/15 transition-colors">
          {icon}
        </div>
      )}

      {/* Value */}
      <div className={`text-4xl font-extrabold mb-2 bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent ${colorClasses[color]}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {/* Label */}
      <div className="text-xs uppercase tracking-widest text-emerald-300/70 font-semibold mb-2">
        {label}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
          <ArrowUpRight size={16} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🎯 QUICK ACTION BUTTON
// ============================================
export const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  bg?: string;
}> = ({ icon, label, onClick, color = 'text-emerald-500', bg = 'bg-emerald-500/10' }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-2 group"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 group-active:scale-90 transition-all duration-300 ease-out shadow-sm`}>
        <div className={color}>
          {icon}
        </div>
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-300 transition-colors">
        {label}
      </span>
    </button>
  );
};

// ============================================
// 📋 DATA ROW (System Status)
// ============================================
export const DataRow: React.FC<{
  label: string;
  value: string | number;
  status?: 'active' | 'warning' | 'inactive';
  onClick?: () => void;
}> = ({ label, value, status = 'active', onClick }) => {
  const statusColors = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    inactive: 'bg-gray-500'
  };

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 bg-[rgba(15,25,20,0.4)] rounded-xl hover:bg-[rgba(16,185,129,0.08)] transition-all duration-200 border border-transparent hover:border-emerald-500/20 cursor-pointer group"
    >
      <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
        {label}
      </div>
      <div className="text-sm font-bold text-emerald-500 font-mono">
        {value}
      </div>
      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} shadow-[0_0_8px] shadow-current animate-pulse`} />
    </div>
  );
};

// ============================================
// 🏆 ACHIEVEMENT BADGE
// ============================================
export const AchievementBadge: React.FC<{
  label: string;
  icon?: React.ReactNode;
  variant?: 'success' | 'gold' | 'primary';
}> = ({ label, icon, variant = 'success' }) => {
  const variants = {
    success: {
      bg: 'bg-green-500/15',
      border: 'border-green-500',
      text: 'text-green-400',
      shadow: 'shadow-[0_4px_12px_rgba(74,222,128,0.3)]'
    },
    gold: {
      bg: 'bg-yellow-500/15',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      shadow: 'shadow-[0_4px_12px_rgba(251,191,36,0.3)]'
    },
    primary: {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500',
      text: 'text-emerald-400',
      shadow: 'shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
    }
  };

  const style = variants[variant];

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 ${style.bg} border ${style.border} ${style.text} rounded-full text-xs font-bold ${style.shadow} transition-all hover:scale-105`}>
      {icon || <CheckCircle size={16} />}
      <span>{label}</span>
    </div>
  );
};

// ============================================
// 🎨 GRADIENT BUTTON
// ============================================
export const GradientButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}> = ({ children, onClick, variant = 'primary', size = 'md', fullWidth, icon }) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)]',
    secondary: 'bg-[rgba(15,25,20,0.6)] text-emerald-400 border border-emerald-500/30 hover:bg-[rgba(15,25,20,0.8)] hover:border-emerald-500',
    outline: 'bg-transparent text-emerald-400 border-2 border-emerald-500 hover:bg-emerald-500/10'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-bold transition-all duration-300
        hover:scale-[1.02] active:scale-[0.98]
        flex items-center justify-center gap-2
        relative overflow-hidden
      `}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

      {icon}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// ============================================
// 🧭 BOTTOM NAVIGATION
// ============================================
export const BottomNav: React.FC<{
  items: Array<{ id: string; icon: React.ReactNode; label: string }>;
  active: string;
  onNavigate: (id: string) => void;
}> = ({ items, active, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(15,25,20,0.8)] backdrop-blur-3xl border-t border-emerald-500/20 shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center px-6 py-3 max-w-md mx-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex flex-col items-center gap-1 transition-all duration-200
              ${active === item.id
                ? 'text-emerald-500 scale-110'
                : 'text-gray-500 hover:text-emerald-400'
              }
            `}
          >
            <div className={active === item.id ? 'animate-bounce' : ''}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-semibold ${active === item.id ? 'font-bold' : ''}`}>
              {item.label}
            </span>
            {active === item.id && (
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ============================================
// 📱 FULL PAGE SHOWCASE
// ============================================
export const DesignSystemShowcase: React.FC = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showToast, setShowToast] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: <BarChart3 size={24} />, label: 'Dashboard' },
    { id: 'map', icon: <MapPin size={24} />, label: 'Map' },
    { id: 'scan', icon: <Scan size={24} />, label: 'Scan' },
    { id: 'profile', icon: <Users size={24} />, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f0d] to-[#0d1512] text-white pb-24 relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(5,150,105,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-8 space-y-8">
        {/* Header */}
        <header className="flex justify-between items-start animate-fade-in">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                SUNA BIM Platform
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              สวัสดี, คุณสมชาย
            </h1>
          </div>
          <div className="flex space-x-3 items-center">
            <button className="relative p-2.5 bg-white/5 rounded-full shadow-sm border border-white/10 text-gray-400 hover:text-emerald-500 transition active:scale-95">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0f0d]" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-lg cursor-pointer active:scale-95 transition">
              S
            </div>
          </div>
        </header>

        {/* Hero Card */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <HeroCard
            title="Total Carbon Credits"
            value="2,847"
            subtitle="kg CO₂ Offset This Quarter"
            trend="+24%"
            onClick={() => setShowToast(true)}
          />
        </div>

        {/* Quick Actions */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <QuickActionButton
              icon={<Scan size={24} strokeWidth={2.5} />}
              label="Scan"
              onClick={() => console.log('Scan')}
            />
            <QuickActionButton
              icon={<MapPin size={24} strokeWidth={2.5} />}
              label="Map"
              onClick={() => console.log('Map')}
            />
            <QuickActionButton
              icon={<FileCheck size={24} strokeWidth={2.5} />}
              label="Report"
              onClick={() => console.log('Report')}
            />
            <QuickActionButton
              icon={<Sparkles size={24} strokeWidth={2.5} />}
              label="AI Assist"
              onClick={() => console.log('AI')}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              value="94%"
              label="Energy Efficiency"
              trend="+12% this month"
              icon={<Zap size={20} className="text-emerald-500" />}
              color="primary"
            />
            <MetricCard
              value="1,247"
              label="Trees Planted"
              trend="+89 this week"
              icon={<Leaf size={20} className="text-green-400" />}
              color="success"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Building Systems
          </h2>
          <div className="space-y-2">
            <DataRow label="Solar Panel Array" value="247.8 kW" status="active" />
            <DataRow label="Rainwater Collection" value="8,942 L" status="active" />
            <DataRow label="HVAC Efficiency" value="96.2%" status="active" />
            <DataRow label="Geothermal System" value="Online" status="active" />
          </div>
        </div>

        {/* Achievements */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Recent Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            <AchievementBadge label="Carbon Neutral" variant="success" icon={<Leaf size={16} />} />
            <AchievementBadge label="LEED Platinum" variant="gold" icon={<Trophy size={16} />} />
            <AchievementBadge label="Net Zero Energy" variant="primary" icon={<Zap size={16} />} />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="opacity-0 animate-slide-up space-y-3" style={{ animationDelay: '0.6s' }}>
          <GradientButton
            variant="primary"
            fullWidth
            icon={<FileCheck size={18} />}
            onClick={() => setShowToast(true)}
          >
            Generate ESG Report
          </GradientButton>
          <GradientButton
            variant="secondary"
            fullWidth
            icon={<BarChart3 size={18} />}
          >
            View Analytics
          </GradientButton>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        items={navItems}
        active={activeNav}
        onNavigate={setActiveNav}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-[rgba(15,25,20,0.95)] backdrop-blur-xl border border-emerald-500/30 rounded-xl px-6 py-3 shadow-2xl flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-500" />
            <span className="text-sm font-semibold text-white">Action completed successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignSystemShowcase;
