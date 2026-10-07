const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Request = require('../models/Request');
const Transaction = require('../models/Transaction');

/**
 * Service to manage valid LOOOP conversation relationships.
 * Conversations can only be initiated through valid platform triggers
 * such as an accepted request or active transaction.
 */
class ConversationService {
  /**
   * Retrieves or creates a conversation for an accepted request.
   * Ensures idempotency: never creates duplicates.
   */
  async getOrCreateConversationForRequest({ request: passedRequest, requestId, transactionId }) {
    const targetRequestId = requestId || passedRequest?._id;
    if (!targetRequestId) {
      throw new Error('A valid request ID is required to establish a conversation.');
    }

    // Check if conversation already exists for this request
    let conversation = await Conversation.findOne({ request: targetRequestId });

    if (conversation) {
      // If transaction reference was missing and now provided, update it
      if (transactionId && (!conversation.transaction || conversation.transaction.toString() !== transactionId.toString())) {
        conversation.transaction = transactionId;
        await conversation.save();
      }
      return conversation;
    }

    // Use passed request or load from DB
    const request = passedRequest || (await Request.findById(targetRequestId));
    if (!request) {
      throw new Error('Request record not found.');
    }

    const participants = [request.owner, request.requester];
    const itemId = request.item || request.offeredItem || null;
    const txId = transactionId || request.transaction || null;

    conversation = new Conversation({
      request: request._id,
      item: itemId,
      transaction: txId,
      participants,
      status: 'ACTIVE',
      lastMessageText: '',
      lastMessageAt: new Date()
    });

    await conversation.save();

    // Link conversation to request
    request.conversation = conversation._id;
    if (txId && !request.transaction) {
      request.transaction = txId;
    }
    await request.save();

    // Link conversation to transaction if exists
    if (txId) {
      await Transaction.findByIdAndUpdate(txId, { conversation: conversation._id });
    }

    return conversation;
  }

  /**
   * Checks if user is authorized to access a conversation
   */
  async verifyParticipant(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      const err = new Error('Conversation not found.');
      err.status = 404;
      throw err;
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      const err = new Error('You do not have permission to access this conversation.');
      err.status = 403;
      throw err;
    }

    return conversation;
  }

  /**
   * Calculates unread message count for a user in a specific conversation
   */
  async getUnreadCount(conversationId, userId) {
    return await Message.countDocuments({
      conversation: conversationId,
      readBy: { $ne: userId }
    });
  }

  /**
   * Persists a chat message and updates conversation metadata
   */
  async sendMessage({ conversationId, senderId, text }) {
    await this.verifyParticipant(conversationId, senderId);

    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      text: typeof text === 'string' ? text.trim().slice(0, 2000) : '',
      readBy: [senderId]
    });

    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageText: message.text,
      lastMessageAt: message.createdAt
    });

    return message;
  }
}

module.exports = new ConversationService();
