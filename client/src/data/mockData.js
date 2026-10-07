/**
 * Realistic Mock Data Engine for Looop
 * Structured for seamless replacement with REST API responses in future phases
 */

export const mockCategories = [
  { id: 'books', name: 'Books & Literature', icon: 'BookOpen', count: 42 },
  { id: 'electronics', name: 'Electronics & Gadgets', icon: 'Laptop', count: 38 },
  { id: 'clothes', name: 'Clothes & Apparel', icon: 'Shirt', count: 56 },
  { id: 'furniture', name: 'Furniture & Living', icon: 'Armchair', count: 24 },
  { id: 'games', name: 'Games & Hobbies', icon: 'Gamepad2', count: 31 },
  { id: 'sports', name: 'Sports & Fitness', icon: 'Trophy', count: 29 },
  { id: 'kitchen', name: 'Kitchen & Dining', icon: 'Utensils', count: 35 },
  { id: 'education', name: 'Education & Study', icon: 'GraduationCap', count: 48 },
  { id: 'tools', name: 'Tools & DIY', icon: 'Wrench', count: 19 }
];

export const mockUsers = {
  currentUser: {
    id: 'usr-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Indiranagar, Bengaluru',
    memberSince: 'March 2024',
    trustScore: 96,
    totalRatings: 4.9,
    reviewCount: 28,
    successfulShares: 19,
    itemsGiven: 12,
    itemsBorrowed: 4,
    itemsExchanged: 3,
    badges: [
      { id: 'first_share', name: 'First Share', description: 'Shared first item on Looop', icon: 'Sparkles', color: '#10b981' },
      { id: 'community_helper', name: 'Community Helper', description: 'Helped 10+ people in community', icon: 'Heart', color: '#3b82f6' },
      { id: 'super_sharer', name: 'Super Sharer', description: 'Maintained 95%+ trust score', icon: 'Award', color: '#f59e0b' },
      { id: 'knowledge_sharer', name: 'Knowledge Sharer', description: 'Shared 5+ educational resources', icon: 'BookOpen', color: '#8b5cf6' }
    ]
  },
  adminUser: {
    id: 'adm-001',
    name: 'Priya Patel (Admin)',
    email: 'admin@looop.community',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'Looop Operations Center'
  }
};

