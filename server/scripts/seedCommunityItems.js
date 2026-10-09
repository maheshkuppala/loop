const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectPostgres, query: pgQuery } = require('../config/postgres');
const User = require('../models/User');
const Item = require('../models/Item');
require('dotenv').config();

const SAMPLE_USERS = [
  {
    id: 'usr-demo-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@looop.community',
    role: 'customer',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    state: 'Karnataka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    trustScore: 98,
    rating: 4.9
  },
  {
    id: 'usr-demo-002',
    name: 'Priya Patel',
    email: 'priya.patel@looop.community',
    role: 'customer',
    city: 'Mumbai',
    locality: 'Bandra West',
    state: 'Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    trustScore: 96,
    rating: 4.8
  },
  {
    id: 'usr-demo-003',
    name: 'Anish Verma',
    email: 'anish.verma@looop.community',
    role: 'customer',
    city: 'Delhi',
    locality: 'Connaught Place',
    state: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    trustScore: 99,
    rating: 5.0
  }
];

const SAMPLE_ITEMS = [
  {
    id: 'item-demo-101',
    title: 'Casio FX-991EX ClassWiz Scientific Calculator',
    description: 'High-resolution ClassWiz scientific calculator, ideal for engineering, mathematics, and science coursework. Solar & battery powered, includes original slide cover.',
    category: 'books',
    subcategory: 'Engineering',
    brand: 'Casio',
    model: 'FX-991EX',
    images: [
      { url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80', isPrimary: true, caption: 'Front view' }
    ],
    sharingType: 'give_away',
    condition: 'like_new',
    availability: 'Available',
    status: 'active',
    approvalStatus: 'APPROVED',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    approximateAddress: 'Indiranagar, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    ownerIdx: 0
  },
  {
    id: 'item-demo-102',
    title: 'Solid Teak Wooden Study Desk & Adjustable Chair',
    description: 'Sturdy solid teak wooden study table with 2 drawers and matching ergonomic chair. Great condition, perfect for home office or study room.',
    category: 'furniture',
    subcategory: 'Desks',
    brand: 'IKEA',
    model: 'Hemnes',
    images: [
      { url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80', isPrimary: true, caption: 'Desk overview' }
    ],
    sharingType: 'free',
    condition: 'good',
    availability: 'Available',
    status: 'active',
    approvalStatus: 'APPROVED',
    city: 'Bengaluru',
    locality: 'Whitefield',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    approximateAddress: 'Whitefield, Bengaluru',
    lat: 12.9698,
    lng: 77.7500,
    ownerIdx: 0
  },
  {
    id: 'item-demo-103',
    title: 'Bosch Professional Cordless Power Drill Set (18V)',
    description: 'Complete Bosch 18V cordless power drill with 2 lithium-ion battery packs, charger, and 30-piece drill & screwdriver bit set in hard case.',
    category: 'tools',
    subcategory: 'Power Tools',
    brand: 'Bosch',
    model: 'GSB 180-LI',
    images: [
      { url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', isPrimary: true, caption: 'Drill set' }
    ],
    sharingType: 'borrow',
    borrowMaxDays: 14,
    borrowMaxUnit: 'days',
    borrowNotes: 'Please return in original carrying case with all drill bits intact.',
    condition: 'like_new',
    availability: 'Available',
    status: 'active',
    approvalStatus: 'APPROVED',
    city: 'Bengaluru',
    locality: 'Koramangala',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    approximateAddress: 'Koramangala, Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    ownerIdx: 0
  },
  {
    id: 'item-demo-104',
    title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
    description: 'Premium wireless over-ear noise-canceling headphones with 30-hour battery life and multi-point Bluetooth pairing. Includes travel case & 3.5mm aux cable.',
    category: 'electronics',
    subcategory: 'Audio',
    brand: 'Sony',
    model: 'WH-1000XM4',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', isPrimary: true, caption: 'Headphones' }
    ],
    sharingType: 'exchange',
    exchangeWantedItems: 'Interested in mechanical keyboard or Kindle Paperwhite',
    condition: 'like_new',
    availability: 'Available',
    status: 'active',
    approvalStatus: 'APPROVED',
    city: 'Mumbai',
    locality: 'Bandra West',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    approximateAddress: 'Bandra West, Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    ownerIdx: 1
  },
  {
    id: 'item-demo-105',
    title: 'Data Structures & Algorithms in C++ (4th Edition)',
    description: 'Comprehensive computer science engineering textbook by Adam Drozdek. Excellent condition, clean pages with zero markings or highlights.',
    category: 'books',
    subcategory: 'Engineering',
    brand: 'Cengage',
    model: '4th Edition',
    images: [
      { url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=80', isPrimary: true, caption: 'Book cover' }
    ],
    sharingType: 'give_away',
    condition: 'new',
    availability: 'Available',
    status: 'active',
    approvalStatus: 'APPROVED',
    city: 'Mumbai',
    locality: 'Andheri East',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    approximateAddress: 'Andheri East, Mumbai',
    lat: 19.1136,
    lng: 72.8697,
    ownerIdx: 1
  },
  {
    id: 'item-demo-106',
    title: 'Decathlon Riverside 120 Hybrid Bicycle (21-Speed)',
    description: 'Versatile 21-speed hybrid bicycle suitable for city commuting and light trail rides. Includes front headlight, rear reflector, and bottle holder.',
    category: 'sports',
    subcategory: 'Bicycles',
    brand: 'Decathlon',
    model: 'Riverside 120',
    images: [
      { url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80', isPrimary: true, caption: 'Hybrid bicycle' }
    ],
    sharingType: 'borrow',
    borrowMaxDays: 7,
    borrowMaxUnit: 'days',
    borrowNotes: 'Helmet provided upon request. Please lock securely when parked.',
    condition: 'good',
    availability: 'Available',
    status: 'active',
    approvalStatus: 'APPROVED',
    city: 'Delhi',
    locality: 'Connaught Place',
    state: 'Delhi',
    district: 'New Delhi',
    approximateAddress: 'Connaught Place, Delhi',
    lat: 28.6315,
    lng: 77.2167,
    ownerIdx: 2
  }
];

async function seedItems() {
  console.log('=== LOOOP COMMUNITY ITEMS SEEDER ===');

  // Initialize PostgreSQL pool
  await connectPostgres();

  // 1. Connect MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/looop';
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB:', mongoUri);
    }
  } catch (err) {
    console.warn('MongoDB connection notice:', err.message);
  }

  const hashedPassword = await bcrypt.hash('Demo@12345', 10);
  const createdUserDocs = [];

  // 2. Seed Users in Neon PG + Mongo
  for (const uData of SAMPLE_USERS) {
    // Neon PG user insert
    try {
      await pgQuery(
        `INSERT INTO users (id, name, email, password, role, avatar, city, state, locality, account_status, trust_score, rating, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar;`,
        [uData.id, uData.name, uData.email, hashedPassword, uData.role, uData.avatar, uData.city, uData.state, uData.locality, uData.trustScore, uData.rating]
      );
    } catch (pgUserErr) {
      console.warn('PG User seed warning:', pgUserErr.message);
    }

    // Mongo user insert
    if (mongoose.connection.readyState === 1) {
      try {
        let mongoUser = await User.findOne({ email: uData.email });
        if (!mongoUser) {
          mongoUser = await User.create({
            name: uData.name,
            email: uData.email,
            password: hashedPassword,
            role: uData.role,
            city: uData.city,
            locality: uData.locality,
            state: uData.state,
            avatar: uData.avatar,
            trustScore: uData.trustScore,
            rating: uData.rating,
            verified: true,
            accountStatus: 'active'
          });
        }
        createdUserDocs.push(mongoUser);
      } catch (mUserErr) {
        console.warn('Mongo user warning:', mUserErr.message);
      }
    }
  }

  console.log(`Seeded ${SAMPLE_USERS.length} user accounts.`);

  // 3. Seed Items in Neon PG + Mongo
  let itemsSeededCount = 0;
  for (const itemData of SAMPLE_ITEMS) {
    const ownerData = SAMPLE_USERS[itemData.ownerIdx];
    const mongoOwnerDoc = createdUserDocs[itemData.ownerIdx];

    // Neon PostgreSQL Insert
    try {
      await pgQuery(
        `INSERT INTO items (
          id, title, description, category, subcategory, brand, model, images,
          sharing_type, condition, availability, status, city, district, state,
          locality, approximate_address, latitude, longitude, borrow_max_duration_days,
          borrow_max_duration_unit, borrow_notes, exchange_wanted_items, owner_id,
          views_count, saves_count, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8::jsonb,
          $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20,
          $21, $22, $23, $24,
          12, 4, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          availability = 'Available',
          status = 'active';`,
        [
          itemData.id,
          itemData.title,
          itemData.description,
          itemData.category,
          itemData.subcategory,
          itemData.brand,
          itemData.model,
          JSON.stringify(itemData.images),
          itemData.sharingType,
          itemData.condition,
          'Available',
          'active',
          itemData.city,
          itemData.district,
          itemData.state,
          itemData.locality,
          itemData.approximateAddress,
          itemData.lat,
          itemData.lng,
          itemData.borrowMaxDays || 14,
          itemData.borrowMaxUnit || 'days',
          itemData.borrowNotes || '',
          itemData.exchangeWantedItems || '',
          ownerData.id
        ]
      );
    } catch (pgItemErr) {
      console.warn('PG Item seed notice:', pgItemErr.message);
    }

    // MongoDB Insert
    if (mongoose.connection.readyState === 1 && mongoOwnerDoc) {
      try {
        await Item.findOneAndUpdate(
          { title: itemData.title },
          {
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            subcategory: itemData.subcategory,
            brand: itemData.brand,
            model: itemData.model,
            images: itemData.images,
            sharingType: itemData.sharingType,
            condition: itemData.condition,
            availability: 'Available',
            status: 'active',
            approvalStatus: 'APPROVED',
            location: {
              city: itemData.city,
              locality: itemData.locality,
              district: itemData.district,
              state: itemData.state,
              approximateAddress: itemData.approximateAddress
            },
            locationCoordinates: {
              type: 'Point',
              coordinates: [itemData.lng, itemData.lat]
            },
            owner: mongoOwnerDoc._id
          },
          { upsert: true, new: true }
        );
      } catch (mItemErr) {
        console.warn('Mongo Item seed notice:', mItemErr.message);
      }
    }

    itemsSeededCount++;
    console.log(`[+] Seeded Item: ${itemData.title} (${itemData.city})`);
  }

  console.log(`Successfully seeded ${itemsSeededCount} items into database!`);
  process.exit(0);
}

seedItems().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
