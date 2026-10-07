const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/looop';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for admin seeding');

    const adminEmail = (process.env.ADMIN_EMAIL || 'looop.support@gmail.com').toLowerCase().trim();
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.role = 'admin';
      admin.accountStatus = 'active';
      admin.verified = true;
      admin.trustScore = 100;
      await admin.save();
      console.log(`Admin account confirmed: ${admin.email} (Role: ${admin.role})`);
    } else {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Mahesh@Naidu', 10);
      admin = await User.create({
        name: 'Looop Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        accountStatus: 'active',
        verified: true,
        trustScore: 100,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        bio: 'Lead platform administrator for LOOOP community moderation and platform governance.',
        city: 'Guntur',
        state: 'Andhra Pradesh'
      });
      console.log(`Created new official admin account: ${admin.email}`);
    }

    await mongoose.disconnect();
    return admin;
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin().then(() => {
    console.log('Admin seed completed successfully.');
    process.exit(0);
  });
}

module.exports = seedAdmin;
