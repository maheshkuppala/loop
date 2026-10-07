import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  Package,
  PackageOpen,
  RefreshCw,
  X,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { MyItemsSummaryCards } from '../../components/my-items/MyItemsSummaryCards';
import { MyItemManagementCard } from '../../components/my-items/MyItemManagementCard';
import { RemoveItemModal } from '../../components/my-items/RemoveItemModal';
import { MyItemsSkeleton } from '../../components/my-items/MyItemsSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { itemService } from '../../services/itemService';
import { CATEGORIES, SHARING_TYPES, CONDITIONS } from '../../constants/categories';

export const MyItemsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, token } = useAuth();
  const { addToast } = useToast();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated && !user && !token && !localStorage.getItem('looop_token')) {
      navigate('/login?redirect=%2Fmy-items', { replace: true });
    }
  }, [isAuthenticated, user, token, navigate]);

  // 1. URL State Parsing
  const searchQueryParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || 'all';
  const categoryParam = searchParams.get('category') || 'all';
  const sharingTypeParam = searchParams.get('sharingType') || 'all';
  const conditionParam = searchParams.get('condition') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState(searchQueryParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Data states
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, available: 0, pending: 0, borrowed: 0, completed: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action states
  const [togglingItemId, setTogglingItemId] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile filters toggle
  const [showFilters, setShowFilters] = useState(false);

  // Update URL Query params cleanly
  const updateUrlParams = useCallback(
    (newParams) => {
      const updated = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || (key === 'page' && value === 1)) {
          updated.delete(key);
        } else {
          updated.set(key, value);
        }
      });
      setSearchParams(updated);
    },
    [searchParams, setSearchParams]
  );

  // Synchronize debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== searchQueryParam) {
      updateUrlParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, searchQueryParam, updateUrlParams]);

  // Fetch summary statistics
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await itemService.getMyItemsSummary();
      if (res && res.success && res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching items summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch user listings with filters
  const fetchMyItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await itemService.getMyItems({
        search: searchQueryParam,
        status: statusParam,
        category: categoryParam,
        sharingType: sharingTypeParam,
        condition: conditionParam,
        sort: sortParam,
        page: pageParam,
        limit: 10
      });

      if (res && res.success) {
        setItems(res.items || []);
        setTotalItems(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        throw new Error(res?.message || 'Failed to load your items.');
      }
    } catch (err) {
      console.error('Error fetching my items:', err);
      setError('Unable to load your items right now.');
    } finally {
      setLoading(false);
    }
  }, [searchQueryParam, statusParam, categoryParam, sharingTypeParam, conditionParam, sortParam, pageParam]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  // Toggle Item Availability
  const handleToggleAvailability = async (id, newAvailability) => {
    setTogglingItemId(id);
    try {
      const res = await itemService.updateItemAvailability(id, newAvailability);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id ? { ...item, availability: newAvailability } : item
          )
        );
        addToast({
          title: 'Availability Updated',
          message: `Item marked as ${newAvailability.toLowerCase()}.`,
          variant: 'success'
        });
        fetchSummary();
      } else {
        throw new Error(res?.message || 'Failed to update availability.');
      }
    } catch (err) {
      addToast({
        title: 'Update Failed',
        message: 'Could not update item availability right now.',
        variant: 'danger'
      });
    } finally {
      setTogglingItemId(null);
    }
  };

  // Confirm and Execute Soft Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const itemId = deletingItem._id || deletingItem.id;
    setIsDeleting(true);

    try {
      const res = await itemService.deleteItem(itemId);
      if (res && res.success) {
        setItems((prev) => prev.filter((i) => (i._id || i.id) !== itemId));
        setTotalItems((prev) => Math.max(0, prev - 1));
        addToast({
          title: 'Item Removed',
          message: `"${deletingItem.title}" has been removed from active discovery.`,
          variant: 'info'
        });
        setDeletingItem(null);
        fetchSummary();
      } else {
        throw new Error(res?.message || 'Failed to remove listing.');
      }
    } catch (err) {
      addToast({
        title: 'Removal Failed',
        message: 'Could not remove item listing right now.',
        variant: 'danger'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Filter tabs definitions
  const filterTabs = [
    { id: 'all', label: 'All Items' },
    { id: 'available', label: 'Available' },
    { id: 'pending', label: 'Pending' },
    { id: 'borrowed', label: 'Borrowed' },
    { id: 'completed', label: 'Completed' },
    { id: 'unavailable', label: 'Unavailable' }
  ];

  const hasActiveFilters =
    searchQueryParam ||
    statusParam !== 'all' ||
    categoryParam !== 'all' ||
    sharingTypeParam !== 'all' ||
    conditionParam !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. PAGE HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--color-slate-900)', margin: 0 }}>
              My Items
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              Personal Listings
            </span>
          </div>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.925rem', margin: 0 }}>
            Manage the things you’ve shared with the LOOOP community.
          </p>
        </div>

        {/* Prominent Share an Item CTA */}
        <Link to="/share" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" iconLeft={PlusCircle}>
            Share an Item
          </Button>
        </Link>
      </div>

      {/* 2. SUMMARY STATISTICS CARDS */}
      <MyItemsSummaryCards summary={summary} loading={summaryLoading} />

      {/* 3. STATUS FILTER TABS */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--color-slate-200)',
          scrollbarWidth: 'none'
        }}
        className="my-items-tabs-row"
        role="tablist"
      >
        {filterTabs.map((tab) => {
          const isActive = statusParam === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => updateUrlParams({ status: tab.id, page: 1 })}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#059669' : 'var(--color-slate-600)',
                backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
              className={isActive ? 'status-tab-active' : 'status-tab'}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR */}
      <Card style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Search Field */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={17}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }}
            />
            <input
              type="text"
              placeholder="Search your items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 32px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.875rem',
                color: 'var(--color-slate-900)',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-slate-400)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Desktop Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} className="desktop-filters-group">
            {/* Category Filter */}
            <select
              value={categoryParam}
              onChange={(e) => updateUrlParams({ category: e.target.value, page: 1 })}
              style={{
                padding: '8px 12px',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                outline: 'none',
                cursor: 'pointer'
              }}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Sharing Type Filter */}
            <select
              value={sharingTypeParam}
              onChange={(e) => updateUrlParams({ sharingType: e.target.value, page: 1 })}
              style={{
                padding: '8px 12px',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                outline: 'none',
                cursor: 'pointer'
              }}
              aria-label="Filter by sharing type"
            >
              <option value="all">All Types</option>
              <option value="free">Free</option>
              <option value="give_away">Give Away</option>
              <option value="borrow">Borrow</option>
              <option value="exchange">Exchange</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortParam}
              onChange={(e) => updateUrlParams({ sort: e.target.value, page: 1 })}
              style={{
                padding: '8px 12px',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                backgroundColor: '#ffffff',
                color: 'var(--color-slate-700)',
                outline: 'none',
                cursor: 'pointer'
              }}
              aria-label="Sort listings"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="recently_updated">Recently Updated</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Clear Filters button */}
            {hasActiveFilters && (
              <Button size="sm" variant="ghost" iconLeft={RefreshCw} onClick={handleClearAllFilters}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 5. CONTENT STATE: LOADING | ERROR | EMPTY | LISTINGS */}
      {loading ? (
        <MyItemsSkeleton />
      ) : error ? (
        <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '6px' }}>
            {error}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', marginBottom: '1.25rem' }}>
            We encountered a problem fetching your listings. Please try refreshing.
          </p>
          <Button variant="primary" size="md" iconLeft={RefreshCw} onClick={fetchMyItems}>
            Retry
          </Button>
        </Card>
      ) : items.length === 0 ? (
        hasActiveFilters ? (
          /* No search/filter results */
          <EmptyState
            icon={PackageOpen}
            title="No items match your filters."
            description="Try selecting a different status, category, or clearing your search term."
            actionLabel="Clear Filters"
            onAction={handleClearAllFilters}
          />
        ) : (
          /* True Empty State: User has zero listings */
          <EmptyState
            icon={Package}
            title="You haven’t shared anything yet."
            description="Give an unused item a second life by sharing it with your community."
            actionLabel="Share an Item"
            onAction={() => navigate('/share')}
            secondaryActionLabel="Browse Items"
            onSecondaryAction={() => navigate('/browse')}
          />
        )
      ) : (
        /* Listings Management Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
            <span>
              Showing {items.length} of {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          {items.map((item) => (
            <MyItemManagementCard
              key={item._id || item.id}
              item={item}
              onToggleAvailability={handleToggleAvailability}
              onRequestDelete={(selectedItem) => setDeletingItem(selectedItem)}
              isToggling={togglingItemId === (item._id || item.id)}
            />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '1.5rem'
              }}
            >
              <Button
                size="sm"
                variant="outline"
                iconLeft={ChevronLeft}
                disabled={pageParam <= 1}
                onClick={() => updateUrlParams({ page: pageParam - 1 })}
              >
                Previous
              </Button>
              <span style={{ fontSize: '0.825rem', color: 'var(--color-slate-600)', fontWeight: 600 }}>
                Page {pageParam} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                iconRight={ChevronRight}
                disabled={pageParam >= totalPages}
                onClick={() => updateUrlParams({ page: pageParam + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Removal Confirmation Modal */}
      <RemoveItemModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={deletingItem?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyItemsPage;
