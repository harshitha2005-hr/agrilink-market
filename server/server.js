const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadDB, saveDB } = require('./db');
const { analyzeCropQuality } = require('./aiQualityEngine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// SSE Clients Registry
let sseClients = [];

function sendSSEEvent(eventType, payload) {
  const msg = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(msg);
    } catch (e) {
      // client may have disconnected
    }
  });
}

// SSE Connection Endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now() + Math.random().toString(36).substring(2);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth Login / Profile Retrieval by Phone Number
app.post('/api/auth/login', (req, res) => {
  const { role, phone, name, location, storeName } = req.body;
  if (!phone || !role) {
    return res.status(400).json({ error: 'Phone and role are required' });
  }

  const db = loadDB();
  const cleanPhone = phone.trim();

  if (role === 'farmer') {
    let farmer = db.farmers[cleanPhone];
    let isNew = false;
    if (!farmer) {
      farmer = {
        id: `f_${Date.now()}`,
        phone: cleanPhone,
        name: name || `Farmer ${cleanPhone.slice(-4)}`,
        location: location || 'Local Mandi Region',
        createdAt: new Date().toISOString()
      };
      db.farmers[cleanPhone] = farmer;
      saveDB(db);
      isNew = true;
    } else if (name && farmer.name !== name) {
      farmer.name = name;
      if (location) farmer.location = location;
      saveDB(db);
    }
    return res.json({ success: true, user: farmer, role: 'farmer', isNew });
  } else if (role === 'buyer') {
    let buyer = db.buyers[cleanPhone];
    let isNew = false;
    if (!buyer) {
      buyer = {
        id: `b_${Date.now()}`,
        phone: cleanPhone,
        name: name || `Buyer ${cleanPhone.slice(-4)}`,
        storeName: storeName || `${name ? name + "'s" : 'Wholesale'} Trading Store`,
        location: location || 'City Mandi Yard',
        createdAt: new Date().toISOString()
      };
      db.buyers[cleanPhone] = buyer;
      saveDB(db);
      isNew = true;
    } else if (name && buyer.name !== name) {
      buyer.name = name;
      if (storeName) buyer.storeName = storeName;
      if (location) buyer.location = location;
      saveDB(db);
    }
    return res.json({ success: true, user: buyer, role: 'buyer', isNew });
  }

  res.status(400).json({ error: 'Invalid role specified' });
});

// Get User Dashboard Data (Farmer or Buyer)
app.get('/api/user/:role/:phone', (req, res) => {
  const { role, phone } = req.params;
  const cleanPhone = phone.trim();
  const db = loadDB();

  if (role === 'farmer') {
    const farmer = db.farmers[cleanPhone];
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const farmerCrops = db.crops.filter(c => c.farmerPhone === cleanPhone);
    const availableCrops = farmerCrops.filter(c => c.status === 'AVAILABLE' && c.quantity > 0);
    const soldOutCrops = db.orders.filter(o => o.farmerPhone === cleanPhone);
    const quotes = db.quotes.filter(q => q.farmerPhone === cleanPhone);

    return res.json({
      profile: farmer,
      availableCrops,
      soldOutCrops,
      allCropsHistory: farmerCrops,
      incomingQuotes: quotes
    });
  } else if (role === 'buyer') {
    const buyer = db.buyers[cleanPhone];
    if (!buyer) return res.status(404).json({ error: 'Buyer profile not found' });

    const quotes = db.quotes.filter(q => q.buyerPhone === cleanPhone);
    const orders = db.orders.filter(o => o.buyerPhone === cleanPhone);

    return res.json({
      profile: buyer,
      myQuotes: quotes,
      purchaseHistory: orders
    });
  }

  res.status(400).json({ error: 'Invalid role' });
});

// Preview AI Quality Analysis for Uploaded Image
app.post('/api/crops/analyze-preview', (req, res) => {
  const { cropName, expectedPrice, imageData, location } = req.body;
  const analysis = analyzeCropQuality({ cropName, expectedPrice, imageData, location });
  res.json({ success: true, analysis });
});

