import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Clock,
  Heart,
  Users,
  ChefHat,
  Filter,
  CheckCircle,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RecipeCollection() {
  const { onToast } = useOutletContext() || {};
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [selectedDietaryTag, setSelectedDietaryTag] = useState('All');

  // Modal detail state
  const [activeModalRecipe, setActiveModalRecipe] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, [searchQuery, selectedMealType, selectedDietaryTag]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedMealType !== 'All') params.meal_type = selectedMealType;
      if (selectedDietaryTag !== 'All') params.dietary_tag = selectedDietaryTag;

      const data = await api.getRecipes(params);
      setRecipes(data);
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (recipeId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleFavoriteRecipe(recipeId);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, is_favorite: res.is_favorite } : r))
      );
      if (activeModalRecipe && activeModalRecipe.id === recipeId) {
        setActiveModalRecipe((prev) => ({ ...prev, is_favorite: res.is_favorite }));
      }
      onToast?.(res.message, 'success');
    } catch (err) {
      onToast?.(`Favorite toggle failed: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Culinary Recipe Collection
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Nutritionally balanced, chef-tested recipes with dynamic serving scaling and food safety directives.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search recipes, ingredients, or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Meal Type Pill Group */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Breakfast', 'Lunch', 'Dinner'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              style={{
                backgroundColor: selectedMealType === type ? '#166534' : '#f8fafc',
                color: selectedMealType === type ? '#ffffff' : '#475569',
                border: `1px solid ${selectedMealType === type ? '#166534' : '#e2e8f0'}`,
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Dietary Tag Pill Group */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Vegetarian', 'Vegan', 'High Protein', 'Gluten-Free'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedDietaryTag(tag)}
              style={{
                backgroundColor: selectedDietaryTag === tag ? '#22c55e' : '#f8fafc',
                color: selectedDietaryTag === tag ? '#052e16' : '#475569',
                border: `1px solid ${selectedDietaryTag === tag ? '#22c55e' : '#e2e8f0'}`,
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <LoadingSpinner message="Loading culinary collection..." />
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <BookOpen size={36} style={{ margin: '0 auto 10px auto' }} />
          <p>No recipes matching your selected filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {recipes.map((r) => (
            <div
              key={r.id}
              onClick={() => setActiveModalRecipe(r)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              className="recipe-grid-card hover-card"
            >
              <div>
                {/* Image Thumbnail */}
                <div style={{ position: 'relative', height: '170px', backgroundColor: '#e2e8f0' }}>
                  <img
                    src={r.image_url}
                    alt={r.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => handleToggleFavorite(r.id, e)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '999px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Heart size={16} fill={r.is_favorite ? '#ef4444' : 'none'} color={r.is_favorite ? '#ef4444' : '#64748b'} />
                  </button>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    {r.cuisine} • {r.meal_type}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.08rem', fontWeight: 700, color: '#0f172a' }}>
                    {r.title}
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.4, height: '40px', overflow: 'hidden' }}>
                    {r.description}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {r.prep_time_minutes + r.cook_time_minutes} min
                    </span>
                    <span>{Math.round(r.calories_per_serving)} kcal</span>
                    <span>{r.protein_g}g Protein</span>
                  </div>
                </div>
              </div>

              {/* Dietary Tags footer */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {r.dietary_tags?.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {activeModalRecipe && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>
                  {activeModalRecipe.cuisine} • {activeModalRecipe.meal_type}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {activeModalRecipe.title}
                </h2>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.84rem', color: '#64748b' }}>
                  <span>Prep: {activeModalRecipe.prep_time_minutes}m</span>
                  <span>Cook: {activeModalRecipe.cook_time_minutes}m</span>
                  <span>{Math.round(activeModalRecipe.calories_per_serving)} kcal / serving</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRecipe(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '20px' }}>
              {activeModalRecipe.description}
            </p>

            {/* Ingredients */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                Ingredients:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                {activeModalRecipe.ingredients?.map((ing, i) => (
                  <li key={i}>
                    <strong>{ing.amount} {ing.unit}</strong> {ing.name} {ing.notes && `(${ing.notes})`}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                Step-by-step Instructions:
              </h4>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                {activeModalRecipe.instructions?.map((step, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{step}</li>
                ))}
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setActiveModalRecipe(null);
                  navigate('/cooking-assistant');
                }}
                style={{
                  backgroundColor: '#166534',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Open in Cooking Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

