import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function MacroDoughnutChart({ protein = 0, carbs = 0, fat = 0, fiber = 0 }) {
  const total = protein + carbs + fat + fiber;

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.9rem' }}>
        No macronutrient data to display.
      </div>
    );
  }

  const data = {
    labels: ['Protein (g)', 'Carbohydrates (g)', 'Fat (g)', 'Dietary Fiber (g)'],
    datasets: [
      {
        data: [protein, carbs, fat, fiber],
        backgroundColor: [
          '#3b82f6', // Protein: Blue
          '#f59e0b', // Carbs: Amber
          '#ef4444', // Fat: Crimson
          '#10b981', // Fiber: Emerald Green
        ],
        hoverBackgroundColor: ['#2563eb', '#d97706', '#dc2626', '#059669'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 16,
          font: { size: 12, family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = Math.round((val / total) * 100);
            return ` ${context.label}: ${val}g (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function DailyProgressChart({ consumed = 0, target = 2000 }) {
  const remaining = Math.max(0, target - consumed);
  const percent = Math.min(100, Math.round((consumed / target) * 100));

  const data = {
    labels: ['Consumed', 'Remaining'],
    datasets: [
      {
        data: [consumed, remaining],
        backgroundColor: ['#16a34a', '#e2e8f0'],
        hoverBackgroundColor: ['#15803d', '#cbd5e1'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${Math.round(context.raw)} kcal`,
        },
      },
    },
    cutout: '76%',
  };

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
          {percent}%
        </span>
        <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
          of Target
        </span>
      </div>
    </div>
  );
}

