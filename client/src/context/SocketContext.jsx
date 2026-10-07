import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import messageService from '../services/messageService';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // Fetch unread count from real backend data
  const refreshUnreadTotal = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadTotal(0);
      return;
    }
    try {
      const res = await messageService.getUnreadCount();
      if (res && typeof res.unreadCount === 'number') {
        setUnreadTotal(res.unreadCount);
      }
    } catch (err) {
      // Silently catch unread fetch failure
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      setIsConnected(false);
      setUnreadTotal(0);
      return;
    }

    const socket = socketService.connect(token);
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onUserOnline = ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => new Set([...prev, userId.toString()]));
      }
    };

    const onUserOffline = ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId.toString());
          return next;
        });
      }
    };

    // When a new message arrives anywhere, update global unread count
    const onNewMessage = ({ message }) => {
      const currentUserId = user?.id || user?._id;
      if (message && message.sender && (message.sender._id || message.sender.id) !== currentUserId) {
        refreshUnreadTotal();
      }
    };

    // When messages are read, refresh unread count
    const onMessagesRead = () => {
      refreshUnreadTotal();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);
    socket.on('new_message', onNewMessage);
    socket.on('messages_read', onMessagesRead);

    setIsConnected(socket.connected);
    refreshUnreadTotal();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      socket.off('new_message', onNewMessage);
      socket.off('messages_read', onMessagesRead);
    };
  }, [token, user, refreshUnreadTotal]);

  const value = {
    socket: socketService.getSocket(),
    isConnected,
    unreadTotal,
    refreshUnreadTotal,
    onlineUserIds,
    isUserOnline: (userId) => (userId ? onlineUserIds.has(userId.toString()) : false),
    joinConversation: (id, cb) => socketService.joinConversation(id, cb),
    leaveConversation: (id) => socketService.leaveConversation(id),
    sendMessage: (id, text, cb) => socketService.sendMessage(id, text, cb),
    startTyping: (id) => socketService.startTyping(id),
    stopTyping: (id) => socketService.stopTyping(id),
    markAsRead: (id, cb) => socketService.markAsRead(id, cb)
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