export const mockItems = [
  {
    id: 'item-01',
    title: 'Casio FX-991ES Plus Scientific Calculator',
    description: 'Natural textbook display, 417 functions. Used for 2 semesters in engineering exams, perfectly functioning with fresh battery and slide-on hard case.',
    category: 'education',
    condition: 'like_new',
    sharingType: 'borrow',
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Koramangala 4th Block, Bengaluru (~1.2 km)',
    city: 'Bengaluru',
    availability: 'Available now (Borrow up to 3 months)',
    expiry: '2026-11-30',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-102',
      name: 'Rohan Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      trustScore: 98,
      rating: 4.9,
      reviewsCount: 34,
      responseRate: '15 mins'
    },
    createdAt: '2026-09-08T10:30:00Z',
    viewsCount: 142,
    savesCount: 18
  },
  {
    id: 'item-02',
    title: 'University Physics & Calculus 14th Edition Set',
    description: 'Hardcover engineering textbooks with complete solution summaries. In good condition with minimal pencil highlighting on early chapters.',
    category: 'books',
    condition: 'good',
    sharingType: 'give_away',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'HSR Layout Sector 2, Bengaluru (~2.5 km)',
    city: 'Bengaluru',
    availability: 'Immediate handover',
    expiry: '2026-12-15',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-103',
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      trustScore: 95,
      rating: 4.8,
      reviewsCount: 22,
      responseRate: '1 hour'
    },
    createdAt: '2026-09-09T14:15:00Z',
    viewsCount: 210,
    savesCount: 31
  },
  {
    id: 'item-03',
    title: 'Ergonomic Mesh Study Chair with Lumbar Support',
    description: 'Adjustable height and 3D armrests. Moving out of apartment next month, giving away to someone who needs a comfortable study setup.',
    category: 'furniture',
    condition: 'good',
    sharingType: 'give_away',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c99dfcf33be0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Whitefield, Bengaluru (~6.8 km)',
    city: 'Bengaluru',
    availability: 'Pickup this weekend',
    expiry: '2026-10-01',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-104',
      name: 'Vikram Joshi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      trustScore: 92,
      rating: 4.7,
      reviewsCount: 16,
      responseRate: '30 mins'
    },
    createdAt: '2026-09-10T09:00:00Z',
    viewsCount: 380,
    savesCount: 54
  },
  {
    id: 'item-04',
    title: 'SS Kashmir Willow Cricket Bat with Bat Cover & Gloves',
    description: 'Pre-knocked, full-size men\'s bat, well-maintained with toe guard and grip. Ideal for weekend community tournaments. Available to borrow for match weekends.',
    category: 'sports',
    condition: 'good',
    sharingType: 'borrow',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Jayanagar 5th Block, Bengaluru (~3.4 km)',
    city: 'Bengaluru',
    availability: 'Available for short-term borrow',
    expiry: '2026-11-20',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-105',
      name: 'Karthik Rao',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      trustScore: 97,
      rating: 4.9,
      reviewsCount: 29,
      responseRate: '45 mins'
    },
    createdAt: '2026-09-07T16:20:00Z',
    viewsCount: 175,
    savesCount: 12
  },
  {
    id: 'item-05',
    title: 'Anker Soundcore 2 Portable Bluetooth Speaker',
    description: '12W stereo sound, 24-hour battery life, IPX7 waterproof. Wanting to exchange for a mechanical keyboard or guitar tuner.',
    category: 'electronics',
    condition: 'like_new',
    sharingType: 'exchange',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Indiranagar 100ft Road, Bengaluru (~0.9 km)',
    city: 'Bengaluru',
    availability: 'Looking for exchange',
    expiry: '2026-10-31',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-101', // Current user's shared item
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      trustScore: 96,
      rating: 4.9,
      reviewsCount: 28,
      responseRate: '10 mins'
    },
    createdAt: '2026-09-10T18:00:00Z',
    viewsCount: 198,
    savesCount: 24
  },
  {
    id: 'item-06',
    title: 'Adjustable LED Desk Lamp with 5 Brightness Modes',
    description: 'Touch control, USB charging port, eye-protection warm/cool lighting. In brand new condition with original box.',
    category: 'education',
    condition: 'new',
    sharingType: 'give_away',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'BTM Layout 2nd Stage, Bengaluru (~4.1 km)',
    city: 'Bengaluru',
    availability: 'Ready for handover',
    expiry: '2026-11-15',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-106',
      name: 'Meera Sen',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      trustScore: 94,
      rating: 4.8,
      reviewsCount: 19,
      responseRate: '2 hours'
    },
    createdAt: '2026-09-11T08:00:00Z',
    viewsCount: 245,
    savesCount: 41
  },
  {
    id: 'item-07',
    title: 'Catan (Settlers of Catan) 5th Edition Board Game',
    description: 'Complete base set with all resource cards, wooden settlement pieces, tiles, and dice. Pristine condition. Looking to exchange for Ticket to Ride or Wingspan.',
    category: 'games',
    condition: 'like_new',
    sharingType: 'exchange',
    images: [
      'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Malleshwaram, Bengaluru (~5.2 km)',
    city: 'Bengaluru',
    availability: 'Exchange or lend for weekend game nights',
    expiry: '2026-10-25',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-107',
      name: 'Nikhil Saxena',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      trustScore: 99,
      rating: 5.0,
      reviewsCount: 42,
      responseRate: '20 mins'
    },
    createdAt: '2026-09-06T12:00:00Z',
    viewsCount: 160,
    savesCount: 27
  },
  {
    id: 'item-08',
    title: 'Bosch Professional Cordless Impact Drill & Bit Set',
    description: '18V cordless drill with 2 lithium-ion batteries, charger, and 33-piece masonry/wood drill bit case. Available for 2-3 day DIY home improvement projects.',
    category: 'tools',
    condition: 'good',
    sharingType: 'borrow',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'JP Nagar Phase 3, Bengaluru (~3.9 km)',
    city: 'Bengaluru',
    availability: 'Borrow for short DIY projects',
    expiry: '2026-12-31',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-108',
      name: 'Sunil Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      trustScore: 96,
      rating: 4.8,
      reviewsCount: 31,
      responseRate: '35 mins'
    },
    createdAt: '2026-09-05T15:45:00Z',
    viewsCount: 290,
    savesCount: 38
  },
  {
    id: 'item-09',
    title: 'Wildcraft 55L Trekking Rucksack with Rain Cover',
    description: 'Internal frame hiking backpack with padded hip belt. Used for one Himalayas trek, thoroughly cleaned and in great condition.',
    category: 'sports',
    condition: 'like_new',
    sharingType: 'borrow',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80'
    ],
    location: 'Koramangala 1st Block, Bengaluru (~1.8 km)',
    city: 'Bengaluru',
    availability: 'Borrow for upcoming weekend treks',
    expiry: '2026-11-10',
    status: 'AVAILABLE',
    owner: {
      id: 'usr-109',
      name: 'Deepa Menon',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      trustScore: 93,
      rating: 4.7,
      reviewsCount: 14,
      responseRate: '1 hour'
    },
    createdAt: '2026-09-09T11:00:00Z',
    viewsCount: 130,
    savesCount: 19
  }
];

