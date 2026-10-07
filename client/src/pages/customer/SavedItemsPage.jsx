import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Search,
  RotateCcw,
  Compass,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import ItemCard from '../../components/common/ItemCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import SavedItemsSkeleton from '../../components/saved/SavedItemsSkeleton';
import savedItemService from '../../services/savedItemService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home-kitchen', label: 'Home & Kitchen' },
  { value: 'sports-outdoors', label: 'Sports & Outdoors' },
  { value: 'tools-diy', label: 'Tools & DIY' },
  { value: 'toys-games', label: 'Toys & Games' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' }
];

const SHARING_TYPES = [
  { value: 'all', label: 'All Sharing Types' },
  { value: 'borrow', label: 'Lending / Borrowing' },
  { value: 'giveaway', label: 'Free Giveaway' },
  { value: 'exchange', label: 'Direct Exchange' }
];

const CONDITIONS = [
  { value: 'all', label: 'All Conditions' },
  { value: 'brand-new', label: 'Brand New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' }
];

const AVAILABILITIES = [
  { value: 'all', label: 'All Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'unavailable', label: 'Unavailable / Reserved' }
];

const SORT_OPTIONS = [
  { value: 'recently_saved', label: 'Recently Saved' },
  { value: 'newest', label: 'Newest Listed' },
  { value: 'oldest', label: 'Oldest Listed' },
  { value: 'alphabetical', label: 'Title (A - Z)' }
];

export const SavedItemsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  // URL search parameter states
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const sharingTypeParam = searchParams.get('sharingType') || 'all';
  const conditionParam = searchParams.get('condition') || 'all';
  const availabilityParam = searchParams.get('availability') || 'all';
  const sortParam = searchParams.get('sort') || 'recently_saved';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceTimerRef = useRef(null);

  // Data state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-item loading state for unsave operations
  const [savingItemIds, setSavingItemIds] = useState(new Set());

  // Check if any filters are active
  const hasActiveFilters =
    Boolean(searchParam) ||
    categoryParam !== 'all' ||
    sharingTypeParam !== 'all' ||
    conditionParam !== 'all' ||
    availabilityParam !== 'all';

  // 1. Auth Guard: Ensure only authenticated users access saved items
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=%2Fsaved', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Synchronize searchInput when URL param changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // 2. Fetch saved items from backend
  const fetchSavedItems = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const data = await savedItemService.getSavedItems({
        search: searchParam,
        category: categoryParam,
        sharingType: sharingTypeParam,
        condition: conditionParam,
        availability: availabilityParam,
        sort: sortParam,
        page: pageParam,
        limit: 12
      });

      if (data.success) {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.message || 'Unable to load saved items.');
      }
    } catch (err) {
      console.error('Fetch saved items failed:', err);
      setError('A network error occurred while loading your saved items.');
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    searchParam,
    categoryParam,
    sharingTypeParam,
    conditionParam,
    availabilityParam,
    sortParam,
    pageParam
  ]);

  useEffect(() => {
    fetchSavedItems();
  }, [fetchSavedItems]);

  // 3. URL Parameter Helpers
  const updateUrlParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'all') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset to page 1 whenever filters or search change (unless updating page itself)
    if (!updates.page && updates.page !== 0) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  // Debounced Search Handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateUrlParams({ search: val.trim() });
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateUrlParams({ search: '' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  // 4. Handle Item Unsave / Save Toggle
  const handleSaveToggle = async (itemId, isSaved) => {
    // If next state is false, user is unsaving from this page
    if (!isSaved) {
      const targetItem = items.find((i) => (i.id || i._id) === itemId);
      if (!targetItem) return;

      // Optimistic removal
      setSavingItemIds((prev) => new Set(prev).add(itemId));
      setItems((prev) => prev.filter((i) => (i.id || i._id) !== itemId));
      setTotal((prev) => Math.max(0, prev - 1));

      try {
        const result = await savedItemService.unsaveItem(itemId);
        if (result.success) {
          addToast({
            title: 'Removed from Saved Items',
            message: `"${targetItem.title}" has been removed from your saved bookmarks.`,
            variant: 'info'
          });
        } else {
          throw new Error(result.message || 'Unsave failed');
        }
      } catch (err) {
        console.error('Failed to unsave item:', err);
        // Rollback optimistic removal
        setItems((prev) => [targetItem, ...prev]);
        setTotal((prev) => prev + 1);
        addToast({
          title: 'Action Failed',
          message: 'Could not remove this item. Please try again.',
          variant: 'danger'
        });
      } finally {
        setSavingItemIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    } else {
      // Re-save (rare in this page, but supported)
      setSavingItemIds((prev) => new Set(prev).add(itemId));
      try {
        await savedItemService.saveItem(itemId);
        addToast({
          title: 'Item Saved',
          message: 'Item re-added to your saved list.',
          variant: 'success'
        });
      } catch (err) {
        console.error('Re-save failed:', err);
      } finally {
        setSavingItemIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    }
  };

  // Page Switch Handler
  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* 1. PAGE HEADER */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--color-slate-200)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Saved Items
            </h1>
            {!loading && (
              <Badge variant="primary" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                {total} {total === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', margin: 0, maxWidth: '640px' }}>
            Your personal bookmark collection of circular sharing listings to borrow, request, or keep an eye on.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/browse" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" iconLeft={Compass} iconRight={ArrowRight}>
              Browse Items
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-slate-200)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'space-between'
          }}
        >
          {/* Keyword Search Input */}
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '420px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-slate-400)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search saved items by keyword, brand..."
              style={{
                width: '100%',
                padding: '9px 36px 9px 40px',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#f8fafc',
                color: 'var(--color-slate-900)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
              className="saved-search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-slate-400)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Filters Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            {/* Category Select */}
            <select
              value={categoryParam}
              onChange={(e) => updateUrlParams({ category: e.target.value })}
              aria-label="Filter by category"
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                cursor: 'pointer',
                fontWeight: 500,
                outline: 'none'
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sharing Type Select */}
            <select
              value={sharingTypeParam}
              onChange={(e) => updateUrlParams({ sharingType: e.target.value })}
              aria-label="Filter by sharing type"
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                cursor: 'pointer',
                fontWeight: 500,
                outline: 'none'
              }}
            >
              {SHARING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Availability Select */}
            <select
              value={availabilityParam}
              onChange={(e) => updateUrlParams({ availability: e.target.value })}
              aria-label="Filter by availability"
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                cursor: 'pointer',
                fontWeight: 500,
                outline: 'none'
              }}
            >
              {AVAILABILITIES.map((avail) => (
                <option key={avail.value} value={avail.value}>
                  {avail.label}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortParam}
              onChange={(e) => updateUrlParams({ sort: e.target.value })}
              aria-label="Sort items"
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                cursor: 'pointer',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid var(--color-slate-100)',
              fontSize: '0.825rem',
              color: 'var(--color-slate-600)'
            }}
          >
            <span>
              Showing filtered results ({items.length} of {total} saved)
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-700)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT: SKELETON / ERROR / ITEMS GRID / EMPTY STATE */}
      {loading ? (
        <SavedItemsSkeleton />
      ) : error ? (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertCircle size={32} color="#dc2626" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>
            Unable to Load Saved Items
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#7f1d1d', margin: 0, maxWidth: '480px' }}>
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={fetchSavedItems} style={{ marginTop: '8px' }}>
            Try Again
          </Button>
        </div>
      ) : total === 0 && !hasActiveFilters ? (
        /* Empty State: Zero items saved anywhere */
        <EmptyState
          icon={Bookmark}
          title="No saved items yet"
          description="When you discover useful tools, sports gear, kitchen items, or books you might want to borrow, request, or keep an eye on, tap the heart bookmark icon to save them here."
          actionText="Explore Available Items"
          actionLink="/browse"
        />
      ) : items.length === 0 && hasActiveFilters ? (
        /* Empty State: Zero matches for active filters */
        <EmptyState
          icon={Search}
          title="No matching saved items"
          description={`No items in your saved bookmarks match your search or selected filter options.`}
          actionText="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        /* 4. ITEMS GRID */
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {items.map((item) => {
              const itemId = item.id || item._id;
              const isItemSaving = savingItemIds.has(itemId);

              return (
                <div key={itemId} style={{ position: 'relative' }}>
                  <ItemCard
                    item={item}
                    isSaved={true}
                    isSaving={isItemSaving}
                    onSaveToggle={handleSaveToggle}
                  />
                </div>
              );
            })}
          </div>

          {/* 5. PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-slate-200)'
              }}
            >
              <Button
                variant="outline"
                size="sm"
                iconLeft={ChevronLeft}
                disabled={pageParam <= 1}
                onClick={() => handlePageChange(pageParam - 1)}
              >
                Previous
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 8px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      border: p === pageParam ? 'none' : '1px solid var(--color-slate-200)',
                      backgroundColor: p === pageParam ? 'var(--color-primary-600)' : '#ffffff',
                      color: p === pageParam ? '#ffffff' : 'var(--color-slate-700)',
                      fontWeight: p === pageParam ? 700 : 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                iconRight={ChevronRight}
                disabled={pageParam >= totalPages}
                onClick={() => handlePageChange(pageParam + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Embedded CSS for responsive interaction */}
      <style>{`
        .saved-search-input:focus {
          border-color: var(--color-primary-500) !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default SavedItemsPage;
