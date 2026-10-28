import React, { useState, useEffect } from 'react';
import { Menu, Database, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ onToggleSidebar, onToast }) {
  const [health, setHealth] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    api
      .getHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.error('Failed to load system health:', err));
  }, []);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await api.seedSampleData();
      onToast?.('Sample database successfully refreshed!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      onToast?.(`Seeding failed: ${err.message}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const isAiConfigured = health?.ai_configured;

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#1e293b',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          className="mobile-menu-trigger"
          title="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
            Multimodal Food Intelligence
          </span>
          <span
            style={{
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 600,
            }}
          >
            v1.0.0
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* AI Provider Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: isAiConfigured ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${isAiConfigured ? '#86efac' : '#e2e8f0'}`,
            fontSize: '0.8rem',
            fontWeight: 500,
            color: isAiConfigured ? '#15803d' : '#475569',
          }}
          title={isAiConfigured ? 'Connected to Google Gemini Vision API' : 'Using Local OpenCV & Heuristic CV Engine'}
        >
          <Sparkles size={14} style={{ color: isAiConfigured ? '#16a34a' : '#64748b' }} />
          <span>{isAiConfigured ? 'Gemini AI Vision' : 'OpenCV CV Engine'}</span>
        </div>

        {/* Seed Sample Data Button */}
        <button
          onClick={handleSeedData}
          disabled={seeding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 500,
            color: '#334155',
            cursor: seeding ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
          title="Reset and populate database with sample recipes, food scans, and inspections"
        >
          <Database size={15} />
          <span>{seeding ? 'Seeding...' : 'Load Demo Data'}</span>
        </button>

        {/* API Docs Link */}
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#166534',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(22, 101, 52, 0.2)',
          }}
        >
          <span>API Docs</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}

