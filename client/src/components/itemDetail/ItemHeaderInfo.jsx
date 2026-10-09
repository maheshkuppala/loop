import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ShieldCheck,
  Tag,
  Sparkles
} from 'lucide-react';
import { formatSharingType, formatCondition, formatDate, formatLocation } from '../../utils/formatters';
import Badge from '../common/Badge';

export const ItemHeaderInfo = ({ item }) => {
  const navigate = useNavigate();

  if (!item) return null;

  const sharingInfo = formatSharingType(item.sharingType);
  const conditionInfo = formatCondition(item.condition);

  // Status mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success">Available</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Request Pending</Badge>;
      case 'RESERVED':
        return <Badge variant="info">Reserved</Badge>;
      case 'UNAVAILABLE':
      case 'COMPLETED':
        return <Badge variant="neutral">Completed / Handed Over</Badge>;
      default:
        return <Badge variant="success">Available</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Breadcrumb & Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--color-slate-500)' }}>
          <Link
            to="/browse"
            style={{ color: 'var(--color-primary-700)', textDecoration: 'none', fontWeight: 600 }}
            className="breadcrumb-link"
          >
            Browse Items
          </Link>
          <ChevronRight size={14} color="var(--color-slate-400)" />

          <Link
            to={`/browse?category=${item.category}`}
            style={{ color: 'var(--color-primary-700)', textDecoration: 'none', fontWeight: 600, textTransform: 'capitalize' }}
            className="breadcrumb-link"
          >
            {item.category}
          </Link>
          <ChevronRight size={14} color="var(--color-slate-400)" />

          <span style={{ color: 'var(--color-slate-800)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
            {item.title}
          </span>
        </nav>

        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/browse');
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-slate-600)',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)'
          }}
          className="back-btn-subtle"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* 2. Key Attribute Badges Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Sharing Type Pill with custom styling */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor:
              item.sharingType === 'give_away'
                ? '#ecfdf5'
                : item.sharingType === 'borrow'
                ? '#eff6ff'
                : '#fef3c7',
            color:
              item.sharingType === 'give_away'
                ? '#047857'
                : item.sharingType === 'borrow'
                ? '#1d4ed8'
                : '#b45309',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            border:
              item.sharingType === 'give_away'
                ? '1px solid #a7f3d0'
                : item.sharingType === 'borrow'
                ? '1px solid #bfdbfe'
                : '1px solid #fde68a'
          }}
        >
          <Sparkles size={12} />
          <span>{sharingInfo.label}</span>
        </span>

        {/* Condition Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-slate-100)',
            color: 'var(--color-slate-700)',
            fontSize: '0.78rem',
            fontWeight: 600,
            border: '1px solid var(--color-slate-200)'
          }}
        >
          <Tag size={12} color="var(--color-slate-500)" />
          <span>Condition: {conditionInfo.label}</span>
        </span>

        {/* Status Badge */}
        {getStatusBadge(item.status)}
      </div>

      {/* 3. Main Title */}
      <h1
        style={{
          fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)',
          fontWeight: 900,
          color: 'var(--color-slate-900)',
          lineHeight: 1.2,
          margin: 0,
          letterSpacing: '-0.025em'
        }}
      >
        {item.title}
      </h1>

      {/* 4. Sub-metadata: Location, Distance, and Date Posted */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          fontSize: '0.875rem',
          color: 'var(--color-slate-600)',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-slate-200)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MapPin size={16} color="#059669" />
          <span>{formatLocation(item.location)}</span>
        </span>

        <span>•</span>

        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-slate-500)' }}>
          <Clock size={15} />
          <span>Listed {formatDate(item.createdAt)}</span>
        </span>
      </div>

      <style>{`
        .breadcrumb-link:hover {
          text-decoration: underline;
        }
        .back-btn-subtle:hover {
          color: var(--color-slate-900);
          background-color: var(--color-slate-100);
        }
      `}</style>
    </div>
  );
};

export default ItemHeaderInfo;
