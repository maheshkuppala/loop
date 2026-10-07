import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { itemService } from '../../services/itemService';
import { wantedService } from '../../services/wantedService';
import { impactService } from '../../services/impactService';
import { requestService } from '../../services/requestService';
import { messageService } from '../../services/messageService';
import { notificationService } from '../../services/notificationService';
import { mockUsers } from '../../data/mockData';

// Dashboard Subcomponents
import DashboardHero from '../../components/dashboard/DashboardHero';
import QuickActionCards from '../../components/dashboard/QuickActionCards';
import CategoryShortcuts from '../../components/dashboard/CategoryShortcuts';
import NearbyItemsSection from '../../components/dashboard/NearbyItemsSection';
import WantedPreviewSection from '../../components/dashboard/WantedPreviewSection';
import CommunityImpactSection from '../../components/dashboard/CommunityImpactSection';
import ActivityAndMessages from '../../components/dashboard/ActivityAndMessages';
import TrustReputationCard from '../../components/dashboard/TrustReputationCard';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  // Safe fallback to mock user during development if auth token not yet populated
  const currentUser = user || mockUsers.currentUser;

  // Data States
  const [nearbyItems, setNearbyItems] = useState([]);
  const [wantedItems, setWantedItems] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // UI Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, wantedRes, impactRes, requestsRes, messagesRes, notifsRes] = await Promise.allSettled([
        itemService.getItems ? itemService.getItems({ limit: 6 }) : Promise.resolve([]),
        wantedService.getWantedItems ? wantedService.getWantedItems({ limit: 3 }) : Promise.resolve([]),
        impactService.getMyImpact ? impactService.getMyImpact() : Promise.resolve(null),
        requestService.getMyRequests ? requestService.getMyRequests() : Promise.resolve([]),
        messageService.getConversations ? messageService.getConversations({ limit: 5 }) : Promise.resolve([]),
        notificationService.getNotifications ? notificationService.getNotifications({ limit: 5 }) : Promise.resolve([])
      ]);

      const items = itemsRes.status === 'fulfilled' ? (itemsRes.value?.items || itemsRes.value || []) : [];
      const wanted = wantedRes.status === 'fulfilled' ? (wantedRes.value?.wantedItems || wantedRes.value || []) : [];
      const impact = impactRes.status === 'fulfilled' ? (impactRes.value?.data || impactRes.value || null) : null;
      const requests = requestsRes.status === 'fulfilled' ? (requestsRes.value?.requests || requestsRes.value || []) : [];
      const messages = messagesRes.status === 'fulfilled' ? (messagesRes.value?.conversations || messagesRes.value || []) : [];
      const notifs = notifsRes.status === 'fulfilled' ? (notifsRes.value?.notifications || notifsRes.value || []) : [];

      setNearbyItems(Array.isArray(items) ? items : []);
      setWantedItems(Array.isArray(wanted) ? wanted : []);
      setImpactMetrics(impact);
      setRecentRequests(Array.isArray(requests) ? requests : []);
      setRecentConversations(Array.isArray(messages) ? messages : []);
      setRecentNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load dashboard data. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 1. Welcome & 3D Connected Items Hero */}
      <DashboardHero user={currentUser} />

      {/* 2. Primary Quick Action Cards (Share / Browse / Wanted) */}
      <QuickActionCards />

      {/* 3. Discovery Categories Shortcuts */}
      <CategoryShortcuts />

      {/* 4. Items Near You Grid */}
      <NearbyItemsSection
        items={nearbyItems}
        loading={false}
        error={error}
        onRetry={loadDashboardData}
      />

      {/* 5. Wanted Items Preview ("Someone Nearby May Need What You Have") */}
      <WantedPreviewSection wantedItems={wantedItems} />

      {/* 6. Environmental Impact & Community Activity Pulse */}
      <CommunityImpactSection impact={impactMetrics} userStats={currentUser} />

      {/* 7. Dual Grid: Recent Requests/Messages/Notifications + Trust & Reputation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem',
          alignItems: 'stretch'
        }}
      >
        <ActivityAndMessages
          requests={recentRequests}
          conversations={recentConversations}
          notifications={recentNotifications}
        />

        <TrustReputationCard user={currentUser} />
      </div>
    </div>
  );
};

export default CustomerDashboard;
