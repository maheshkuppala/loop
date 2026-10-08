const { connectPostgres, query: pgQuery } = require('../config/postgres');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const { invalidateDashboardCache } = require('../services/adminDashboardService');

async function inspectAndClean() {
  await connectPostgres();

  if (process.env.MONGO_URI || process.env.MONGODB_URI) {
    try {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      await Item.deleteMany({});
      console.log('Cleared old MongoDB items collection.');
    } catch (err) {
      console.log('MongoDB cleanup note:', err.message);
    }
  }

  // Verify that Realme 12+ exists in Neon PostgreSQL
  const pgItems = (await pgQuery('SELECT id, title, category, owner_id FROM items;')).rows;
  console.log('\nCurrent Items in Neon PostgreSQL:');
  pgItems.forEach(i => console.log(` - [${i.id}] "${i.title}"`));

  let realmeItem = pgItems.find(i => i.title.toLowerCase().includes('realme'));

  if (!realmeItem) {
    const userRes = await pgQuery('SELECT id FROM users LIMIT 1;');
    const ownerId = userRes.rows[0]?.id || 'usr-admin-01';
    const newItemId = `itm_realme_${Date.now()}`;
    const insertRes = await pgQuery(
      `INSERT INTO items (
        id, title, description, category, subcategory, brand, model,
        images, sharing_type, condition, availability, status,
        city, locality, state, approximate_address, latitude, longitude,
        owner_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8::jsonb, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19
      ) RETURNING id, title;`,
      [
        newItemId,
        'Realme 12+ 5G (Pioneer Green, 8GB RAM, 256GB Storage)',
        'Brand new Realme 12+ 5G smartphone in excellent condition. Comes with original box, 67W SUPERVOOC fast charger, and clear case. Shared with community.',
        'Electronics',
        'Smartphones',
        'Realme',
        'Realme 12+',
        JSON.stringify([{ url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80', caption: 'Realme 12+ 5G' }]),
        'give_away',
        'like_new',
        'Available',
        'active',
        'Bengaluru',
        'Indiranagar',
        'Karnataka',
        'Indiranagar, Bengaluru, Karnataka',
        12.9716,
        77.5946,
        ownerId
      ]
    );
    realmeItem = insertRes.rows[0];
  }

  // Delete all items except realmeItem.id
  await pgQuery('DELETE FROM items WHERE id != $1;', [realmeItem.id]);

  invalidateDashboardCache();

  const finalCount = await pgQuery('SELECT id, title, category, sharing_type, availability, status FROM items;');
  console.log('\n✔ Verification Complete. Only 1 item remaining in Neon PostgreSQL:');
  console.table(finalCount.rows);

  process.exit(0);
}

inspectAndClean();
