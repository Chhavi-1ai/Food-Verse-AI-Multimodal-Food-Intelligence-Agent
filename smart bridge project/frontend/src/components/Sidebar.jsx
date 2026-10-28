import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Activity,
  Sparkles,
  ShieldCheck,
  ChefHat,
  CalendarCheck,
  BookOpen,
  ShoppingCart,
  History,
  Settings,
  Leaf,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/food-recognition', label: 'Food Recognition', icon: Camera },
  { path: '/nutrition-analysis', label: 'Nutrition Analysis', icon: Activity },
  { path: '/freshness-detection', label: 'Freshness Detection', icon: Sparkles },
  { path: '/hygiene-monitoring', label: 'Hygiene Monitoring', icon: ShieldCheck },
  { path: '/cooking-assistant', label: 'Smart Cooking', icon: ChefHat },
  { path: '/meal-planner', label: 'Meal Planner', icon: CalendarCheck },
  { path: '/recipes', label: 'Recipe Collection', icon: BookOpen },
  { path: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
  { path: '/history', label: 'Analysis History', icon: History },
  { path: '/settings', label: 'Settings & Profile', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#164620', // Forest Green
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#22c55e', // Fresh Lime Green
                color: '#14532d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
              }}
            >
              <Leaf size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: '1.12rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'block' }}>
                Food Verse AI
              </span>
              <span style={{ fontSize: '0.72rem', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Food Intelligence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'none',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#ffffff' : '#dcfce7',
                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.22)' : 'transparent',
                    borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  })}
                  className="nav-link-item"
                >
                  <Icon size={19} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom Status Card */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.78rem',
              color: '#dcfce7',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
              <strong style={{ color: '#ffffff' }}>System Ready</strong>
            </div>
            <p style={{ margin: 0, opacity: 0.85 }}>Vision & Nutrition Engine active</p>
          </div>
        </div>
      </aside>
    </>
  );
}

