import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Share2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';
import impactService from '../../services/impactService';
import ImpactSkeleton from '../../components/impact/ImpactSkeleton';
import ImpactEmptyState from '../../components/impact/ImpactEmptyState';
import ImpactSummaryCards from '../../components/impact/ImpactSummaryCards';
import ImpactTrendChart from '../../components/impact/ImpactTrendChart';
import ImpactHistoryTable from '../../components/impact/ImpactHistoryTable';
import ImpactMilestones from '../../components/impact/ImpactMilestones';
import ImpactMethodologySection from '../../components/impact/ImpactMethodologySection';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export const ImpactPage = () => {
  // State
  const [summaryData, setSummaryData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [trendRange, setTrendRange] = useState('6m');
  const [historyData, setHistoryData] = useState({ history: [], total: 0, page: 1, totalPages: 1 });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  const methodologyRef = useRef(null);

  // 1. Load initial impact summary
  const loadImpactData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryRes, trendsRes, historyRes] = await Promise.all([
        impactService.getMyImpact(),
        impactService.getMyImpactTrends({ range: trendRange }),
        impactService.getMyImpactHistory({ page: 1, limit: 10, type: historyTypeFilter })
      ]);

      if (summaryRes?.success) {
        setSummaryData(summaryRes);
      }
      if (trendsRes?.success) {
        setTrends(trendsRes.trends || []);
      }
      if (historyRes?.success) {
        setHistoryData(historyRes);
        setHistoryPage(historyRes.page || 1);
      }
    } catch (err) {
      console.error('Failed to load environmental impact data:', err);
      setError(err.message || 'Unable to retrieve environmental impact records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImpactData();
  }, []);

  // 2. Handle Trend Range Change
  const handleRangeChange = async (newRange) => {
    setTrendRange(newRange);
    try {
      setIsLoadingTrends(true);
      const res = await impactService.getMyImpactTrends({ range: newRange });
      if (res?.success) {
        setTrends(res.trends || []);
      }
    } catch (err) {
      console.error('Failed to update trend range:', err);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // 3. Handle History Page or Filter Change
  const handleHistoryPageChange = async (newPage) => {
    setHistoryPage(newPage);
    try {
      setIsLoadingHistory(true);
      const res = await impactService.getMyImpactHistory({
        page: newPage,
        limit: 10,
        type: historyTypeFilter
      });
      if (res?.success) {
        setHistoryData(res);
      }
    } catch (err) {
      console.error('Failed to paginate impact history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleHistoryTypeFilterChange = async (newType) => {
    setHistoryTypeFilter(newType);
    setHistoryPage(1);
    try {
      setIsLoadingHistory(true);
      const res = await impactService.getMyImpactHistory({
        page: 1,
        limit: 10,
        type: newType
      });
      if (res?.success) {
        setHistoryData(res);
      }
    } catch (err) {
      console.error('Failed to filter impact history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToMethodology = () => {
    if (methodologyRef.current) {
      methodologyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <ImpactSkeleton />;
  }

  if (error) {
    return (
      <Card style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>
          We Couldn't Load Your Impact
        </h2>
        <p style={{ color: 'var(--color-slate-600)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
          {error}
        </p>
        <Button variant="primary" iconLeft={RefreshCw} onClick={loadImpactData}>
          Try Again
        </Button>
      </Card>
    );
  }

  const hasActivity = (summaryData?.totalItemsReused || 0) > 0 || (summaryData?.completedReuseTransactions || 0) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 1. Hero Banner with Visual Depth */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#a7f3d0',
                marginBottom: '12px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Sparkles size={14} />
              <span>Personal Circular Reuse Dashboard</span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.15, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
              Your Impact
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#d1fae5', margin: 0, lineHeight: 1.5 }}>
              Every item reused keeps useful products in circulation and prevents avoidable waste across Bengaluru.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/customer/share">
              <Button
                variant="primary"
                iconLeft={Share2}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#065f46',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
                }}
              >
                Share an Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle 3D background shapes */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* 2. Primary Impact Display or Meaningful Empty State */}
      {!hasActivity ? (
        <ImpactEmptyState />
      ) : (
        <>
          {/* Key Metric Cards */}
          <ImpactSummaryCards
            data={summaryData}
            onOpenMethodology={scrollToMethodology}
          />

          {/* Activity Trend Chart */}
          <ImpactTrendChart
            trends={trends}
            range={trendRange}
            onRangeChange={handleRangeChange}
            isLoading={isLoadingTrends}
          />

          {/* Sustainability Milestones */}
          <ImpactMilestones milestones={summaryData?.milestones || []} />

          {/* Contribution History Table */}
          <ImpactHistoryTable
            history={historyData.history}
            total={historyData.total}
            page={historyPage}
            totalPages={historyData.totalPages}
            onPageChange={handleHistoryPageChange}
            typeFilter={historyTypeFilter}
            onTypeFilterChange={handleHistoryTypeFilterChange}
            isLoading={isLoadingHistory}
          />
        </>
      )}

      {/* 3. Transparent Methodology Section */}
      <div ref={methodologyRef}>
        <ImpactMethodologySection />
      </div>
    </div>
  );
};

export default ImpactPage;
