/**
 * Formatter utilities for Looop UI
 */

export const formatSharingType = (type) => {
  switch (type?.toLowerCase()) {
    case 'give_away':
    case 'giveaway':
      return { label: 'Give Away', badgeVariant: 'success', color: '#10b981', description: 'Free handover' };
    case 'borrow':
      return { label: 'Borrow', badgeVariant: 'info', color: '#3b82f6', description: 'Temporary lend' };
    case 'exchange':
      return { label: 'Exchange', badgeVariant: 'warning', color: '#f59e0b', description: 'Item swap' };
    default:
      return { label: type || 'Share', badgeVariant: 'neutral', color: '#64748b', description: 'Community sharing' };
  }
};

export const formatCondition = (condition) => {
  switch (condition?.toLowerCase()) {
    case 'new':
      return { label: 'Brand New', badgeVariant: 'success' };
    case 'like_new':
      return { label: 'Like New', badgeVariant: 'info' };
    case 'good':
      return { label: 'Good Condition', badgeVariant: 'neutral' };
    case 'fair':
      return { label: 'Fair / Usable', badgeVariant: 'warning' };
    case 'needs_repair':
      return { label: 'Needs Repair', badgeVariant: 'danger' };
    default:
      return { label: condition || 'Used', badgeVariant: 'neutral' };
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const truncateText = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
