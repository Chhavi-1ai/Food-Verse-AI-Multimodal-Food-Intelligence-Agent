import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Camera,
  Sparkles,
  ShieldCheck,
  ChefHat,
  CalendarCheck,
  Flame,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { DailyProgressChart, MacroDoughnutChart } from '../components/NutritionChart';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getFreshnessBadge, getHygieneBadge } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const { onToast } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
      onToast?.(`Failed to load dashboard: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating multimodal food intelligence..." />;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: '#b91c1c' }}>Failed to load dashboard data</h3>
        <p style={{ color: '#64748b' }}>{error}</p>
        <button
          onClick={loadDashboard}
          style={{
            backgroundColor: '#166534',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const user = data?.user_profile || {};
  const nutrition = data?.daily_nutrition || {};
  const stats = data?.stats || {};
  const recentFood = data?.recent_food_analyses || [];
  const recentFresh = data?.recent_freshness_assessments || [];
  const recentHygiene = data?.recent_hygiene_inspections || [];
  const currentPlan = data?.current_meal_plan || {};

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(22, 101, 52, 0.25)',
        }}
        className="welcome-banner"
      >
        <div>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#86efac',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Multimodal Intelligence Hub
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '10px 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome back, {user.name}
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#dcfce7', maxWidth: '620px', lineHeight: 1.5 }}>
            Active diet profile: <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>{user.dietary_preference}</strong>. Daily target is {user.calorie_target} kcal with personalized safety guardrails.
          </p>
        </div>

        {/* Quick actions button group */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="banner-actions">
          <button
            onClick={() => navigate('/food-recognition')}
            style={{
              backgroundColor: '#22c55e',
              color: '#052e16',
              fontWeight: 600,
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            }}
          >
            <Camera size={18} />
            <span>Scan Food</span>
          </button>
          <button
            onClick={() => navigate('/freshness-detection')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 500,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={18} />
            <span>Check Freshness</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="Food Items Analyzed"
          value={stats.total_food_scanned || 0}
          icon={Camera}
          subtitle="Computer Vision Log"
          badge="Active"
        />
        <StatCard
          title="Produce Freshness Audits"
          value={stats.total_freshness_checked || 0}
          icon={Sparkles}
          subtitle="Spoilage Tracking"
          badge="CV Guard"
        />
        <StatCard
          title="Hygiene Inspections"
          value={stats.total_inspections || 0}
          icon={ShieldCheck}
          subtitle="Sanitation Checklists"
          badge="HACCP"
        />
        <StatCard
          title="Recipes in Catalog"
          value={stats.total_recipes_available || 0}
          icon={ChefHat}
          subtitle="With ingredient scaling"
          badge="Scaled"
        />
      </div>

      {/* Center Row: Today's Nutrition & Quick Module Jump */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* Daily Calorie & Nutrition Progress Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Today's Nutrition Summary
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Target: {nutrition.target_calories} kcal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              <DailyProgressChart
                consumed={nutrition.consumed_calories}
                target={nutrition.target_calories}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                  <span style={{ color: '#475569' }}>Protein</span>
                  <strong>{nutrition.consumed_protein_g}g / {user.protein_target_g}g</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      width: `${Math.min(100, Math.round((nutrition.consumed_protein_g / user.protein_target_g) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                  <span style={{ color: '#475569' }}>Carbs</span>
                  <strong>{nutrition.consumed_carbs_g}g / {user.carb_target_g}g</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#f59e0b',
                      width: `${Math.min(100, Math.round((nutrition.consumed_carbs_g / user.carb_target_g) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                  <span style={{ color: '#475569' }}>Fat</span>
                  <strong>{nutrition.consumed_fat_g}g / {user.fat_target_g}g</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: '#ef4444',
                      width: `${Math.min(100, Math.round((nutrition.consumed_fat_g / user.fat_target_g) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Meal Plan Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Upcoming Planned Meals
              </h3>
              <button
                onClick={() => navigate('/meal-planner')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              {currentPlan.title} ({currentPlan.meals_count} meals scheduled)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentPlan.upcoming_meals?.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>
                      {m.day_of_week} • {m.meal_type}
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                      {m.meal_name}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                    {Math.round(m.calories)} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/cooking-assistant')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                backgroundColor: '#166534',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              Start Cooking Assistant
            </button>
            <button
              onClick={() => navigate('/shopping-list')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #86efac',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              View Shopping List
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Food Analyses */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Food Analyses
            </h3>
            <button
              onClick={() => navigate('/food-recognition')}
              style={{
                background: 'none',
                border: 'none',
                color: '#16a34a',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Analyze New
            </button>
          </div>

          {recentFood.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '20px 0', textAlign: 'center' }}>
              No food analyses logged yet. Upload an image to start!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentFood.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    >
                      🍽️
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                        {item.food_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {item.portion_grams}g • Conf: {Math.round(item.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.88rem' }}>
                    {Math.round(item.calories)} kcal
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Freshness Assessments */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px -2px rgba(22, 101, 52, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Freshness Checks
            </h3>
            <button
              onClick={() => navigate('/freshness-detection')}
              style={{
                background: 'none',
                border: 'none',
                color: '#16a34a',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Scan Produce
            </button>
          </div>

          {recentFresh.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '20px 0', textAlign: 'center' }}>
              No freshness checks performed yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentFresh.map((f) => {
                const badge = getFreshnessBadge(f.visual_status);
                return (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                        {f.item_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {f.food_category} • {formatDate(f.created_at)}
                      </div>
                    </div>
                    <span
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <DisclaimerBanner type="warning" title="Multimodal AI Safety Notice">
        Visual analysis provides calculated approximations of nutrition and surface condition.
        It cannot verify microbiological food safety or detect invisible foodborne pathogens.
        Always follow proper food handling and storage protocols.
      </DisclaimerBanner>
    </div>
  );
}

