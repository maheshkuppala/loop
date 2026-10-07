const Request = require('../models/Request');
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const WantedItem = require('../models/WantedItem');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const conversationService = require('../services/conversationService');
const notificationService = require('../services/notificationService');
const mongoose = require('mongoose');

/**
 * Request Controller
 * Handles requests for available items (giveaway, borrow, exchange)
 * and offers submitted toward wanted item requests.
 */

// 1. Create a Request or Offer (POST /api/requests)
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create a request.'
      });
    }

    const {
      itemId,
      wantedItemId,
      type,
      message = '',
      expectedReturnDate,
      offeredItemId
    } = req.body;

    const trimmedMessage = (message || '').trim();

    // ====================================================
    // CASE A: Direct Request on an Available Item
    // ====================================================
    if (itemId) {
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID.'
        });
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'The requested item was not found.'
        });
      }

      // 1. Availability check
      if (item.availability === 'Unavailable' || item.status === 'removed') {
        return res.status(400).json({
          success: false,
          message: 'This item is no longer available.'
        });
      }

      // 2. Ownership check: Requester cannot be owner
      if (item.owner && item.owner.toString() === userId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot request your own item.'
        });
      }

      // 3. Duplicate pending request check
      const duplicateRequest = await Request.findOne({
        item: itemId,
        requester: userId,
        status: 'PENDING'
      });

      if (duplicateRequest) {
        return res.status(400).json({
          success: false,
          message: "You've already requested this item. Please wait for the owner's response."
        });
      }

      // 4. Request type compatibility & validation
      let resolvedType = type;
      if (!resolvedType) {
        if (item.sharingType === 'borrow') resolvedType = 'BORROW';
        else if (item.sharingType === 'exchange') resolvedType = 'EXCHANGE';
        else resolvedType = 'REQUEST_ITEM';
      }

      // Validate Borrow
      let parsedReturnDate = null;
      if (resolvedType === 'BORROW' || item.sharingType === 'borrow') {
        resolvedType = 'BORROW';
        if (expectedReturnDate) {
          const retDate = new Date(expectedReturnDate);
          if (isNaN(retDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: 'Please provide a valid expected return date.'
            });
          }
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (retDate < today) {
            return res.status(400).json({
              success: false,
              message: 'Expected return date cannot be in the past.'
            });
          }
          parsedReturnDate = retDate;
        }
      }

      // Validate Exchange
      let validOfferedItem = null;
      if (resolvedType === 'EXCHANGE' || item.sharingType === 'exchange') {
        resolvedType = 'EXCHANGE';
        if (offeredItemId) {
          if (!mongoose.Types.ObjectId.isValid(offeredItemId)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid offered item ID.'
            });
          }
          const offered = await Item.findById(offeredItemId);
          if (!offered) {
            return res.status(404).json({
              success: false,
              message: 'The offered exchange item was not found.'
            });
          }
          if (offered.owner.toString() !== userId.toString()) {
            return res.status(403).json({
              success: false,
              message: 'You can only offer an item that you own.'
            });
          }
          if (offered.availability === 'Unavailable') {
            return res.status(400).json({
              success: false,
              message: 'Your offered item is currently marked unavailable.'
            });
          }
          validOfferedItem = offered._id;
        }
      }

      const newRequest = new Request({
        item: item._id,
        requester: userId,
        owner: item.owner,
        type: resolvedType,
        message: trimmedMessage,
        expectedReturnDate: parsedReturnDate,
        offeredItem: validOfferedItem,
        status: 'PENDING'
      });

      await newRequest.save();

      await newRequest.populate([
        { path: 'item', select: 'title images sharingType condition location' },
        { path: 'requester', select: 'name avatar trustScore rating email' },
        { path: 'owner', select: 'name avatar trustScore rating email' },
        { path: 'offeredItem', select: 'title images condition' }
      ]);

      // Trigger real notification for item owner
      notificationService.notifyRequestReceived({
        request: newRequest,
        item,
        actor: req.user
      }).catch((err) => console.error('Notification trigger error:', err.message));

      return res.status(201).json({
        success: true,
        message: 'Your request has been submitted to the owner.',
        request: newRequest
      });
    }

    // ====================================================
    // CASE B: Offer on a Wanted Item
    // ====================================================
    if (wantedItemId) {
      if (!mongoose.Types.ObjectId.isValid(wantedItemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wanted item ID.'
        });
      }

      const wantedItem = await WantedItem.findById(wantedItemId);
      if (!wantedItem) {
        return res.status(404).json({
          success: false,
          message: 'The wanted request was not found.'
        });
      }

      if (wantedItem.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'This wanted request is no longer active.'
        });
      }

      if (wantedItem.requester && wantedItem.requester.toString() === userId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot submit an offer on your own wanted request.'
        });
      }

      // Check offered item
      if (!offeredItemId) {
        return res.status(400).json({
          success: false,
          message: 'Please select one of your available items to offer.'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(offeredItemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid offered item ID.'
        });
      }

      const offered = await Item.findById(offeredItemId);
      if (!offered) {
        return res.status(404).json({
          success: false,
          message: 'The selected item was not found.'
        });
      }

      if (offered.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only offer an item that you own.'
        });
      }

      if (offered.availability === 'Unavailable') {
        return res.status(400).json({
          success: false,
          message: 'Your selected item is currently marked unavailable.'
        });
      }

      // Duplicate offer check
      const duplicateOffer = await Request.findOne({
        wantedItem: wantedItemId,
        requester: userId,
        status: 'PENDING'
      });

      if (duplicateOffer) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted an active offer for this wanted request.'
        });
      }

      const newOffer = new Request({
        wantedItem: wantedItem._id,
        requester: userId,
        owner: wantedItem.requester,
        type: 'OFFER',
        message: trimmedMessage,
        offeredItem: offered._id,
        status: 'PENDING'
      });

      await newOffer.save();

      await newOffer.populate([
        { path: 'wantedItem', select: 'title category location urgency' },
        { path: 'requester', select: 'name avatar trustScore rating email' },
        { path: 'owner', select: 'name avatar trustScore rating email' },
        { path: 'offeredItem', select: 'title images condition' }
      ]);

      // Trigger notification for wanted item requester
      notificationService.notifyWantedResponse({
        wantedItem,
        request: newOffer,
        actor: req.user
      }).catch((err) => console.error('Notification trigger error:', err.message));

      return res.status(201).json({
        success: true,
        message: 'Your offer has been submitted to the requester.',
        request: newOffer
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Please provide either an itemId or a wantedItemId.'
    });
  } catch (error) {
    console.error('Error in createRequest:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to submit request. Please try again.'
    });
  }
};

