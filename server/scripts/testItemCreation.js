const { connectPostgres, query } = require('../config/postgres');
const itemController = require('../controllers/itemController');

async function testItemCreationFlow() {
  console.log('--- Testing Product Sharing & Database Storage Flow ---');
  await connectPostgres();

  const req = {
    user: {
      id: 'usr-demo-001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@looop.community',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
    },
    body: {
      title: 'Sony WH-1000XM5 Headphones (Black)',
      description: 'Barely used Sony wireless noise-canceling headphones with original box and cable. Shared with community.',
      category: 'electronics',
      subcategory: 'Audio',
      brand: 'Sony',
      model: 'WH-1000XM5',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', isPrimary: true, caption: 'Front View' }
      ],
      sharingType: 'give_away',
      condition: 'like_new',
      location: {
        city: 'Bengaluru',
        locality: 'Indiranagar',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        approximateAddress: 'Indiranagar 100ft Road, Bengaluru'
      },
      coordinates: [77.6408, 12.9784]
    }
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      console.log(`[HTTP Response ${this.statusCode}]:`, JSON.stringify(data, null, 2));
      return this;
    }
  };

  await itemController.createItem(req, res);

  // Verify item is saved in PostgreSQL database
  const createdId = res.data?.item?.id || res.data?.item?._id;
  if (createdId) {
    const dbCheck = await query('SELECT * FROM items WHERE id = $1', [createdId]);
    console.log('\n✔ PostgreSQL Database Verification:');
    console.log('Item stored in DB:', dbCheck.rows[0]?.title);
    const photos = typeof dbCheck.rows[0]?.images === 'string' ? JSON.parse(dbCheck.rows[0].images) : dbCheck.rows[0]?.images;
    console.log('Photo stored in DB:', photos);
    console.log('Owner stored in DB:', dbCheck.rows[0]?.owner_id);
    console.log('City stored in DB:', dbCheck.rows[0]?.city);
  }

  process.exit(0);
}

testItemCreationFlow().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