export const mockWantedItems = [
  {
    id: 'wnt-01',
    title: 'Scientific Calculator for Semester Exams',
    description: 'Need a scientific calculator (Casio 991ES or similar) for upcoming electrical engineering finals. Will return in excellent condition within 2 weeks.',
    category: 'education',
    location: 'Indiranagar, Bengaluru',
    postedBy: {
      id: 'usr-101',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    status: 'OPEN',
    createdAt: '2026-09-10T11:00:00Z',
    matchedItemId: 'item-01',
    matchScore: 94,
    matchedItemTitle: 'Casio FX-991ES Plus Scientific Calculator'
  },
  {
    id: 'wnt-02',
    title: 'Mechanical Keyboard (Tenkeyless) for Coding Practice',
    description: 'Looking to borrow or exchange for study setup. Open to Blue/Brown switches.',
    category: 'electronics',
    location: 'Koramangala, Bengaluru',
    postedBy: {
      id: 'usr-110',
      name: 'Varun Hegde',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    status: 'OPEN',
    createdAt: '2026-09-08T15:30:00Z',
    matchedItemId: 'item-05',
    matchScore: 82,
    matchedItemTitle: 'Anker Soundcore 2 Portable Bluetooth Speaker'
  },
  {
    id: 'wnt-03',
    title: 'Basic Tool Kit / Screwdriver Set',
    description: 'Need basic tools to assemble an IKEA bookshelf over the weekend.',
    category: 'tools',
    location: 'HSR Layout, Bengaluru',
    postedBy: {
      id: 'usr-111',
      name: 'Sneha Kapur',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    status: 'OPEN',
    createdAt: '2026-09-09T09:45:00Z',
    matchedItemId: 'item-08',
    matchScore: 89,
    matchedItemTitle: 'Bosch Professional Cordless Impact Drill & Bit Set'
  }
];

export const mockRequests = {
  incoming: [
    {
      id: 'req-in-01',
      itemId: 'item-05',
      itemTitle: 'Anker Soundcore 2 Portable Bluetooth Speaker',
      sharingType: 'exchange',
      requester: {
        id: 'usr-112',
        name: 'Tanvi Nair',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        trustScore: 97,
        rating: 4.9
      },
      message: 'Hi Aarav! I saw your speaker listing. I have a Keychron K2 mechanical keyboard (Brown switches, pristine condition) that I would love to exchange if you are interested!',
      date: '2026-09-11T14:20:00Z',
      status: 'PENDING'
    },
    {
      id: 'req-in-02',
      itemId: 'item-05',
      itemTitle: 'Anker Soundcore 2 Portable Bluetooth Speaker',
      sharingType: 'exchange',
      requester: {
        id: 'usr-113',
        name: 'Aditya Kulkarni',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
        trustScore: 88,
        rating: 4.6
      },
      message: 'Hey, would you be interested in exchanging for a Sony studio headphone set?',
      date: '2026-09-10T19:10:00Z',
      status: 'PENDING'
    }
  ],
  sent: [
    {
      id: 'req-sent-01',
      itemId: 'item-01',
      itemTitle: 'Casio FX-991ES Plus Scientific Calculator',
      sharingType: 'borrow',
      owner: {
        id: 'usr-102',
        name: 'Rohan Verma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        trustScore: 98
      },
      message: 'Hi Rohan, I saw your calculator listing. I have my final semester engineering math exam next Tuesday and would be grateful to borrow it for 5 days. I live in Indiranagar, close to Koramangala.',
      date: '2026-09-10T12:30:00Z',
      status: 'ACCEPTED'
    },
    {
      id: 'req-sent-02',
      itemId: 'item-02',
      itemTitle: 'University Physics & Calculus 14th Edition Set',
      sharingType: 'give_away',
      owner: {
        id: 'usr-103',
        name: 'Ananya Deshmukh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        trustScore: 95
      },
      message: 'Hello Ananya, I would love to pick up this book set for my younger cousin who just joined mechanical engineering.',
      date: '2026-09-09T16:00:00Z',
      status: 'COMPLETED'
    }
  ]
};

export const mockConversations = [
  {
    id: 'conv-01',
    participant: {
      id: 'usr-102',
      name: 'Rohan Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      online: true,
      lastSeen: 'Active now'
    },
    itemContext: {
      id: 'item-01',
      title: 'Casio FX-991ES Plus Calculator',
      status: 'ACCEPTED'
    },
    lastMessage: 'Sounds great Aarav! Let us meet tomorrow at 5 PM near Sony World Signal.',
    lastMessageTime: '10 mins ago',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-01',
        senderId: 'usr-101',
        text: 'Hi Rohan! Thanks for accepting my request for the calculator.',
        time: 'Yesterday 4:30 PM',
        isOwn: true
      },
      {
        id: 'msg-02',
        senderId: 'usr-102',
        text: 'Glad to help! Where would you prefer to pick it up?',
        time: 'Yesterday 4:35 PM',
        isOwn: false
      },
      {
        id: 'msg-03',
        senderId: 'usr-101',
        text: 'Could we do Koramangala 4th block or near Sony World Signal?',
        time: 'Yesterday 4:40 PM',
        isOwn: true
      },
      {
        id: 'msg-04',
        senderId: 'usr-102',
        text: 'Sounds great Aarav! Let us meet tomorrow at 5 PM near Sony World Signal.',
        time: '10 mins ago',
        isOwn: false
      }
    ]
  },
  {
    id: 'conv-02',
    participant: {
      id: 'usr-112',
      name: 'Tanvi Nair',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      online: false,
      lastSeen: '1 hour ago'
    },
    itemContext: {
      id: 'item-05',
      title: 'Anker Bluetooth Speaker (Exchange)',
      status: 'PENDING'
    },
    lastMessage: 'I can send you photos of the Keychron keyboard whenever you are ready.',
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-10',
        senderId: 'usr-112',
        text: 'Hi Aarav, sent a request to exchange your Anker speaker with my Keychron mechanical keyboard.',
        time: '2 hours ago',
        isOwn: false
      },
      {
        id: 'msg-11',
        senderId: 'usr-112',
        text: 'I can send you photos of the Keychron keyboard whenever you are ready.',
        time: '2 hours ago',
        isOwn: false
      }
    ]
  }
];

