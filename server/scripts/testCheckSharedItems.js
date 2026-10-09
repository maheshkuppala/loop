const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
require('dotenv').config();

async function checkItemsVisibility() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/looop';
  await mongoose.connect(mongoUri);
  console.log('Connected to DB:', mongoUri);

  // Fetch active available items as if another account is browsing
  const items = await Item.find({ status: 'active', availability: 'Available' }).populate('owner', 'name email city locality');

  console.log(`\nFound ${items.length} Active & Available items for public / another account browsing:`);
  items.forEach((item, index) => {
    console.log(`\n${index + 1}. [${item.category.toUpperCase()}] "${item.title}"`);
    console.log(`   - Sharing Type: ${item.sharingType}`);
    console.log(`   - Location: ${item.location?.locality}, ${item.location?.city}`);
    console.log(`   - Owner (Sharer): ${item.owner?.name} (${item.owner?.email})`);
    console.log(`   - Status: ${item.status} | Availability: ${item.availability}`);
  });

  process.exit(0);
}

checkItemsVisibility().catch((err) => {
  console.error(err);
  process.exit(1);
});
