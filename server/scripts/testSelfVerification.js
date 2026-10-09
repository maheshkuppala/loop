const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runSelfVerification() {
  console.log('=== SELF-VERIFICATION RUNNER ===\n');

  // 1. Health check
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log('✓ Backend Health Check:', health.data?.message || 'OK');
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    process.exit(1);
  }

  // 2. Login as Demo Customer (Account 1)
  let customerToken = '';
  try {
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'customer@reusehub.demo',
        password: 'Customer@12345'
      }
    );

    if (loginRes.status !== 200) {
      throw new Error(`Status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }

    customerToken = loginRes.data?.token;
    console.log('✓ Account 1 (John Kumar) Logged In successfully! Token received.');
  } catch (err) {
    console.error('❌ Customer login failed:', err.message);
    process.exit(1);
  }

  // 3. Post a new Item from Account 1 using wizard payload
  let newItemId = null;
  const testTitle = `Scientific Calculator FX-991EX ${Date.now().toString().slice(-4)}`;
  try {
    const createRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/items',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        }
      },
      {
        title: testTitle,
        description: 'Advanced scientific calculator with solar backup panel. Ideal for engineering students.',
        category: 'electronics',
        subcategory: 'Calculators',
        brand: 'Casio',
        model: 'FX-991EX',
        sharingType: 'give_away',
        condition: 'like_new',
        location: {
          city: 'Bengaluru',
          locality: 'Indiranagar',
          approximateAddress: 'Indiranagar, Bengaluru'
        },
        coordinates: [77.6408, 12.9784],
        images: [
          { url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80', isPrimary: true }
        ]
      }
    );

    if (createRes.status !== 201) {
      throw new Error(`Status ${createRes.status}: ${JSON.stringify(createRes.data)}`);
    }

    newItemId = createRes.data?.item?.id || createRes.data?.item?._id;
    console.log(`✓ Item Successfully Created by Account 1! Title: "${testTitle}" (ID: ${newItemId})`);
  } catch (err) {
    console.error('❌ Item creation failed:', err.message);
    process.exit(1);
  }

  // 4. Query Discover Items from Another Account / Public user (Account 2 context)
  try {
    const discoverRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/items/discover?city=Bengaluru',
      method: 'GET'
    });

    const discoverItems = discoverRes.data?.items || [];
    console.log(`\n✓ Account 2 (Public Discovery) queried items in Bengaluru: Total ${discoverItems.length} items found.`);

    const foundSharedItem = discoverItems.find(i => i.title === testTitle || i.id === newItemId || i._id === newItemId);

    if (foundSharedItem) {
      console.log(' SUCCESS: The newly shared item is VISIBLE to another account/public user!');
      console.log('   - Item Title:', foundSharedItem.title);
      console.log('   - Category:', foundSharedItem.category);
      console.log('   - Sharing Type:', foundSharedItem.sharingType);
      console.log('   - Location:', foundSharedItem.location?.locality, ',', foundSharedItem.location?.city);
      console.log('   - Status:', foundSharedItem.status, '| Availability:', foundSharedItem.availability);
      console.log('   - Sharer:', foundSharedItem.owner?.name);
    } else {
      console.error('❌ Shared item was not returned in discovery results for another account.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Discovery query failed:', err.message);
    process.exit(1);
  }

  console.log('\n ALL SELF-VERIFICATION CHECKS PASSED PERFECTLY!');
  process.exit(0);
}

runSelfVerification();
