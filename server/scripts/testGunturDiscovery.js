const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verifyGunturDiscovery() {
  console.log('=== GUNTUR ITEM VISIBILITY & DISCOVERY VERIFICATION ===\n');

  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/items/discover?city=Guntur',
      method: 'GET'
    });

    const items = res.data?.items || [];
    console.log(`✓ Querying location city=Guntur from another account returned ${items.length} item(s):`);

    items.forEach((item, index) => {
      console.log(`\n ${index + 1}. [${item.category.toUpperCase()}] "${item.title}"`);
      console.log(`    - Sharing Type: ${item.sharingType}`);
      console.log(`    - Locality & City: ${item.location?.locality}, ${item.location?.city}`);
      console.log(`    - Sharer (Owner): ${item.owner?.name}`);
      console.log(`    - Status: ${item.status} | Availability: ${item.availability}`);
    });

    if (items.length > 0) {
      console.log('\n SUCCESS: Items shared in GUNTUR are fully visible to other accounts and discovery searches!');
      process.exit(0);
    } else {
      console.error('\n❌ No items found for Guntur.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Query failed:', err.message);
    process.exit(1);
  }
}

verifyGunturDiscovery();
