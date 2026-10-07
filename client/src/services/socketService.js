import { io } from 'socket.io-client';

/**
 * LOOOP Socket Service
 * Centralized singleton managing real-time authenticated WebSocket connections.
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
    this.listeners = new Map();
  }

  /**
   * Initializes or returns the existing authenticated Socket.IO instance
   */
  connect(token) {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('looop_token') : null);

    if (!authToken) {
      this.disconnect();
      return null;
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (typeof window !== 'undefined' && window.location.port === '3000'
        ? 'http://localhost:5000'
        : '');

    this.socket = io(socketUrl, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('[LOOOP Socket] Connected with ID:', this.socket.id);
      // If we were in a room prior to reconnect, rejoin it
      if (this.currentRoom) {
        this.joinConversation(this.currentRoom);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[LOOOP Socket] Connection warning:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[LOOOP Socket] Disconnected:', reason);
    });

    return this.socket;
  }

  /**
   * Disconnect the current socket cleanly
   */
  disconnect() {
    if (this.socket) {
      if (this.currentRoom) {
        this.leaveConversation(this.currentRoom);
      }
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join a verified conversation room
   */
  joinConversation(conversationId, callback) {
    if (!this.socket || !conversationId) return;
    this.currentRoom = conversationId;
    this.socket.emit('join_conversation', { conversationId }, (res) => {
      if (callback) callback(res);
    });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId) {
    if (!this.socket || !conversationId) return;
    this.socket.emit('leave_conversation', { conversationId });
    if (this.currentRoom === conversationId) {
      this.currentRoom = null;
    }
  }

  /**
   * Emit typing start
   */
  startTyping(conversationId) {
    if (!this.socket || !conversationId) return;
    this.socket.emit('typing_start', { conversationId });
  }

  /**
   * Emit typing stop
   */
  stopTyping(conversationId) {
    if (!this.socket || !conversationId) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  /**
   * Send a message through real-time socket with callback acknowledgment
   */
  sendMessage(conversationId, text, callback) {
    if (!this.socket || !conversationId || !text) return;
    this.socket.emit('send_message', { conversationId, text }, (res) => {
      if (callback) callback(res);
    });
  }

  /**
   * Mark messages as read through socket
   */
  markAsRead(conversationId, callback) {
    if (!this.socket || !conversationId) return;
    this.socket.emit('mark_read', { conversationId }, (res) => {
      if (callback) callback(res);
    });
  }

  /**
   * Register event listener with automated tracking
   */
  on(event, handler) {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  /**
   * Unregister event listener
   */
  off(event, handler) {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  /**
   * Check connection status
   */
  isConnected() {
    return !!(this.socket && this.socket.connected);
  }

  /**
   * Get active socket instance
   */
  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