// Get All Available Crops across all farmers for Marketplace Catalog
app.get('/api/crops', (req, res) => {
  const db = loadDB();
  const { search, maxPrice, minGrade, location } = req.query;

  let crops = db.crops.filter(c => c.status === 'AVAILABLE' && c.quantity > 0);

  if (search) {
    const term = search.toLowerCase();
    crops = crops.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term) ||
      c.farmerName.toLowerCase().includes(term)
    );
  }

  if (maxPrice) {
    crops = crops.filter(c => c.expectedPrice <= Number(maxPrice));
  }

  if (minGrade) {
    crops = crops.filter(c => c.aiAnalysis && c.aiAnalysis.grade.includes(minGrade));
  }

  res.json({ crops });
});

// Add Crop with AI Visual Analysis (Farmer)
app.post('/api/crops', (req, res) => {
  const {
    farmerPhone,
    farmerName,
    name,
    category = 'Produce',
    quantity,
    unit = 'kg',
    location,
    expectedPrice,
    imageUrl,
    imageData
  } = req.body;

  if (!farmerPhone || !name || !quantity || !expectedPrice) {
    return res.status(400).json({ error: 'Required crop details missing' });
  }

  const db = loadDB();

  // Run AI Quality Analysis
  const aiAnalysis = analyzeCropQuality({
    cropName: name,
    expectedPrice: Number(expectedPrice),
    imageData: imageData || imageUrl,
    location
  });

  // Default image fallback if none provided
  const defaultCropImages = {
    tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80'
  };

  let finalImage = imageUrl;
  if (!finalImage || finalImage.trim() === '') {
    const key = Object.keys(defaultCropImages).find(k => name.toLowerCase().includes(k));
    finalImage = key ? defaultCropImages[key] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  }

  const newCrop = {
    id: `crop_${Date.now()}`,
    farmerPhone: farmerPhone.trim(),
    farmerName: farmerName || 'Farmer',
    name,
    category,
    quantity: Number(quantity),
    initialQuantity: Number(quantity),
    unit,
    location: location || 'Local Mandi',
    expectedPrice: Number(expectedPrice),
    status: 'AVAILABLE',
    imageUrl: finalImage,
    aiAnalysis,
    createdAt: new Date().toISOString()
  };

  db.crops.unshift(newCrop);
  saveDB(db);

  // Broadcast real-time event to buyers
  sendSSEEvent('CROP_ADDED', { crop: newCrop });

  res.status(201).json({ success: true, crop: newCrop });
});