// 2. Get Requests Created by Authenticated User (GET /api/requests/my)
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const requests = await Request.find({ requester: userId })
      .populate('item', 'title images sharingType condition availability status location')
      .populate('wantedItem', 'title category location urgency')
      .populate('owner', 'name avatar trustScore rating email')
      .populate('offeredItem', 'title images condition')
      .sort({ createdAt: -1 });

    const formatted = requests.map((r) => ({
      ...r.toObject(),
      id: r._id
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      requests: formatted
    });
  } catch (error) {
    console.error('Error in getMyRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve your sent requests.'
    });
  }
};

// 3. Get Requests Received by Authenticated User (GET /api/requests/received)
exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const requests = await Request.find({ owner: userId })
      .populate('item', 'title images sharingType condition availability status location')
      .populate('wantedItem', 'title category location urgency')
      .populate('requester', 'name avatar trustScore rating email')
      .populate('offeredItem', 'title images condition')
      .sort({ createdAt: -1 });

    const formatted = requests.map((r) => ({
      ...r.toObject(),
      id: r._id
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      requests: formatted
    });
  } catch (error) {
    console.error('Error in getReceivedRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve received requests.'
    });
  }
};

// 4. Get Request by ID (GET /api/requests/:id)
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    const request = await Request.findById(id)
      .populate('item', 'title images category condition sharingType availability status location owner')
      .populate('wantedItem', 'title category location urgency description requester')
      .populate('requester', 'name avatar trustScore rating')
      .populate('owner', 'name avatar trustScore rating')
      .populate('offeredItem', 'title images category condition location availability description')
      .populate('transaction')
      .populate('conversation');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    // Only requester, owner, or admin can view
    const isRequester = request.requester?._id?.toString() === userId?.toString();
    const isOwner = request.owner?._id?.toString() === userId?.toString();
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'ADMIN';

    if (!isRequester && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this request.'
      });
    }

    // Auto-link or resolve conversation if request is accepted but conversation reference not populated
    let conversationId = request.conversation?._id || request.conversation;
    if (!conversationId && (request.status === 'ACCEPTED' || request.status === 'COMPLETED')) {
      try {
        const conv = await conversationService.getOrCreateConversationForRequest({
          requestId: request._id,
          transactionId: request.transaction?._id || request.transaction
        });
        if (conv) {
          conversationId = conv._id;
          request.conversation = conv;
        }
      } catch (convErr) {
        console.warn('Could not auto-create conversation for accepted request:', convErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      request: {
        ...request.toObject(),
        id: request._id
      }
    });
  } catch (error) {
    console.error('Error in getRequestById:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load request details.'
    });
  }
};