export const mockNotifications = [
  {
    id: 'notif-01',
    type: 'request',
    title: 'New Exchange Request',
    message: 'Tanvi Nair requested to exchange your Anker Soundcore Bluetooth Speaker.',
    time: '2 hours ago',
    unread: true,
    link: '/customer/requests'
  },
  {
    id: 'notif-02',
    type: 'match',
    title: 'Smart Match Found (94%)',
    message: 'Your wanted item "Scientific Calculator" matches Rohan Verma\'s Casio FX-991ES listing nearby.',
    time: 'Yesterday',
    unread: true,
    link: '/customer/wanted'
  },
  {
    id: 'notif-03',
    type: 'review',
    title: 'New 5-Star Review Received',
    message: 'Ananya Deshmukh left you a 5-star review: "Aarav was punctual and wonderful to connect with!"',
    time: '2 days ago',
    unread: false,
    link: '/customer/profile'
  },
  {
    id: 'notif-04',
    type: 'system',
    title: 'New Badge Unlocked: Community Helper',
    message: 'Congratulations! You have completed 10+ shares in the Looop community.',
    time: '3 days ago',
    unread: false,
    link: '/customer/profile'
  }
];

export const mockAdminStats = {
  totalUsers: 1420,
  activeUsers: 890,
  totalItems: 3120,
  availableItems: 1845,
  completedShares: 1275,
  pendingReports: 4,
  openWantedRequests: 168,
  recentActivity: [
    { id: 'act-1', event: 'Completed Handover', user: 'Rohan V. → Aarav S.', item: 'Casio Calculator', time: '12 mins ago', type: 'success' },
    { id: 'act-2', event: 'New Listing Added', user: 'Meera Sen', item: 'LED Desk Lamp', time: '45 mins ago', type: 'info' },
    { id: 'act-3', event: 'Report Submitted', user: 'Pooja K.', item: 'Reported duplicate listing', time: '2 hours ago', type: 'warning' },
    { id: 'act-4', event: 'User Verified', user: 'Vikram Joshi', item: 'Email & Community Trust Verified', time: '3 hours ago', type: 'info' }
  ],
  usersList: [
    { id: 'u-1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', role: 'USER', trust: 96, status: 'Active', itemsCount: 3, joined: 'March 2024' },
    { id: 'u-2', name: 'Rohan Verma', email: 'rohan.v@example.com', role: 'USER', trust: 98, status: 'Active', itemsCount: 7, joined: 'January 2024' },
    { id: 'u-3', name: 'Deepak Rao', email: 'deepak.spam@mail.com', role: 'USER', trust: 42, status: 'Suspended', itemsCount: 0, joined: 'August 2026' },
    { id: 'u-4', name: 'Ananya Deshmukh', email: 'ananya.d@example.com', role: 'USER', trust: 95, status: 'Active', itemsCount: 5, joined: 'February 2024' },
    { id: 'u-5', name: 'Kunal Singhania', email: 'kunal.s@example.com', role: 'USER', trust: 30, status: 'Blocked', itemsCount: 1, joined: 'June 2026' }
  ],
  reportsList: [
    { id: 'rep-1', reason: 'Misleading description', item: 'Vintage Radio', reporter: 'Pooja K.', status: 'PENDING', date: '2026-09-11' },
    { id: 'rep-2', reason: 'Unresponsive after accepting borrow', item: 'Guitar Amp', reporter: 'Karthik R.', status: 'INVESTIGATING', date: '2026-09-10' },
    { id: 'rep-3', reason: 'Prohibited item (Commercial sales)', item: 'Bulk wholesale socks', reporter: 'Sunil K.', status: 'RESOLVED', date: '2026-09-08' }
  ]
};

