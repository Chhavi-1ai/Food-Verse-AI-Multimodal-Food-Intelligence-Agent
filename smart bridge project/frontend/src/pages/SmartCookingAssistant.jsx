import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ChefHat,
  Search,
  Plus,
  X,
  Clock,
  Users,
  CheckCircle2,
  Heart,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SmartCookingAssistant() {
  const { onToast } = useOutletContext() || {};

  // Ingredients matching mode
  const [pantryIngredients, setPantryIngredients] = useState(['chicken', 'olive oil', 'garlic', 'tomato']);
  const [ingredientInput, setIngredientInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Active cooking recipe state
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [servings, setServings] = useState(2);
  const [scaledRecipe, setScaledRecipe] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  // Built-in interactive timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins default
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState(300);

  useEffect(() => {
    handleFindRecipes();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      onToast?.('Cooking timer complete! Step finished.', 'success');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) return;
    if (!pantryIngredients.includes(ingredientInput.trim().toLowerCase())) {
      setPantryIngredients((prev) => [...prev, ingredientInput.trim().toLowerCase()]);
    }
    setIngredientInput('');
  };

  const handleRemoveIngredient = (item) => {
    setPantryIngredients((prev) => prev.filter((i) => i !== item));
  };

  const handleFindRecipes = async () => {
    try {
      setLoadingRecommendations(true);
      const matches = await api.recommendRecipes({
        available_ingredients: pantryIngredients,
      });
      setRecommendations(matches);
      if (matches.length > 0 && !activeRecipe) {
        selectRecipeForCooking(matches[0].recipe);
      }
    } catch (err) {
      onToast?.(`Failed to recommend recipes: ${err.message}`, 'error');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const selectRecipeForCooking = async (recipe) => {
    try {
      const data = await api.getRecipe(recipe.id, servings);
      setActiveRecipe(recipe);
      setScaledRecipe(data);
      setCompletedSteps({});
    } catch (err) {
      console.error('Failed to load recipe details:', err);
    }
  };

  const handleServingChange = async (newServings) => {
    const s = Math.max(1, Math.min(20, newServings));
    setServings(s);
    if (activeRecipe) {
      const data = await api.getRecipe(activeRecipe.id, s);
      setScaledRecipe(data);
    }
  };

  const handleToggleFavorite = async (recipeId) => {
    try {
      const res = await api.toggleFavoriteRecipe(recipeId);
      onToast?.(res.message, 'success');
      // Update local recommendation state
      setRecommendations((prev) =>
        prev.map((m) =>
          m.recipe.id === recipeId ? { ...m, recipe: { ...m.recipe, is_favorite: res.is_favorite } } : m
        )
      );
      if (scaledRecipe && scaledRecipe.recipe_id === recipeId) {
        setScaledRecipe((prev) => ({ ...prev, is_favorite: res.is_favorite }));
      }
    } catch (err) {
      onToast?.(`Favorite toggle failed: ${err.message}`, 'error');
    }
  };

  const toggleStepCompleted = (index) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const startTimerForMinutes = (mins) => {
    const secs = mins * 60;
    setTimerInitial(secs);
    setTimerSeconds(secs);
    setTimerRunning(true);
  };

  const formatTimerDisplay = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Smart Cooking Assistant
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Interactive cooking companion with ingredient match recommendations, dynamic serving scaling, step timers, and substitutions.
        </p>
      </div>

      {/* Pantry Search Input Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
          marginBottom: '28px',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>
          Cook With What You Have
        </span>
        <h3 style={{ margin: '4px 0 12px 0', fontSize: '1.1rem', color: '#0f172a' }}>
          Enter Ingredients In Your Kitchen:
        </h3>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <input
            type="text"
            placeholder="e.g. spinach, salmon, rice, onions, tomatoes..."
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddIngredient();
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
            }}
          />
          <button
            onClick={handleAddIngredient}
            style={{
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
          <button
            onClick={handleFindRecipes}
            style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.2)',
            }}
          >
            <Sparkles size={16} />
            <span>Find Matching Recipes</span>
          </button>
        </div>

        {/* Selected ingredients pill list */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {pantryIngredients.map((item) => (
            <span
              key={item}
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{item}</span>
              <button
                onClick={() => handleRemoveIngredient(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#166534',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Main Layout: Left Recommendations List | Right Interactive Cooking View */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px' }} className="cooking-assistant-grid">
        {/* Left Column: Recommendations */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
            Recommended Matches ({recommendations.length})
          </h3>

          {loadingRecommendations ? (
            <LoadingSpinner message="Calculating ingredient match percentages..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendations.map((m) => {
                const isSelected = activeRecipe?.id === m.recipe.id;
                return (
                  <div
                    key={m.recipe.id}
                    onClick={() => selectRecipeForCooking(m.recipe)}
                    style={{
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                      borderRadius: '12px',
                      padding: '16px',
                      border: `2px solid ${isSelected ? '#22c55e' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                    className="recipe-match-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          backgroundColor: m.match_percentage >= 50 ? '#dcfce7' : '#fef3c7',
                          color: m.match_percentage >= 50 ? '#15803d' : '#b45309',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {m.match_percentage}% MATCH
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(m.recipe.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.recipe.is_favorite ? '#ef4444' : '#cbd5e1' }}
                      >
                        <Heart size={18} fill={m.recipe.is_favorite ? '#ef4444' : 'none'} />
                      </button>
                    </div>

                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#1e293b' }}>
                      {m.recipe.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {m.recipe.prep_time_minutes + m.recipe.cook_time_minutes} min
                      </span>
                      <span>{Math.round(m.recipe.calories_per_serving)} kcal</span>
                    </div>

                    {/* Matched vs Missing Tags */}
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Have: </span>
                      {m.matching_ingredients.slice(0, 3).join(', ') || 'None'}
                      {m.matching_ingredients.length > 3 && ` +${m.matching_ingredients.length - 3} more`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Step-by-Step Cooking Workspace */}
        {scaledRecipe ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
            }}
          >
            {/* Recipe Header & Servings Multiplier */}
            <div
              style={{
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {scaledRecipe.cuisine} • {scaledRecipe.meal_type}
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 6px 0' }}>
                  {scaledRecipe.title}
                </h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={15} /> Prep: {scaledRecipe.prep_time_minutes}m | Cook: {scaledRecipe.cook_time_minutes}m
                  </span>
                  <span>{scaledRecipe.calories_per_serving} kcal / serving</span>
                </div>
              </div>

              {/* Servings Multiplier Controller */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Users size={16} />
                  <span>Servings:</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleServingChange(servings - 1)}
                    disabled={servings <= 1}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center', color: '#166534' }}>
                    {servings}
                  </span>
                  <button
                    onClick={() => handleServingChange(servings + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Cooking Timer Widget */}
            <div
              style={{
                backgroundColor: '#164620',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Timer size={24} style={{ color: '#22c55e' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 600 }}>
                    Step Countdown Timer
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1 }}>
                    {formatTimerDisplay(timerSeconds)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setTimerRunning((prev) => !prev)}
                  style={{
                    backgroundColor: timerRunning ? '#f59e0b' : '#22c55e',
                    color: '#052e16',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {timerRunning ? <Pause size={15} /> : <Play size={15} />}
                  <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(timerInitial);
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  title="Reset Timer"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => startTimerForMinutes(5)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  5m
                </button>
                <button
                  onClick={() => startTimerForMinutes(15)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  15m
                </button>
              </div>
            </div>

            {/* Scaled Ingredients List */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                Ingredients (Scaled for {servings} {servings === 1 ? 'serving' : 'servings'}):
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {scaledRecipe.ingredients?.map((ing, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                      {ing.name}
                    </span>
                    <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                      {ing.amount} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitutions Table */}
            {scaledRecipe.substitutions && Object.keys(scaledRecipe.substitutions).length > 0 && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #86efac',
                  marginBottom: '24px',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#15803d', fontWeight: 700 }}>
                  Smart Ingredient Substitutions:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: '#166534' }}>
                  {Object.entries(scaledRecipe.substitutions).map(([orig, alts]) => (
                    <div key={orig}>
                      <strong>{orig}</strong> ➔ swap with: {alts.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Step-by-Step Instructions */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                Step-by-Step Preparation:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scaledRecipe.instructions?.map((stepText, idx) => {
                  const isDone = completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStepCompleted(idx)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        backgroundColor: isDone ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${isDone ? '#86efac' : '#e2e8f0'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '999px',
                          backgroundColor: isDone ? '#22c55e' : '#cbd5e1',
                          color: isDone ? '#052e16' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: isDone ? '#166534' : '#334155',
                          textDecoration: isDone ? 'line-through' : 'none',
                          lineHeight: 1.5,
                        }}
                      >
                        {stepText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Food Safety Reminders */}
            {scaledRecipe.food_safety_reminders?.length > 0 && (
              <DisclaimerBanner type="warning" title="Essential Food Handling & Safety Checklist">
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {scaledRecipe.food_safety_reminders.map((rem, i) => (
                    <li key={i}>{rem}</li>
                  ))}
                </ul>
              </DisclaimerBanner>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <ChefHat size={48} style={{ margin: '0 auto 12px auto' }} />
            <p>Select a recipe on the left to activate the interactive cooking assistant.</p>
          </div>
        )}
      </div>
    </div>
  );
}

