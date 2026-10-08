try {
  console.log('Testing Express server route imports...');
  const app = require('../app');
  console.log('✔ Express app routes loaded successfully without errors!');
  process.exit(0);
} catch (err) {
  console.error('❌ Express Route Initialization Error:', err);
  process.exit(1);
}
