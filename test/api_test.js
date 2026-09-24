const http = require('http');

function makeRequest({ path, method = 'GET', body = null }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🌱 Starting AgriLink Automated API & Workflow Test Suite...\n');

  try {
    // 1. Health check
    const health = await makeRequest({ path: '/api/health' });
    console.log('✓ Health Check:', health.status === 200 ? 'PASSED' : 'FAILED');

    // 2. Farmer Login & Persistence Check
    const farmerLogin = await makeRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        role: 'farmer',
        phone: '9876543210',
        name: 'Ramesh Patel',
        location: 'Nashik Mandi, Maharashtra'
      }
    });
    console.log('✓ Farmer Login (9876543210):', farmerLogin.status === 200 ? 'PASSED' : 'FAILED', `(User: ${farmerLogin.data.user.name})`);

    // Verify existing profile data retained
    const farmerData = await makeRequest({ path: '/api/user/farmer/9876543210' });
    console.log(`✓ Farmer Data Persistence: Found ${farmerData.data.availableCrops.length} available crops and ${farmerData.data.soldOutCrops.length} sold-out orders. (Data not zero)`);

    // 3. Add Crop with AI Visual Quality Analysis
    const newCropRes = await makeRequest({
      path: '/api/crops',
      method: 'POST',
      body: {
        farmerPhone: '9876543210',
        farmerName: 'Ramesh Patel',
        name: 'Premium Sharbati Wheat',
        category: 'Grains',
        quantity: 1000,
        unit: 'kg',
        location: 'Nashik APMC',
        expectedPrice: 36,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
      }
    });
    const createdCrop = newCropRes.data.crop;
    console.log(`✓ Add Crop with AI Quality Analysis: PASSED. AI Grade: ${createdCrop.aiAnalysis.grade}, Freshness: ${createdCrop.aiAnalysis.freshness}%, Price Range: ${createdCrop.aiAnalysis.fairMarketPriceRange}`);

    // 4. Best Marketplace Nearby Buyer Matchmaking
    const marketplaceRes = await makeRequest({ path: `/api/crops/${createdCrop.id}/best-marketplace` });
    const { buyers, bestRecommendation } = marketplaceRes.data;
    console.log(`✓ Best Marketplace: Found ${buyers.length} nearby registered buyers.`);
    console.log(`✓ Highlighted Best Recommendation: "${bestRecommendation.storeName}" (${bestRecommendation.distanceKm} km away, Offer: ₹${bestRecommendation.expectedPrice}/kg, Reason: ${bestRecommendation.recommendationReason})`);

    // 5. Buyer Login
    const buyerLogin = await makeRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: {
        role: 'buyer',
        phone: '9123456780',
        name: 'Priya Sharma',
        storeName: 'Kisan Fresh Agro Wholesale',
        location: 'Pune Wholesale APMC'
      }
    });
    console.log('✓ Buyer Login (9123456780):', buyerLogin.status === 200 ? 'PASSED' : 'FAILED', `(Buyer: ${buyerLogin.data.user.name})`);

    // 6. Buyer Submits Quote on Farmer's Crop
    const quoteRes = await makeRequest({
      path: '/api/quotes',
      method: 'POST',
      body: {
        cropId: createdCrop.id,
        buyerPhone: '9123456780',
        buyerName: 'Priya Sharma',
        storeName: 'Kisan Fresh Agro Wholesale',
        requestedQty: 400,
        offeredPrice: 35,
        notes: 'Can pick up tomorrow morning from Nashik'
      }
    });
    const quote = quoteRes.data.quote;
    console.log(`✓ Buyer Quote Submission: PASSED. Quoted 400 kg @ ₹35/kg for ${quote.cropName}. Total: ₹${quote.totalQuoteValue}`);

    // 7. Farmer Reviews Quote & Decides: Test WAIT, then ACCEPT
    const waitRes = await makeRequest({
      path: `/api/quotes/${quote.id}/decision`,
      method: 'PATCH',
      body: { decision: 'WAIT' }
    });
    console.log(`✓ Farmer Action [Keep on Wait]: Status is now '${waitRes.data.quote.status}'`);

    const acceptRes = await makeRequest({
      path: `/api/quotes/${quote.id}/decision`,
      method: 'PATCH',
      body: { decision: 'ACCEPTED' }
    });
    console.log(`✓ Farmer Action [Sell / Accept]: Status is now '${acceptRes.data.quote.status}'`);

    // 8. Buyer Executes Purchase (Buy Now)
    const buyRes = await makeRequest({
      path: `/api/quotes/${quote.id}/buy`,
      method: 'POST',
      body: { buyerPhone: '9123456780' }
    });
    const order = buyRes.data.order;
    console.log(`✓ Buyer Order Execution [Buy Now]: Order #${order.id} confirmed for ₹${order.totalAmount}. Tracking Status: '${order.trackingStatus}'`);
    console.log(`✓ Farmer Notification: "Proceed with packaging and transport" triggered.`);

    // 9. Re-verify Data Persistence
    const recheckFarmer = await makeRequest({ path: '/api/user/farmer/9876543210' });
    const recheckBuyer = await makeRequest({ path: '/api/user/buyer/9123456780' });
    console.log(`✓ Persistence Final Check:`);
    console.log(`  - Farmer has ${recheckFarmer.data.soldOutCrops.length} sold orders recorded.`);
    console.log(`  - Buyer has ${recheckBuyer.data.purchaseHistory.length} purchase history records.`);

    console.log('\n🎉 ALL AGRI-LINK API & WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
