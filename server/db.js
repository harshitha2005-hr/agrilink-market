const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic seed data
const initialData = {
  farmers: {
    "9876543210": {
      id: "f_1",
      name: "Ramesh Patel",
      phone: "9876543210",
      location: "Nashik, Maharashtra",
      createdAt: new Date().toISOString()
    },
    "9845012345": {
      id: "f_2",
      name: "Siddalingappa Gowda",
      phone: "9845012345",
      location: "Mandya, Karnataka",
      createdAt: new Date().toISOString()
    }
  },
  buyers: {
    "9123456780": {
      id: "b_1",
      name: "Priya Sharma",
      phone: "9123456780",
      storeName: "Kisan Fresh Agro Wholesale",
      location: "Pune APMC Market",
      createdAt: new Date().toISOString()
    },
    "9988776655": {
      id: "b_2",
      name: "Anand Verma",
      phone: "9988776655",
      storeName: "Metro SuperFresh Mart",
      location: "Bengaluru KR Market",
      createdAt: new Date().toISOString()
    }
  },
  crops: [
    {
      id: "crop_1",
      farmerPhone: "9876543210",
      farmerName: "Ramesh Patel",
      name: "Organic Red Onion",
      category: "Vegetables",
      quantity: 1200,
      initialQuantity: 1200,
      unit: "kg",
      location: "Nashik Mandi, Maharashtra",
      expectedPrice: 32,
      status: "AVAILABLE", // AVAILABLE or SOLD_OUT
      imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
      aiAnalysis: {
        grade: "Grade A+",
        qualityScore: 96,
        freshness: 95,
        blemishRate: 1.8,
        moisture: "Optimal (12%)",
        shelfLifeDays: 28,
        fairMarketPriceRange: "₹30 - ₹35 / kg",
        summary: "Exceptional firmness, uniform deep red color, minimal blemish, high export grade."
      },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "crop_2",
      farmerPhone: "9876543210",
      farmerName: "Ramesh Patel",
      name: "Vine Ripened Tomatoes",
      category: "Vegetables",
      quantity: 800,
      initialQuantity: 800,
      unit: "kg",
      location: "Dindori, Nashik",
      expectedPrice: 28,
      status: "AVAILABLE",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
      aiAnalysis: {
        grade: "Grade A",
        qualityScore: 91,
        freshness: 92,
        blemishRate: 3.1,
        moisture: "Juicy / Fresh (88%)",
        shelfLifeDays: 10,
        fairMarketPriceRange: "₹26 - ₹30 / kg",
        summary: "Vibrant red pigment, firm skin, ideal sugar-acid balance, great for retail marts."
      },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "crop_3",
      farmerPhone: "9845012345",
      farmerName: "Siddalingappa Gowda",
      name: "Sona Masoori Paddy Rice",
      category: "Grains",
      quantity: 2500,
      initialQuantity: 2500,
      unit: "kg",
      location: "Mandya, Karnataka",
      expectedPrice: 48,
      status: "AVAILABLE",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      aiAnalysis: {
        grade: "Grade A+",
        qualityScore: 98,
        freshness: 97,
        blemishRate: 0.8,
        moisture: "Optimal dry (11.5%)",
        shelfLifeDays: 180,
        fairMarketPriceRange: "₹46 - ₹52 / kg",
        summary: "Long slender aromatic grain, no chalkiness, pristine milling potential."
      },
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
    }
  ],
  nearbyBuyerCatalog: [
    {
      id: "nb_1",
      storeName: "Kisan Fresh Agro Wholesale",
      buyerName: "Priya Sharma",
      buyerPhone: "9123456780",
      cropTarget: "Organic Red Onion",
      location: "Nashik APMC Sector 4",
      distanceKm: 3.4,
      demandQuantity: 1000,
      expectedPrice: 34, // higher than farmer's ₹32
      paymentTerms: "Immediate Bank Transfer / UPI",
      rating: 4.9,
      isBestRecommendation: true,
      recommendationReason: "Highest offer price (₹34/kg), nearest delivery distance (3.4 km), and immediate payment assurance."
    },
    {
      id: "nb_2",
      storeName: "Reliance Retail Hub",
      buyerName: "Vikas Deshmukh",
      buyerPhone: "9822001122",
      cropTarget: "Organic Red Onion",
      location: "Sinnar Industrial Hub",
      distanceKm: 18.2,
      demandQuantity: 2500,
      expectedPrice: 31,
      paymentTerms: "Net 2 Days",
      rating: 4.6,
      isBestRecommendation: false,
      recommendationReason: "Bulk volume capacity but slightly lower offer price and further distance."
    },
    {
      id: "nb_3",
      storeName: "GreenGrocer Premium Mart",
      buyerName: "Rohit Malhotra",
      buyerPhone: "9811002233",
      cropTarget: "Vine Ripened Tomatoes",
      location: "Nashik City Center",
      distanceKm: 5.1,
      demandQuantity: 500,
      expectedPrice: 30, // higher than farmer's ₹28
      paymentTerms: "Immediate Cash / UPI",
      rating: 4.8,
      isBestRecommendation: true,
      recommendationReason: "Top rate offer of ₹30/kg for Grade A produce with convenient same-day pickup."
    },
    {
      id: "nb_4",
      storeName: "Bengaluru Central Rice Millers",
      buyerName: "Anand Verma",
      buyerPhone: "9988776655",
      cropTarget: "Sona Masoori Paddy Rice",
      location: "Yeshwanthpur APMC Yard",
      distanceKm: 12.0,
      demandQuantity: 3000,
      expectedPrice: 50,
      paymentTerms: "Instant RTGS upon weighbridge verification",
      rating: 4.9,
      isBestRecommendation: true,
      recommendationReason: "Premium price (₹50/kg) matching Grade A+ quality, full lot procurement."
    }
  ],
  quotes: [],
  orders: [
    {
      id: "ord_101",
      cropId: "crop_demo_past",
      cropName: "Sharbati Golden Wheat",
      farmerPhone: "9876543210",
      farmerName: "Ramesh Patel",
      buyerPhone: "9123456780",
      buyerName: "Priya Sharma",
      storeName: "Kisan Fresh Agro Wholesale",
      quantity: 1500,
      unit: "kg",
      pricePerKg: 38,
      totalAmount: 57000,
      location: "Nashik Mandi, Maharashtra",
      status: "COMPLETED",
      trackingStatus: "Delivered",
      saleDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
    }
  ],
  mandiRates: [
    { crop: "Tomato", market: "Nashik (MH)", minPrice: 22, maxPrice: 32, modalPrice: 28, trend: "+4%" },
    { crop: "Red Onion", market: "Lasalgaon (MH)", minPrice: 28, maxPrice: 36, modalPrice: 33, trend: "+7%" },
    { crop: "Sona Masoori Rice", market: "Mandya (KA)", minPrice: 44, maxPrice: 53, modalPrice: 49, trend: "+2%" },
    { crop: "Potato", market: "Agra (UP)", minPrice: 16, maxPrice: 24, modalPrice: 20, trend: "-1%" },
    { crop: "Green Chilli", market: "Guntur (AP)", minPrice: 60, maxPrice: 85, modalPrice: 74, trend: "+12%" },
    { crop: "Wheat", market: "Khanna (PB)", minPrice: 24, maxPrice: 31, modalPrice: 28, trend: "+3%" },
    { crop: "Soybean", market: "Indore (MP)", minPrice: 42, maxPrice: 50, modalPrice: 46, trend: "+5%" }
  ]
};

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return initialData;
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

module.exports = {
  loadDB,
  saveDB
};