// 5. Accept Request (PATCH /api/requests/:id/accept)
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    // Verify authenticated user is the item owner
    if (request.owner.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can accept this request.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request is already marked as ${request.status.toLowerCase()}.`
      });
    }

    // If there is an item, check that it's still available
    let item = null;
    if (request.item) {
      item = await Item.findById(request.item);
      if (item && item.availability === 'Unavailable') {
        return res.status(400).json({
          success: false,
          message: 'The item is no longer available to fulfill this request.'
        });
      }
    }

    // Determine transaction type
    let txType = 'FREE';
    if (request.type === 'BORROW') {
      txType = 'BORROW';
    } else if (request.type === 'EXCHANGE') {
      txType = 'EXCHANGE';
    } else if (item && item.sharingType === 'borrow') {
      txType = 'BORROW';
    } else if (item && item.sharingType === 'exchange') {
      txType = 'EXCHANGE';
    } else if (item && item.sharingType === 'give_away') {
      txType = 'GIVEAWAY';
    } else {
      txType = 'FREE';
    }

    // Check if a transaction already exists for this request
    let transaction = await Transaction.findOne({ request: request._id });
    if (!transaction) {
      transaction = new Transaction({
        request: request._id,
        item: request.item,
        offeredItem: request.offeredItem || null,
        owner: request.owner,
        recipient: request.requester,
        type: txType,
        status: 'PENDING_HANDOVER',
        expectedReturnDate: request.expectedReturnDate || null,
        handoverLocation: {
          city: (item && item.location?.city) || '',
          locality: (item && item.location?.locality) || '',
          meetingArea: ''
        }
      });
      await transaction.save();
    }

    // Reserve item so other users cannot request it
    if (item) {
      item.availability = 'Reserved';
      await item.save();
    }
    if (request.offeredItem) {
      await Item.findByIdAndUpdate(request.offeredItem, { availability: 'Reserved' });
    }

    request.status = 'ACCEPTED';
    request.acceptedAt = new Date();
    request.transaction = transaction._id;

    // Automatically create or retrieve legitimate LOOOP conversation
    let conversation = null;
    try {
      conversation = await conversationService.getOrCreateConversationForRequest({
        request,
        requestId: request._id,
        transactionId: transaction._id
      });
      request.conversation = conversation._id;
      transaction.conversation = conversation._id;
      await transaction.save();
    } catch (convErr) {
      console.error('Conversation establishment error:', convErr);
    }

    await request.save();

    await request.populate([
      { path: 'item', select: 'title images category condition sharingType availability status location owner' },
      { path: 'wantedItem', select: 'title category location urgency description' },
      { path: 'requester', select: 'name avatar trustScore rating' },
      { path: 'owner', select: 'name avatar trustScore rating' },
      { path: 'offeredItem', select: 'title images category condition location availability' },
      { path: 'transaction' },
      { path: 'conversation' }
    ]);

    // Trigger real notification for requester
    notificationService.notifyRequestAccepted({
      request,
      item,
      actor: req.user,
      transaction,
      conversation
    }).catch((err) => console.error('Notification trigger error:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Request accepted successfully. Handover coordination and messaging are now open.',
      request: {
        ...request.toObject(),
        id: request._id,
        conversationId: conversation?._id || request.conversation?._id || request.conversation
      },
      transaction: {
        ...transaction.toObject(),
        id: transaction._id,
        conversationId: conversation?._id || transaction.conversation
      },
      conversation: conversation ? {
        ...conversation.toObject(),
        id: conversation._id
      } : null,
      conversationId: conversation?._id || null
    });
  } catch (error) {
    console.error('Error in acceptRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to accept request.'
    });
  }
};

// 6. Decline Request (PATCH /api/requests/:id/decline)
exports.declineRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    // Verify authenticated user is the item owner
    if (request.owner.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can decline this request.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request is already marked as ${request.status.toLowerCase()}.`
      });
    }

    request.status = 'DECLINED';
    request.declinedAt = new Date();
    await request.save();

    await request.populate([
      { path: 'item', select: 'title images category condition sharingType availability status location owner' },
      { path: 'wantedItem', select: 'title category location urgency description' },
      { path: 'requester', select: 'name avatar trustScore rating' },
      { path: 'owner', select: 'name avatar trustScore rating' },
      { path: 'offeredItem', select: 'title images category condition location availability' }
    ]);

    // Trigger notification for requester
    notificationService.notifyRequestDeclined({
      request,
      item: request.item,
      actor: req.user
    }).catch((err) => console.error('Notification trigger error:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Request declined.',
      request: {
        ...request.toObject(),
        id: request._id
      }
    });
  } catch (error) {
    console.error('Error in declineRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to decline request.'
    });
  }
};

// 7. Cancel Request (PATCH /api/requests/:id/cancel)
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.'
      });
    }

    // Verify authenticated user is the requester
    if (request.requester.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this request.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status.toLowerCase()}.`
      });
    }

    request.status = 'CANCELLED';
    request.cancelledAt = new Date();
    await request.save();

    await request.populate([
      { path: 'item', select: 'title images category condition sharingType availability status location owner' },
      { path: 'wantedItem', select: 'title category location urgency description' },
      { path: 'requester', select: 'name avatar trustScore rating' },
      { path: 'owner', select: 'name avatar trustScore rating' },
      { path: 'offeredItem', select: 'title images category condition location availability' }
    ]);

    // Trigger notification for owner
    notificationService.notifyRequestCancelled({
      request,
      item: request.item,
      actor: req.user
    }).catch((err) => console.error('Notification trigger error:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Your request has been cancelled.',
      request: {
        ...request.toObject(),
        id: request._id
      }
    });
  } catch (error) {
    console.error('Error in cancelRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to cancel request.'
    });
  }
};
