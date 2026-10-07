import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  ArrowLeft,
  Package,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import ChatWindow from '../../components/messages/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import messageService from '../../services/messageService';

export const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isUserOnline, refreshUnreadTotal } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingActive, setLoadingActive] = useState(false);
  const [errorState, setErrorState] = useState(null); // { status: 403 | 404, message: string } | null

  const currentUserId = user?.id || user?._id;

  // 1. Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await messageService.getConversations({ search: searchQuery });
      if (res && res.success) {
        setConversations(res.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingList(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Load Single Conversation when conversationId in URL changes
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setErrorState(null);
      return;
    }

    let isMounted = true;
    const loadConversation = async () => {
      setLoadingActive(true);
      setErrorState(null);
      try {
        const res = await messageService.getConversationById(conversationId);
        if (isMounted && res && res.success && res.conversation) {
          setActiveConversation(res.conversation);
        } else if (isMounted) {
          throw new Error('Conversation record not found.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load conversation details:', err);
        const status = err.status || err.response?.status;
        if (status === 403) {
          setErrorState({
            status: 403,
            message: 'This conversation is not available.'
          });
        } else if (status === 404) {
          setErrorState({
            status: 404,
            message: 'Conversation not found.'
          });
        } else {
          setErrorState({
            status: 500,
            message: err.message || 'Unable to open conversation.'
          });
        }
      } finally {
        if (isMounted) setLoadingActive(false);
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // 3. Select Conversation handler
  const handleSelectConversation = (conv) => {
    const id = conv._id || conv.id;
    navigate(`/messages/${id}`);
  };

  // 4. Update Conversation Preview on new message
  const handleMessageSent = (newMsg) => {
    setConversations((prev) =>
      prev.map((c) => {
        if ((c._id || c.id) === (activeConversation?._id || activeConversation?.id)) {
          return {
            ...c,
            lastMessageText: newMsg.text,
            lastMessageAt: newMsg.createdAt,
            unreadCount: 0
          };
        }
        return c;
      })
    );
    refreshUnreadTotal();
  };

  // Safe time formatting
  const formatListTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const isThreadActiveOnMobile = !!conversationId;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 360px) 1fr',
        height: 'calc(100vh - 160px)',
        minHeight: '560px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-slate-200)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}
      className="messages-page-grid"
    >
      {/* ==================================================== */}
      {/* 1. LEFT CONVERSATIONS SIDEBAR                        */}
      {/* ==================================================== */}
      <div
        style={{
          borderRight: '1px solid var(--color-slate-200)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          height: '100%',
          overflow: 'hidden'
        }}
        className={`conversation-sidebar-pane ${isThreadActiveOnMobile ? 'hide-mobile' : ''}`}
      >
        {/* Header & Search */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-slate-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              Messages
            </h2>
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={fetchConversations}
              title="Refresh conversation list"
              style={{ padding: '5px' }}
            />
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', color: 'var(--color-slate-400)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by participant or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                width: '100%',
                paddingLeft: '32px',
                fontSize: '0.85rem',
                height: '38px',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </div>
        </div>

        {/* Conversation Items List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingList ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Spinner size="md" />
            </div>
          ) : conversations.length === 0 ? (
            /* Empty State */
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--color-slate-500)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-slate-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  color: 'var(--color-slate-400)'
                }}
              >
                <MessageSquare size={22} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-800)', margin: '0 0 6px 0' }}>
                No conversations yet
              </h4>
              <p style={{ fontSize: '0.825rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Once a request is accepted, you’ll be able to communicate with the other participant here.
              </p>
              <Link to="/browse" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" iconLeft={ShoppingBag}>
                  Browse Items
                </Button>
              </Link>
            </div>
          ) : (
            conversations.map((conv) => {
              const convId = conv._id || conv.id;
              const isSelected = (activeConversation?._id || activeConversation?.id) === convId;

              const other = conv.otherParticipant ||
                conv.participants?.find((p) => (p._id || p.id || p).toString() !== currentUserId?.toString());

              const isPartnerOnline = other ? isUserOnline(other._id) : !!conv.isOnline;

              return (
                <div
                  key={convId}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-slate-100)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #059669' : '4px solid transparent',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  className="conv-list-item"
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar
                      src={other?.avatar}
                      name={other?.name || 'Partner'}
                      size="md"
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: isPartnerOnline ? '#10b981' : '#cbd5e1',
                        border: '2px solid #ffffff'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <strong
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--color-slate-900)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {other?.name || 'Community Member'}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-slate-400)', flexShrink: 0, marginLeft: '6px' }}>
                        {formatListTime(conv.lastMessageAt || conv.updatedAt)}
                      </span>
                    </div>

                    {conv.item?.title && (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#059669',
                          fontWeight: 600,
                          marginBottom: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        Item: {conv.item.title}
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: conv.unreadCount > 0 ? 'var(--color-slate-900)' : 'var(--color-slate-500)',
                        fontWeight: conv.unreadCount > 0 ? 700 : 400,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conv.lastMessageText || 'Chat started'}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span
                      style={{
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. RIGHT CHAT PREVIEW / DETAIL VIEWPORT              */}
      {/* ==================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#fafbfc'
        }}
        className={`conversation-chat-pane ${!isThreadActiveOnMobile ? 'hide-mobile' : ''}`}
      >
        {/* State A: Error State (403 Unauthorized or 404 Not Found) */}
        {errorState ? (
          <div
            style={{
              margin: 'auto',
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '420px'
            }}
          >
            <AlertCircle size={44} color="var(--color-danger, #ef4444)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>
              {errorState.message}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {errorState.status === 403
                ? 'You must be a verified participant of this transaction to access this conversation.'
                : 'The requested conversation thread could not be found or has expired.'}
            </p>
            <Button
              variant="primary"
              iconLeft={ArrowLeft}
              onClick={() => navigate('/messages')}
            >
              Back to Messages
            </Button>
          </div>
        ) : loadingActive ? (
          /* State B: Loading Active Thread */
          <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem' }}>
            <Spinner size="lg" />
            <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>
              Loading conversation...
            </p>
          </div>
        ) : activeConversation ? (
          /* State C: Active Chat Window */
          <ChatWindow
            conversation={activeConversation}
            onBack={() => navigate('/messages')}
            onMessageSent={handleMessageSent}
            isMobile={isThreadActiveOnMobile}
          />
        ) : (
          /* State D: No Conversation Selected (Desktop Placeholder) */
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              padding: '3rem 2rem',
              maxWidth: '400px',
              color: 'var(--color-slate-500)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-slate-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: 'var(--color-slate-400)'
              }}
            >
              <MessageSquare size={30} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-slate-800)', margin: '0 0 8px 0' }}>
              Select a conversation
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              Choose a discussion thread from the sidebar to coordinate item handovers, borrowing arrangements, or returns.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .conv-list-item:hover {
          background-color: #f8fafc !important;
        }
        @media (max-width: 768px) {
          .messages-page-grid {
            grid-template-columns: 1fr !important;
          }
          .conversation-sidebar-pane.hide-mobile {
            display: none !important;
          }
          .conversation-chat-pane.hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Messages;
