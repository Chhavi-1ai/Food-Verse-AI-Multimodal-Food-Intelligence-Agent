import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Pantry', 'Bakery', 'Spices & Condiments', 'General Groceries'];

export default function ShoppingList() {
  const { onToast } = useOutletContext() || {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New item form
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('items');

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const data = await api.getShoppingList();
      setItems(data);
    } catch (err) {
      console.error('Failed to load shopping list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (id) => {
    try {
      const res = await api.toggleShoppingItem(id);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_purchased: res.is_purchased } : item))
      );
    } catch (err) {
      onToast?.(`Failed to update item: ${err.message}`, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deleteShoppingItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      onToast?.('Item removed', 'info');
    } catch (err) {
      onToast?.(`Failed to delete: ${err.message}`, 'error');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      const newItem = await api.addShoppingItem({
        item_name: itemName.trim(),
        category,
        quantity: Number(quantity) || 1,
        unit,
      });
      setItems((prev) => [...prev, newItem]);
      setItemName('');
      onToast?.(`Added "${newItem.item_name}" to shopping list`, 'success');
    } catch (err) {
      onToast?.(`Failed to add item: ${err.message}`, 'error');
    }
  };

  // Group items by category
  const grouped = {};
  items.forEach((item) => {
    const cat = item.category || 'General Groceries';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const purchasedCount = items.filter((i) => i.is_purchased).length;
  const progressPercent = items.length > 0 ? Math.round((purchasedCount / items.length) * 100) : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Smart Grocery Shopping List
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Consolidated ingredients generated from planned recipes and manual kitchen grocery needs.
        </p>
      </div>

      {/* Progress & Add Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(22, 101, 52, 0.06)',
          marginBottom: '28px',
        }}
      >
        {/* Progress Strip */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
              Purchased Items ({purchasedCount} of {items.length})
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#15803d' }}>
              {progressPercent}% Complete
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#16a34a',
                width: `${progressPercent}%`,
                transition: 'width 0.25s ease',
              }}
            />
          </div>
        </div>

        {/* Add custom item form */}
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Add grocery item (e.g., Almond milk, olive oil)..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={{
              flex: 2,
              minWidth: '200px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0.1"
            step="0.5"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              width: '70px',
              padding: '10px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}
          />
          <input
            type="text"
            placeholder="Unit (items, g, tbsp)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{
              width: '110px',
              padding: '10px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </form>
      </div>

      {/* Grouped Shopping Items */}
      {loading ? (
        <LoadingSpinner message="Loading groceries..." />
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <ShoppingCart size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#334155' }}>Your Shopping List is Empty</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Generate items from your meal plan or use the form above to add kitchen essentials.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(grouped).map(([catName, catItems]) => (
            <div
              key={catName}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>
                {catName} ({catItems.length})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: item.is_purchased ? '#f1f5f9' : '#f8fafc',
                      border: `1px solid ${item.is_purchased ? '#e2e8f0' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          backgroundColor: item.is_purchased ? '#16a34a' : '#ffffff',
                          border: `2px solid ${item.is_purchased ? '#16a34a' : '#94a3b8'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        {item.is_purchased && <Check size={14} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: item.is_purchased ? '#94a3b8' : '#1e293b',
                          textDecoration: item.is_purchased ? 'line-through' : 'none',
                        }}
                      >
                        {item.item_name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Delete item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

