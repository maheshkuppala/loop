/**
 * Live Community Impact Tracker
 * Manages platform-wide sustainability counts starting at zero and incrementing dynamically
 * as community items are reused, shared, borrowed, or exchanged.
 */

const STORAGE_KEY = 'looop_live_impact_metrics';

const INITIAL_METRICS = {
  itemsReused: 0,
  peopleHelped: 0,
  booksShared: 0,
  electronicsShared: 0,
  wasteAvoidedKg: 0
};

export const getLiveImpactMetrics = () => {
  if (typeof window === 'undefined') return INITIAL_METRICS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_METRICS;
    const parsed = JSON.parse(raw);
    return {
      itemsReused: Number(parsed.itemsReused) || 0,
      peopleHelped: Number(parsed.peopleHelped) || 0,
      booksShared: Number(parsed.booksShared) || 0,
      electronicsShared: Number(parsed.electronicsShared) || 0,
      wasteAvoidedKg: Number(parsed.wasteAvoidedKg) || 0
    };
  } catch {
    return INITIAL_METRICS;
  }
};

export const saveLiveImpactMetrics = (metrics) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    window.dispatchEvent(new CustomEvent('looop:impact_updated', { detail: metrics }));
  } catch (err) {
    console.error('Failed to save impact metrics:', err);
  }
};

/**
 * Record a new community sharing / reuse action to increase metrics
 * @param {Object} options - { category, quantity, type }
 */
export const recordImpactAction = ({ category = '', quantity = 1, type = 'reuse' } = {}) => {
  const current = getLiveImpactMetrics();
  const qty = Math.max(1, Number(quantity) || 1);
  const catLower = (category || '').toLowerCase();

  const isBook = catLower.includes('book') || catLower.includes('education') || catLower.includes('study');
  const isElectronics = catLower.includes('electronic') || catLower.includes('gadget') || catLower.includes('laptop');

  // Estimate ~3 kg solid waste diverted per reused item
  const wastePerItemKg = isElectronics ? 5 : isBook ? 2 : 3;

  const updated = {
    itemsReused: current.itemsReused + qty,
    peopleHelped: current.peopleHelped + 1,
    booksShared: current.booksShared + (isBook ? qty : 0),
    electronicsShared: current.electronicsShared + (isElectronics ? qty : 0),
    wasteAvoidedKg: current.wasteAvoidedKg + (qty * wastePerItemKg)
  };

  saveLiveImpactMetrics(updated);
  return updated;
};

export const resetImpactMetrics = () => {
  saveLiveImpactMetrics(INITIAL_METRICS);
  return INITIAL_METRICS;
};
