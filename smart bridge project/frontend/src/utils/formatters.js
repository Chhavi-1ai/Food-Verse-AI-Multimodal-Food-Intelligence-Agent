export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatCalories(val) {
  if (val === undefined || val === null) return '0 kcal';
  return `${Math.round(val)} kcal`;
}

export function getFreshnessBadge(status) {
  switch (status) {
    case 'Appears fresh':
      return {
        label: 'Appears Fresh',
        bg: '#dcfce7',
        color: '#15803d',
        border: '#86efac',
      };
    case 'Possible quality deterioration':
      return {
        label: 'Quality Deterioration',
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
      };
    case 'Visible spoilage indicators':
      return {
        label: 'Visible Spoilage',
        bg: '#fee2e2',
        color: '#b91c1c',
        border: '#fca5a5',
      };
    default:
      return {
        label: 'Unable to Determine',
        bg: '#f1f5f9',
        color: '#475569',
        border: '#cbd5e1',
      };
  }
}

export function getHygieneBadge(status, score) {
  if (status === 'Passed' || score >= 85) {
    return {
      label: 'Passed Audit',
      bg: '#dcfce7',
      color: '#15803d',
      border: '#86efac',
    };
  } else if (status === 'Needs Attention' || score >= 70) {
    return {
      label: 'Needs Attention',
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
    };
  } else {
    return {
      label: 'Critical Action Required',
      bg: '#fee2e2',
      color: '#b91c1c',
      border: '#fca5a5',
    };
  }
}