// Best Marketplace: AI nearby buyer discovery for a particular crop
app.get('/api/crops/:cropId/best-marketplace', (req, res) => {
  const { cropId } = req.params;
  const db = loadDB();

  const crop = db.crops.find(c => c.id === cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  // Generate dynamic or pre-seeded buyers tailored to this crop
  let matchingBuyers = db.nearbyBuyerCatalog.filter(
    b => b.cropTarget.toLowerCase().includes(crop.name.toLowerCase()) ||
         crop.name.toLowerCase().includes(b.cropTarget.toLowerCase())
  );

  // If none match exactly, generate intelligent dynamic recommendations
  if (matchingBuyers.length === 0) {
    const defaultStores = [
      {
        storeName: "Mandi Samiti Direct Hub",
        buyerName: "Rajesh Kulkarni",
        buyerPhone: "9820011223",
        distanceKm: 4.8,
        priceMultiplier: 1.08,
        paymentTerms: "Immediate Cash / UPI"
      },
      {
        storeName: "AgroFresh Wholesale Mart",
        buyerName: "Sunil Chopra",
        buyerPhone: "9830022334",
        distanceKm: 8.5,
        priceMultiplier: 1.04,
        paymentTerms: "Instant Bank Transfer"
      },
      {
        storeName: "City Supermarket Sourcing Center",
        buyerName: "Mahesh Naidu",
        buyerPhone: "9840033445",
        distanceKm: 14.2,
        priceMultiplier: 0.98,
        paymentTerms: "Cheque / 2-Day RTGS"
      }
    ];

    matchingBuyers = defaultStores.map((s, idx) => {
      const offeredPrice = Math.round(crop.expectedPrice * s.priceMultiplier);
      return {
        id: `nb_dyn_${crop.id}_${idx}`,
        storeName: s.storeName,
        buyerName: s.buyerName,
        buyerPhone: s.buyerPhone,
        cropTarget: crop.name,
        location: `${s.distanceKm} km from ${crop.location}`,
        distanceKm: s.distanceKm,
        demandQuantity: Math.round(crop.quantity * (0.8 + idx * 0.4)),
        expectedPrice: offeredPrice,
        paymentTerms: s.paymentTerms,
        rating: 4.7 + (idx === 0 ? 0.2 : -0.1 * idx),
        isBestRecommendation: false,
        recommendationReason: ""
      };
    });
  }

  // Sort and pick BEST recommendation (highest price, lowest distance)
  let bestIdx = 0;
  let bestScore = -9999;

  matchingBuyers.forEach((buyer, idx) => {
    // Score formula: Price surplus weight + distance penalty
    const priceDiff = buyer.expectedPrice - crop.expectedPrice;
    const score = (priceDiff * 10) - (buyer.distanceKm * 0.8) + (buyer.rating * 5);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
    buyer.isBestRecommendation = false;
  });

  matchingBuyers[bestIdx].isBestRecommendation = true;
  matchingBuyers[bestIdx].recommendationReason = `⭐ AI Top Recommendation: Highest price offer of ₹${matchingBuyers[bestIdx].expectedPrice}/kg with nearest distance (${matchingBuyers[bestIdx].distanceKm} km) and ${matchingBuyers[bestIdx].paymentTerms}.`;

  res.json({
    crop,
    buyers: matchingBuyers,
    bestRecommendation: matchingBuyers[bestIdx]
  });
});

// Buyer submits Quote on a crop
app.post('/api/quotes', (req, res) => {
  const {
    cropId,
    buyerPhone,
    buyerName,
    storeName,
    requestedQty,
    offeredPrice,
    notes = ''
  } = req.body;

  if (!cropId || !buyerPhone || !requestedQty || !offeredPrice) {
    return res.status(400).json({ error: 'Missing required quote details' });
  }

  const db = loadDB();
  const crop = db.crops.find(c => c.id === cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  const newQuote = {
    id: `quote_${Date.now()}`,
    cropId: crop.id,
    cropName: crop.name,
    cropImage: crop.imageUrl,
    cropLocation: crop.location,
    farmerPhone: crop.farmerPhone,
    farmerName: crop.farmerName,
    buyerPhone: buyerPhone.trim(),
    buyerName: buyerName || 'Interested Buyer',
    storeName: storeName || 'Wholesale Buyer Store',
    requestedQty: Number(requestedQty),
    offeredPrice: Number(offeredPrice),
    farmerExpectedPrice: crop.expectedPrice,
    unit: crop.unit || 'kg',
    totalQuoteValue: Number(requestedQty) * Number(offeredPrice),
    status: 'PENDING', // PENDING, ACCEPTED (Sell), REJECTED, WAIT, BOUGHT
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.quotes.unshift(newQuote);
  saveDB(db);

  // Real-time broadcast to farmer
  sendSSEEvent('NEW_QUOTE', {
    quote: newQuote,
    farmerPhone: crop.farmerPhone,
    message: `New quote received from ${buyerName} for ${requestedQty} ${crop.unit} of ${crop.name} at ₹${offeredPrice}/kg!`
  });

  res.status(201).json({ success: true, quote: newQuote });
});

// Farmer decides on a Quote: Sell (Accept), Reject, Keep on Wait
app.patch('/api/quotes/:quoteId/decision', (req, res) => {
  const { quoteId } = req.params;
  const { decision, farmerPhone } = req.body; // 'ACCEPTED', 'REJECTED', 'WAIT'

  if (!['ACCEPTED', 'REJECTED', 'WAIT'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be ACCEPTED, REJECTED, or WAIT' });
  }

  const db = loadDB();
  const quote = db.quotes.find(q => q.id === quoteId);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });

  quote.status = decision;
  quote.updatedAt = new Date().toISOString();
  saveDB(db);

  let msg = '';
  if (decision === 'ACCEPTED') {
    msg = `Farmer ${quote.farmerName} agreed to sell ${quote.requestedQty} ${quote.unit} of ${quote.cropName} at ₹${quote.offeredPrice}/kg! You can now proceed to buy.`;
  } else if (decision === 'REJECTED') {
    msg = `Farmer ${quote.farmerName} rejected your quote for ${quote.cropName}.`;
  } else {
    msg = `Farmer ${quote.farmerName} has kept your quote for ${quote.cropName} on WAIT for market consideration.`;
  }

  // Notify buyer in real time
  sendSSEEvent('QUOTE_DECISION', {
    quote,
    buyerPhone: quote.buyerPhone,
    decision,
    message: msg
  });

  res.json({ success: true, quote, message: msg });
});

// Buyer clicks "Buy" on an accepted quote
app.post('/api/quotes/:quoteId/buy', (req, res) => {
  const { quoteId } = req.params;
  const { buyerPhone, paymentMethod = 'UPI / Mandi Escrow' } = req.body;

  const db = loadDB();
  const quote = db.quotes.find(q => q.id === quoteId);
  if (!quote) return res.status(404).json({ error: 'Quote not found' });

  if (quote.status !== 'ACCEPTED') {
    return res.status(400).json({ error: 'Cannot purchase: Quote has not been accepted by farmer yet.' });
  }

  const crop = db.crops.find(c => c.id === quote.cropId);
  if (!crop) return res.status(404).json({ error: 'Crop listing not found' });

  // Update quote status
  quote.status = 'BOUGHT';
  quote.updatedAt = new Date().toISOString();

  // Deduct quantity from crop
  const soldQty = Math.min(crop.quantity, quote.requestedQty);
  crop.quantity -= soldQty;
  if (crop.quantity <= 0) {
    crop.quantity = 0;
    crop.status = 'SOLD_OUT';
  }

  // Create order
  const newOrder = {
    id: `ord_${Date.now()}`,
    cropId: crop.id,
    cropName: crop.name,
    cropImage: crop.imageUrl,
    farmerPhone: crop.farmerPhone,
    farmerName: crop.farmerName,
    buyerPhone: quote.buyerPhone,
    buyerName: quote.buyerName,
    storeName: quote.storeName,
    quantity: soldQty,
    unit: crop.unit,
    pricePerKg: quote.offeredPrice,
    totalAmount: soldQty * quote.offeredPrice,
    paymentMethod,
    location: crop.location,
    status: 'CONFIRMED',
    trackingStatus: 'Packaging', // Packaging -> In Transport -> Delivered
    trackingSteps: [
      { step: 'Order Confirmed', time: new Date().toISOString(), done: true },
      { step: 'Farmer Packaging', time: null, done: false },
      { step: 'Transport / Vehicle Dispatched', time: null, done: false },
      { step: 'Delivered to Buyer Mandi', time: null, done: false }
    ],
    saleDate: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDB(db);

  // Send real-time notification to the FARMER:
  // "Crop bought! Farmer should continue with packaging and transport."
  sendSSEEvent('CROP_PURCHASED', {
    order: newOrder,
    farmerPhone: crop.farmerPhone,
    buyerPhone: quote.buyerPhone,
    message: `🎉 Great News! Buyer ${quote.buyerName} has purchased ${soldQty} ${crop.unit} of ${crop.name} for ₹${newOrder.totalAmount.toLocaleString('en-IN')}. Please proceed with packaging and transport!`
  });

  res.json({
    success: true,
    order: newOrder,
    cropRemainingQty: crop.quantity,
    message: 'Purchase completed successfully! Farmer has been notified to start packaging and transport.'
  });
});

// Instant direct sell to store from Best Marketplace
app.post('/api/marketplace/instant-sell', (req, res) => {
  const { cropId, buyerStoreId, farmerPhone } = req.body;
  const db = loadDB();

  const crop = db.crops.find(c => c.id === cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  // Find store from catalog or dynamic
  let buyerStore = db.nearbyBuyerCatalog.find(b => b.id === buyerStoreId);
  if (!buyerStore) {
    buyerStore = {
      storeName: "Verified Mandi Partner Mart",
      buyerName: "APMC Mandi Trader",
      buyerPhone: "9900112233",
      expectedPrice: crop.expectedPrice + 2,
      demandQuantity: crop.quantity
    };
  }

  const soldQty = Math.min(crop.quantity, buyerStore.demandQuantity || crop.quantity);
  crop.quantity -= soldQty;
  if (crop.quantity <= 0) {
    crop.quantity = 0;
    crop.status = 'SOLD_OUT';
  }

  const newOrder = {
    id: `ord_direct_${Date.now()}`,
    cropId: crop.id,
    cropName: crop.name,
    cropImage: crop.imageUrl,
    farmerPhone: crop.farmerPhone,
    farmerName: crop.farmerName,
    buyerPhone: buyerStore.buyerPhone,
    buyerName: buyerStore.buyerName,
    storeName: buyerStore.storeName,
    quantity: soldQty,
    unit: crop.unit,
    pricePerKg: buyerStore.expectedPrice,
    totalAmount: soldQty * buyerStore.expectedPrice,
    paymentMethod: 'Direct APMC Mandi Settlement',
    location: crop.location,
    status: 'CONFIRMED',
    trackingStatus: 'Packaging',
    trackingSteps: [
      { step: 'Instant Deal Confirmed', time: new Date().toISOString(), done: true },
      { step: 'Farmer Packaging', time: null, done: false },
      { step: 'Pickup Vehicle Dispatched', time: null, done: false },
      { step: 'Delivered & Settled', time: null, done: false }
    ],
    saleDate: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDB(db);

  sendSSEEvent('CROP_PURCHASED', {
    order: newOrder,
    farmerPhone: crop.farmerPhone,
    buyerPhone: buyerStore.buyerPhone,
    message: `🎉 Deal Confirmed with ${buyerStore.storeName}! Quantity: ${soldQty} ${crop.unit} at ₹${buyerStore.expectedPrice}/kg. Proceed to packaging & transport.`
  });

  res.json({
    success: true,
    order: newOrder,
    cropRemainingQty: crop.quantity,
    message: `Sold successfully to ${buyerStore.storeName}! Proceed to packaging & transport.`
  });
});

// Update order packaging & transport status (Farmer or Buyer)
app.patch('/api/orders/:orderId/tracking', (req, res) => {
  const { orderId } = req.params;
  const { trackingStatus, stepIndex } = req.body;

  const db = loadDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (trackingStatus) {
    order.trackingStatus = trackingStatus;
  }
  if (typeof stepIndex === 'number' && order.trackingSteps && order.trackingSteps[stepIndex]) {
    order.trackingSteps[stepIndex].done = true;
    order.trackingSteps[stepIndex].time = new Date().toISOString();
  }

  saveDB(db);

  sendSSEEvent('TRACKING_UPDATED', {
    order,
    message: `Order #${order.id} update: Produce status is now '${order.trackingStatus}'`
  });

  res.json({ success: true, order });
});

// Live Mandi Benchmark Rates for Price Discovery
app.get('/api/mandi-rates', (req, res) => {
  const db = loadDB();
  res.json({ rates: db.mandiRates });
});

// Serve frontend if built
const clientDist = path.join(__dirname, '../client/dist');
const fs = require('fs');
app.use(express.static(clientDist));
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('AgriLink API Server running.');
  }
});

app.listen(PORT, () => {
  console.log(`🌾 AgriLink Market Linkage Server running on http://localhost:${PORT}`);
});
