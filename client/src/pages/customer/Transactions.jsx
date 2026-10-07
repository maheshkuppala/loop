import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Repeat,
  Package,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import TransactionCard from '../../components/transactions/TransactionCard';
import { transactionService } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export const Transactions = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    active: 0,
    pendingHandover: 0,
    scheduled: 0,
    returnPending: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL or default
  const statusFilter = searchParams.get('status') || 'ALL';
  const typeFilter = searchParams.get('type') || 'ALL';
  const sortFilter = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchQuery);

  const currentUserId = user?.id || user?._id;

  // Load summary statistics from real backend
  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await transactionService.getTransactionSummary();
      if (res && res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.warn('Failed to load transaction summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Load transactions list from real backend
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (sortFilter) params.sort = sortFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await transactionService.getTransactions(params);
      setTransactions(res?.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load your transactions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, sortFilter, searchQuery]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Update URL search parameters
  const updateFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'ALL' || !val) {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '4rem' }} className="transactions-page">
      {/* 1. Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
              fontWeight: 900,
              color: 'var(--color-slate-900)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em'
            }}
          >
            Transactions
          </h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', margin: 0 }}>
            Track your item sharing, borrowing, exchanges, and handovers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          iconLeft={RefreshCw}
          onClick={() => {
            loadTransactions();
            loadSummary();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* 2. Real Backend Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {/* Active Handover/Borrowing */}
        <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Active
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PackageCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-slate-900)', marginTop: '6px' }}>
            {summary.active}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            In active borrowing / handed over
          </div>
        </Card>

        {/* Pending Handover */}
        <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Pending Handover
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-slate-900)', marginTop: '6px' }}>
            {summary.pendingHandover + summary.scheduled}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            {summary.scheduled > 0 ? `${summary.scheduled} scheduled meeting(s)` : 'Awaiting schedule'}
          </div>
        </Card>

        {/* Return In Progress */}
        <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Return Pending
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Repeat size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-slate-900)', marginTop: '6px' }}>
            {summary.returnPending}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            Items in return process
          </div>
        </Card>

        {/* Completed */}
        <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Completed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-slate-900)', marginTop: '6px' }}>
            {summary.completed}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            Successfully concluded transfers
          </div>
        </Card>
      </div>

      {/* 3. Filters & Search Bar */}
      <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="var(--color-slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by item title..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-300)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <Button variant="secondary" size="md" type="submit">
              Search
            </Button>
          </form>

          {/* Select Dropdown Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => updateFilter('status', e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                color: 'var(--color-slate-700)'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_HANDOVER">Pending Handover</option>
              <option value="HANDOVER_SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active Sharing / Borrow</option>
              <option value="RETURN_PENDING">Return In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => updateFilter('type', e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                color: 'var(--color-slate-700)'
              }}
            >
              <option value="ALL">All Types</option>
              <option value="FREE">Free Share</option>
              <option value="GIVEAWAY">Give Away</option>
              <option value="BORROW">Borrow</option>
              <option value="EXCHANGE">Exchange</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortFilter}
              onChange={(e) => updateFilter('sort', e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-300)',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                color: 'var(--color-slate-700)'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <Card
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-danger-bg, #fef2f2)',
            border: '1px solid var(--color-danger-border, #fecaca)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', fontSize: '0.9rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={loadTransactions}>
            Try Again
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Spinner size="lg" />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-500)' }}>
            Loading transactions from database...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        /* Empty State with CTA */
        <EmptyState
          icon={Package}
          title="No transactions yet"
          description="When you accept an incoming request or another neighbor accepts your request, a handover transaction will be created here to coordinate pickup and returns."
          actionLabel="Browse Available Items"
          onAction={() => navigate('/browse')}
        />
      ) : (
        /* Transactions List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id || tx._id}
              transaction={tx}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
