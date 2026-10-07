import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, HelpCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import WantedCard from '../../components/common/WantedCard';
import OfferItemModal from '../../components/wanted/OfferItemModal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { wantedService } from '../../services/wantedService';

export const WantedItemsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [wantedList, setWantedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWantedItem, setSelectedWantedItem] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const fetchWanted = async () => {
    setLoading(true);
    try {
      const response = await wantedService.getWantedItems();
      if (response && response.wantedItems) {
        setWantedList(response.wantedItems);
      } else {
        setWantedList([]);
      }
    } catch (err) {
      console.warn('Could not load wanted items from backend:', err);
      setWantedList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWanted();
  }, []);

  const handleRemove = async (id) => {
    try {
      await wantedService.deleteWantedItem(id);
      setWantedList((prev) => prev.filter((w) => (w.id || w._id) !== id));
      addToast({
        title: 'Request Removed',
        message: 'Wanted item request was removed.',
        variant: 'info'
      });
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.message || 'Could not remove wanted item request.',
        variant: 'error'
      });
    }
  };

  const handleHelpClick = (wantedItem) => {
    setSelectedWantedItem(wantedItem);
    setIsOfferModalOpen(true);
  };

  const handleOfferSuccess = () => {
    setIsOfferModalOpen(false);
    setSelectedWantedItem(null);
    addToast({
      title: 'Offer Sent!',
      message: 'Your offer has been submitted to the requester.',
      variant: 'success'
    });
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Wanted Items & Smart Matching"
        subtitle="Post what you need. Our matching algorithm automatically scores available items in your neighborhood."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={fetchWanted}
              disabled={loading}
            >
              Refresh
            </Button>
            <Link to="/wanted/create" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" iconLeft={PlusCircle}>
                Post a Wanted Item
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : wantedList.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No wanted items found"
          message="No one has posted a wanted item in your community yet. Be the first to broadcast what you are searching for!"
          actionLabel="Post a Wanted Item"
          onAction={() => window.location.assign('/wanted/create')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {wantedList.map((wanted) => {
            const id = wanted.id || wanted._id;
            const isOwner =
              user &&
              (wanted.requester?._id === (user.id || user._id) ||
                wanted.requester?.id === (user.id || user._id) ||
                wanted.user === (user.id || user._id));

            return (
              <WantedCard
                key={id}
                wanted={wanted}
                onHelpClick={handleHelpClick}
                onDeleteClick={handleRemove}
                isOwner={isOwner}
              />
            );
          })}
        </div>
      )}

      {/* Offer Item Modal */}
      {selectedWantedItem && (
        <OfferItemModal
          wantedItem={selectedWantedItem}
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedWantedItem(null);
          }}
          onOfferSuccess={handleOfferSuccess}
        />
      )}
    </div>
  );
};

export default WantedItemsPage;