export const mockCommunityImpact = {
  itemsReused: '1,275+',
  peopleHelped: '850+',
  booksShared: '420+',
  electronicsShared: '310+',
  clothesShared: '190+',
  co2SavedKg: '3,840 kg'
};

export const mockTransactions = [
  {
    id: 'tx-01',
    itemId: 'item-01',
    itemTitle: 'Casio FX-991ES Plus Scientific Calculator',
    sharingType: 'borrow',
    owner: {
      id: 'usr-102',
      name: 'Rohan Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      trustScore: 98
    },
    receiver: {
      id: 'usr-101',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    status: 'SCHEDULED',
    scheduledDate: 'Tomorrow at 5:00 PM',
    location: 'Near Sony World Signal, Koramangala 4th Block',
    handoverCode: 'LP-8429',
    returnDueDate: 'Oct 15, 2026',
    ownerConfirmed: true,
    receiverConfirmed: false
  },
  {
    id: 'tx-02',
    itemId: 'item-02',
    itemTitle: 'University Physics & Calculus 14th Edition Set',
    sharingType: 'give_away',
    owner: {
      id: 'usr-103',
      name: 'Ananya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      trustScore: 95
    },
    receiver: {
      id: 'usr-101',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    status: 'COMPLETED',
    scheduledDate: 'Sept 9, 2026',
    location: 'HSR Layout Sector 2, near BDA Complex',
    handoverCode: 'LP-3104',
    ownerConfirmed: true,
    receiverConfirmed: true
  },
  {
    id: 'tx-03',
    itemId: 'item-05',
    itemTitle: 'Anker Soundcore 2 Portable Bluetooth Speaker',
    sharingType: 'exchange',
    owner: {
      id: 'usr-101',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    receiver: {
      id: 'usr-112',
      name: 'Tanvi Nair',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      trustScore: 97
    },
    status: 'IN_COORDINATION',
    scheduledDate: 'Tentative this weekend',
    location: 'Indiranagar Metro Station Gate 2',
    handoverCode: 'LP-9921',
    exchangeItem: 'Keychron K2 Mechanical Keyboard',
    ownerConfirmed: false,
    receiverConfirmed: false
  },
  {
    id: 'tx-04',
    itemId: 'item-08',
    itemTitle: 'Bosch Cordless Impact Drill & Bit Set',
    sharingType: 'borrow',
    owner: {
      id: 'usr-108',
      name: 'Sunil Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      trustScore: 96
    },
    receiver: {
      id: 'usr-110',
      name: 'Varun Hegde',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    status: 'COMPLETED',
    scheduledDate: 'Sept 4, 2026',
    location: 'JP Nagar Phase 3',
    handoverCode: 'LP-7712',
    ownerConfirmed: true,
    receiverConfirmed: true
  }
];

export const mockReviewsData = {
  received: [
    {
      id: 'rev-rec-1',
      author: {
        name: 'Rohan Verma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        trustScore: 98
      },
      itemTitle: 'Casio FX-991ES Plus Calculator',
      sharingType: 'borrow',
      rating: 5,
      date: '3 days ago',
      comment: 'Aarav was punctual and returned the calculator in flawless condition. Reliable community member!'
    },
    {
      id: 'rev-rec-2',
      author: {
        name: 'Ananya Deshmukh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        trustScore: 95
      },
      itemTitle: 'Engineering Physics & Calculus Set',
      sharingType: 'give_away',
      rating: 5,
      date: '1 week ago',
      comment: 'Very polite, picked up the book promptly. Glad to see these books continue helping students.'
    },
    {
      id: 'rev-rec-3',
      author: {
        name: 'Sunil Kumar',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
        trustScore: 96
      },
      itemTitle: 'Cordless Impact Drill Set',
      sharingType: 'borrow',
      rating: 4.8,
      date: '2 weeks ago',
      comment: 'Smooth handover, clean drill bits returned on time.'
    }
  ],
  submitted: [
    {
      id: 'rev-sub-1',
      recipient: {
        name: 'Ananya Deshmukh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
      },
      itemTitle: 'Engineering Physics & Calculus Set',
      sharingType: 'give_away',
      rating: 5,
      date: '1 week ago',
      comment: 'Ananya was generous and the books were packed neatly. My cousin is already studying from them!'
    },
    {
      id: 'rev-sub-2',
      recipient: {
        name: 'Sunil Kumar',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
      },
      itemTitle: 'Bosch Cordless Drill',
      sharingType: 'borrow',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Sunil was helpful in demonstrating the chuck settings. High-quality tool that saved my weekend IKEA assembly.'
    }
  ]
};

export const mockAnalyticsData = {
  monthlyShares: [
    { month: 'Jan', shares: 82 },
    { month: 'Feb', shares: 115 },
    { month: 'Mar', shares: 140 },
    { month: 'Apr', shares: 165 },
    { month: 'May', shares: 198 },
    { month: 'Jun', shares: 245 },
    { month: 'Jul', shares: 310 },
    { month: 'Aug', shares: 380 },
    { month: 'Sep', shares: 425 }
  ],
  categoryBreakdown: [
    { category: 'Education & Study', count: 420, percent: 33 },
    { category: 'Electronics & Tech', count: 310, percent: 24 },
    { category: 'Books & Literature', count: 280, percent: 22 },
    { category: 'Sports & Fitness', count: 145, percent: 11 },
    { category: 'Tools & DIY', count: 120, percent: 10 }
  ],
  neighborhoodHotspots: [
    { area: 'Indiranagar', shares: 342, activeUsers: 218 },
    { area: 'Koramangala', shares: 298, activeUsers: 194 },
    { area: 'HSR Layout', shares: 246, activeUsers: 162 },
    { area: 'BTM Layout', shares: 210, activeUsers: 140 },
    { area: 'Whitefield', shares: 179, activeUsers: 116 }
  ]
};

export const mockSavedItemIds = ['item-01', 'item-04', 'item-07'];
