import React from 'react';
import { X } from 'lucide-react';
import {
  CATEGORIES,
  SHARING_TYPES,
  CONDITIONS,
  DISTANCE_OPTIONS
} from '../../constants/categories';

export const ActiveFilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
  const {
    search,
    category,
    sharingType,
    condition,
    distance
  } = filters;

  const chips = [];

  // Search keyword chip
  if (search && search.trim()) {
    chips.push({
      key: 'search',
      label: `"${search.trim()}"`,
      type: 'search'
    });
  }

  // Category chip
  if (category && category !== 'all') {
    const catObj = CATEGORIES.find((c) => c.id === category);
    chips.push({
      key: 'category',
      label: catObj ? catObj.name : category,
      type: 'category'
    });
  }

  // Sharing type chip
  if (sharingType && sharingType !== 'all') {
    const typeObj = SHARING_TYPES.find((t) => t.id === sharingType);
    chips.push({
      key: 'sharingType',
      label: typeObj ? typeObj.label : sharingType,
      type: 'sharingType'
    });
  }

  // Condition chip
  if (condition && condition !== 'all') {
    const condObj = CONDITIONS.find((c) => c.id === condition);
    chips.push({
      key: 'condition',
      label: condObj ? condObj.label : condition,
      type: 'condition'
    });
  }

  // Distance chip
  if (distance && distance !== 'all') {
    const distObj = DISTANCE_OPTIONS.find((d) => d.id === distance);
    chips.push({
      key: 'distance',
      label: distObj ? distObj.label : `${distance} km`,
      type: 'distance'
    });
  }

  if (chips.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '1rem'
      }}
      className="active-filter-chips"
    >
      <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', fontWeight: 600 }}>
        Active filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
          className="active-chip"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key)}
            aria-label={`Remove filter ${chip.label}`}
            style={{
              background: 'none',
              border: 'none',
              color: '#047857',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1px',
              borderRadius: '50%'
            }}
            className="chip-remove-btn"
          >
            <X size={13} />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '0.8rem',
          color: 'var(--color-primary-700)',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '3px 6px',
          textDecoration: 'underline'
        }}
        className="clear-all-chips-btn"
      >
        Clear All
      </button>

      <style>{`
        .chip-remove-btn:hover {
          background-color: rgba(6, 78, 59, 0.15);
        }
      `}</style>
    </div>
  );
};

export default ActiveFilterChips;
