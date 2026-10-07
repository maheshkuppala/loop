import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  CheckCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Repeat,
  Package,
  WifiOff,
  RotateCw
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import messageService from '../../services/messageService';

export const ChatWindow = ({
  conversation,
  onBack,
  onMessageSent,
  isMobile
}) => {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    isUserOnline: checkUserOnline,
    startTyping,
    stopTyping,
    markAsRead
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showScrollBottomPill, setShowScrollBottomPill] = useState(false);

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const currentUserId = user?.id || user?._id;
  const conversationId = conversation?._id || conversation?.id;

  const otherParticipant = conversation?.otherParticipant ||
    conversation?.participants?.find((p) => (p._id || p.id || p).toString() !== currentUserId?.toString());

  const otherUserId = otherParticipant?._id || otherParticipant?.id;
  const isOnline = otherUserId ? checkUserOnline(otherUserId) : !!conversation?.isOnline;

  // 1. Fetch Initial Message History
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoadingMessages(true);
    setSendError(null);
    try {
      const res = await messageService.getMessages(conversationId, { page: 1, limit: 30 });
      if (res && res.success) {
        setMessages(res.messages || []);
        setPage(1);
        setHasMore(!!res.hasMore);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 2. Mark messages as read when opening conversation
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    messageService.markConversationRead(conversationId).catch(() => {});
    markAsRead(conversationId);
  }, [conversationId, currentUserId, markAsRead]);

  // 3. Socket Event Subscriptions (Join room, real-time message stream, typing, read receipts)
  useEffect(() => {
    if (!conversationId || !socket) return;

    socket.emit('join_conversation', { conversationId });

    const handleNewMessage = (payload) => {
      if (payload?.conversationId === conversationId && payload.message) {
        const incoming = payload.message;
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => (m._id || m.id) === (incoming._id || incoming.id))) {
            return prev;
          }
          return [...prev, incoming];
        });

        // Mark as read if from partner
        const senderId = (incoming.sender?._id || incoming.sender?.id || incoming.sender)?.toString();
        if (senderId !== currentUserId?.toString()) {
          markAsRead(conversationId);
          messageService.markConversationRead(conversationId).catch(() => {});
        }

        // Notify parent list to update preview
        if (onMessageSent) {
          onMessageSent(incoming);
        }

        // Auto-scroll if user is already near bottom, else show pill
        if (isNearBottomRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        } else {
          setShowScrollBottomPill(true);
        }
      }
    };

    const handleTypingStart = (data) => {
      if (data?.conversationId === conversationId && data?.userId !== currentUserId?.toString()) {
        setPartnerTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data?.conversationId === conversationId) {
        setPartnerTyping(false);
      }
    };

    const handleMessagesRead = (data) => {
      if (data?.conversationId === conversationId && data?.userId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const readList = msg.readBy || [];
            const alreadyRead = readList.some(
              (r) => (r._id || r).toString() === data.userId.toString()
            );
            if (!alreadyRead) {
              return {
                ...msg,
                readBy: [...readList, data.userId]
              };
            }
            return msg;
          })
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [conversationId, socket, currentUserId, markAsRead, onMessageSent]);

  // 4. Scroll Tracking
  const handleScroll = () => {
    const container = chatScrollContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceToBottom < 80;

    if (isNearBottomRef.current && showScrollBottomPill) {
      setShowScrollBottomPill(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottomPill(false);
  };

  // Scroll to bottom on initial message load
  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [loadingMessages]);

  // 5. Load Older Messages (Pagination)
  const handleLoadOlder = async () => {
    if (loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    const container = chatScrollContainerRef.current;
    const prevHeight = container ? container.scrollHeight : 0;

    try {
      const nextPage = page + 1;
      const res = await messageService.getMessages(conversationId, { page: nextPage, limit: 30 });
      if (res && res.success && res.messages?.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => (m._id || m.id).toString()));
          const newUnique = res.messages.filter((m) => !existingIds.has((m._id || m.id).toString()));
          return [...newUnique, ...prev];
        });
        setPage(nextPage);
        setHasMore(!!res.hasMore);

        // Preserve scroll position
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevHeight;
          }
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  // 6. Handle Input Typing with Debounce
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setSendError(null);

    if (conversationId) {
      startTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 1500);
    }
  };

  // 7. Send Message Flow
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(conversationId);

    setIsSending(true);
    setSendError(null);

    try {
      // Use socket with REST fallback for 100% reliable message delivery
      const res = await messageService.sendMessage(conversationId, textToSend);
      if (res && res.success && res.message) {
        const sent = res.message;
        setMessages((prev) => {
          if (prev.some((m) => (m._id || m.id) === (sent._id || sent.id))) {
            return prev;
          }
          return [...prev, sent];
        });
        setInputText('');
        if (onMessageSent) onMessageSent(sent);

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        throw new Error(res?.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setSendError(err.message || 'Unable to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // 8. Keyboard Behavior: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp safely
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Context panels: Handover & Borrow checking
  const transaction = conversation?.transaction;
  const item = conversation?.item;
  const isBorrow = transaction?.type === 'BORROW' || item?.sharingType === 'borrow';
  const isHandoverPending = transaction?.status === 'PENDING_HANDOVER' || transaction?.status === 'HANDOVER_SCHEDULED';
  const isBorrowActive = isBorrow && (transaction?.status === 'ACTIVE' || transaction?.status === 'HANDED_OVER');

  // Check if borrow is overdue
  let isOverdue = false;
  if (isBorrowActive && transaction?.expectedReturnDate) {
    const returnDate = new Date(transaction.expectedReturnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    isOverdue = returnDate < today;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fafbfc',
        position: 'relative'
      }}
      className="chat-window-wrapper"
    >
      {/* 1. CHAT HEADER */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--color-slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-slate-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {otherUserId ? (
            <Link to={`/users/${otherUserId}`} style={{ textDecoration: 'none', position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={otherParticipant?.avatar}
                name={otherParticipant?.name || 'Partner'}
                size="md"
              />
              <span
                title={isOnline ? 'Online now' : 'Offline'}
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#10b981' : '#94a3b8',
                  border: '2px solid #ffffff'
                }}
              />
            </Link>
          ) : (
            <div style={{ position: 'relative' }}>
              <Avatar
                src={otherParticipant?.avatar}
                name={otherParticipant?.name || 'Partner'}
                size="md"
              />
              <span
                title={isOnline ? 'Online now' : 'Offline'}
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#10b981' : '#94a3b8',
                  border: '2px solid #ffffff'
                }}
              />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {otherUserId ? (
                <Link
                  to={`/users/${otherUserId}`}
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: 'var(--color-slate-900)',
                    margin: 0,
                    textDecoration: 'none'
                  }}
                  className="hover:underline"
                  title="View community profile"
                >
                  {otherParticipant?.name || 'Community Member'}
                </Link>
              ) : (
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
                  {otherParticipant?.name || 'Community Member'}
                </h3>
              )}
              {otherParticipant?.verified !== false && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#059669',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    backgroundColor: '#ecfdf5',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: isOnline ? '#059669' : 'var(--color-slate-400)', fontWeight: 600 }}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Shortcuts: View Item & View Transaction */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {item && (
            <Link
              to={`/items/${item._id || item.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm" iconRight={ExternalLink} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                Item: {item.title?.length > 18 ? `${item.title.substring(0, 18)}...` : item.title}
              </Button>
            </Link>
          )}

          {transaction && (
            <Link
              to={`/transactions/${transaction._id || transaction.id || transaction}`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="secondary" size="sm" iconRight={ExternalLink} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                Transaction
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. RECONNECTION BANNER IF WEBSOCKET DISCONNECTED */}
      {!isConnected && (
        <div
          style={{
            padding: '6px 16px',
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            fontSize: '0.78rem',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <WifiOff size={14} />
          <span>Live connection disconnected. Reconnecting in background...</span>
        </div>
      )}

      {/* 3. TRANSACTION CONTEXT BANNER */}
      {/* 3A. Handover Pending Context */}
      {isHandoverPending && (
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.825rem',
            color: '#166534',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#16a34a" />
            <span>
              <strong>Handover Pending:</strong> Use this conversation to coordinate handover logistics and meet safe in public.
            </span>
          </div>

          {transaction?.handoverDate && (
            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
              Meeting: {new Date(transaction.handoverDate).toLocaleDateString()} {transaction.handoverTime ? `at ${transaction.handoverTime}` : ''}
            </span>
          )}
        </div>
      )}

      {/* 3B. Borrow Active Context */}
      {isBorrowActive && (
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: isOverdue ? '#fef2f2' : '#eff6ff',
            borderBottom: `1px solid ${isOverdue ? '#fecaca' : '#bfdbfe'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.825rem',
            color: isOverdue ? '#991b1b' : '#1e40af',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOverdue ? (
              <AlertCircle size={16} color="#dc2626" />
            ) : (
              <Repeat size={16} color="#2563eb" />
            )}
            <span>
              <strong>{isOverdue ? 'Borrowing Overdue:' : 'Borrowing Active:'}</strong>{' '}
              {transaction?.expectedReturnDate
                ? `Expected return by ${new Date(transaction.expectedReturnDate).toLocaleDateString()}`
                : 'Use this chat to coordinate item return.'}
            </span>
          </div>
        </div>
      )}

      {/* 4. MESSAGES STREAM CONTAINER */}
      <div
        ref={chatScrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
        aria-live="polite"
        role="log"
      >
        {/* Load Older Messages Trigger */}
        {hasMore && (
          <div style={{ textAlign: 'center', margin: '4px 0 10px 0' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadOlder}
              loading={loadingOlder}
              iconLeft={RotateCw}
              style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}
            >
              Load earlier messages
            </Button>
          </div>
        )}

        {/* Initial Loading Spinner */}
        {loadingMessages ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px' }}>
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          /* Empty Chat Prompt */
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              maxWidth: '360px',
              color: 'var(--color-slate-500)'
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}
            >
              <Package size={26} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-slate-800)', margin: '0 0 6px 0' }}>
              Start Conversation
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              Say hello, introduce yourself, and discuss meeting location or timings with {otherParticipant?.name || 'the other participant'}.
            </p>
          </div>
        ) : (
          /* Real Message Stream */
          messages.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
            const isOwn = senderId === currentUserId?.toString();

            // Read state: other participant has message in readBy
            const isRead = msg.readBy?.some(
              (r) => (r._id || r).toString() === otherUserId?.toString()
            );

            return (
              <div
                key={msg._id || msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwn ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.2s ease-in'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    minWidth: '60px',
                    padding: '10px 14px',
                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isOwn ? '#059669' : '#ffffff',
                    color: isOwn ? '#ffffff' : 'var(--color-slate-800)',
                    border: isOwn ? 'none' : '1px solid var(--color-slate-200)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.925rem',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '3px',
                    padding: '0 4px',
                    fontSize: '0.68rem',
                    color: 'var(--color-slate-400)'
                  }}
                >
                  <span>{formatTime(msg.createdAt)}</span>
                  {isOwn && (
                    <span title={isRead ? 'Read' : 'Delivered'}>
                      {isRead ? (
                        <CheckCheck size={13} color="#059669" />
                      ) : (
                        <Check size={13} color="var(--color-slate-400)" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {partnerTyping && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-slate-200)',
              width: 'fit-content',
              fontSize: '0.78rem',
              color: 'var(--color-slate-500)',
              animation: 'fadeIn 0.2s ease-in'
            }}
          >
            <span>{otherParticipant?.name || 'Partner'} is typing</span>
            <span className="typing-dots">...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating "Scroll to Bottom" Pill when user has scrolled up */}
      {showScrollBottomPill && (
        <button
          type="button"
          onClick={scrollToBottom}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '24px',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-md)',
            cursor: 'pointer',
            zIndex: 15
          }}
        >
          <ChevronDown size={14} />
          <span>New messages</span>
        </button>
      )}

      {/* Send Error Notice */}
      {sendError && (
        <div
          style={{
            padding: '6px 16px',
            backgroundColor: '#fef2f2',
            borderTop: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertCircle size={14} />
          <span>{sendError}</span>
        </div>
      )}

      {/* 5. MESSAGE COMPOSER */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 18px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--color-slate-200)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <textarea
          rows={1}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${otherParticipant?.name || 'partner'}... (Enter to send, Shift+Enter for newline)`}
          aria-label="Type your message"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1px solid var(--color-slate-300)',
            outline: 'none',
            fontSize: '0.9rem',
            lineHeight: 1.4,
            resize: 'none',
            maxHeight: '100px',
            fontFamily: 'inherit',
            backgroundColor: '#f8fafc'
          }}
        />

        <Button
          type="submit"
          variant="primary"
          iconLeft={Send}
          disabled={!inputText.trim() || isSending}
          loading={isSending}
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '10px 16px',
            flexShrink: 0
          }}
        >
          Send
        </Button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-dots {
          animation: blink 1.2s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
