import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

// Use public DNS to ensure MongoDB SRV resolution succeeds on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
import slugify from "slugify";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Brand } from "../models/brand.model.js";

dotenv.config({ path: "./.env" });

const categoriesData = [
  {
    name: "Laptops",
    slug: "laptops",
    icon: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    icon: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Audio",
    slug: "audio",
    icon: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Monitors",
    slug: "monitors",
    icon: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Wearables",
    slug: "wearables",
    icon: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80",
  },
];

const brandsData = [
  {
    name: "Apple",
    slug: "apple",
    logo: {
      url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80",
      public_id: "brand_apple_logo",
    },
  },
  {
    name: "Sony",
    slug: "sony",
    logo: {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
      public_id: "brand_sony_logo",
    },
  },
  {
    name: "ASUS",
    slug: "asus",
    logo: {
      url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=200&q=80",
      public_id: "brand_asus_logo",
    },
  },
  {
    name: "Samsung",
    slug: "samsung",
    logo: {
      url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80",
      public_id: "brand_samsung_logo",
    },
  },
  {
    name: "Dell",
    slug: "dell",
    logo: {
      url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=200&q=80",
      public_id: "brand_dell_logo",
    },
  },
  {
    name: "Bose",
    slug: "bose",
    logo: {
      url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80",
      public_id: "brand_bose_logo",
    },
  },
];

const productsData = [
  {
    title: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB SSD)',
    brand: "Apple",
    category: "Laptops",
    regularPrice: 289900,
    salePrice: 249900,
    stock: 12,
    rating: 4.9,
    numReviews: 320,
    isFeatured: true,
    description:
      "Engineered for pro workflows. Powered by the M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with ProMotion 120Hz.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_mbp_16",
      },
    ],
    specifications: {
      processor: "Apple M3 Max (14-core CPU)",
      ram: "36GB Unified Memory",
      storage: "1TB Ultra-fast NVMe SSD",
      display: '16.2" Liquid Retina XDR (3456 x 2234)',
      battery: "Up to 22 hours",
      warranty: "1 Year Apple Care Global Warranty",
    },
  },
  {
    title: 'ASUS ROG Strix SCAR 18 (i9-14900HX, RTX 4090, 32GB, 2TB)',
    brand: "ASUS",
    category: "Laptops",
    regularPrice: 389990,
    salePrice: 349990,
    stock: 8,
    rating: 4.9,
    numReviews: 184,
    isFeatured: true,
    description:
      "Dominance in computing. 14th Gen Intel Core i9 processor, NVIDIA GeForce RTX 4090 16GB GPU with 175W max TGP, ROG Nebula HDR 240Hz Mini LED.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_rog_scar",
      },
    ],
    specifications: {
      processor: "Intel Core i9-14900HX (24 cores)",
      ram: "32GB DDR5 5600MHz",
      storage: "2TB PCIe 4.0 NVMe RAID 0",
      display: '18" QHD+ 240Hz Nebula Mini-LED',
      graphics: "NVIDIA RTX 4090 16GB GDDR6",
      warranty: "2 Years On-site ASUS Warranty",
    },
  },
  {
    title: "Dell XPS 16 OLED (Core Ultra 9, 32GB, RTX 4070)",
    brand: "Dell",
    category: "Laptops",
    regularPrice: 279990,
    salePrice: 249900,
    stock: 14,
    rating: 4.8,
    numReviews: 110,
    isFeatured: true,
    description:
      "Crafted with machined aluminum and Gorilla Glass. Seamless glass haptic touchpad, zero-lattice capacitive touch keys, and vivid 4K OLED touch.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_dell_xps",
      },
    ],
    specifications: {
      processor: "Intel Core Ultra 9 185H",
      ram: "32GB LPDDR5x",
      storage: "1TB PCIe 4.0 SSD",
      display: '16.3" 4K+ (3840x2400) OLED Touch',
      graphics: "NVIDIA RTX 4070 8GB",
      warranty: "2 Years Dell Premium Support",
    },
  },
  {
    title: "Apple iPhone 16 Pro Max (256GB - Desert Titanium)",
    brand: "Apple",
    category: "Smartphones",
    regularPrice: 144900,
    salePrice: 134900,
    stock: 25,
    rating: 4.9,
    numReviews: 480,
    isFeatured: true,
    description:
      "Grade 5 Titanium design with refined micro-blasted texture. A18 Pro chip, 48MP Fusion Camera, and dedicated Camera Control touch sensor.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_iphone_16",
      },
    ],
    specifications: {
      processor: "Apple A18 Pro (6-core CPU, 6-core GPU)",
      storage: "256GB NVMe",
      display: '6.9" Super Retina XDR ProMotion 120Hz',
      camera: "48MP Fusion + 48MP Ultra-wide + 12MP 5x Telephoto",
      battery: "Up to 33 hours video playback",
      warranty: "1 Year Official Apple Warranty",
    },
  },
  {
    title: "Samsung Galaxy S24 Ultra (512GB - Titanium Gray, S-Pen)",
    brand: "Samsung",
    category: "Smartphones",
    regularPrice: 139999,
    salePrice: 124999,
    stock: 18,
    rating: 4.8,
    numReviews: 290,
    isFeatured: false,
    description:
      "Galaxy AI has arrived. Circle to search, real-time live translation, titanium shielding, Corning Gorilla Armor anti-reflective glass with integrated S-Pen.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_s24_ultra",
      },
    ],
    specifications: {
      processor: "Snapdragon 8 Gen 3 for Galaxy",
      ram: "12GB LPDDR5X",
      storage: "512GB UFS 4.0",
      display: '6.8" Dynamic AMOLED 2X 120Hz 2600 nits',
      camera: "200MP Main + 50MP 5x + 10MP 3x + 12MP UW",
      warranty: "1 Year Manufacturer Warranty",
    },
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    brand: "Sony",
    category: "Audio",
    regularPrice: 34990,
    salePrice: 26990,
    stock: 30,
    rating: 4.8,
    numReviews: 620,
    isFeatured: true,
    description:
      "Industry-leading noise cancellation optimized by dual processors and 8 microphones. Specially engineered 30mm precision driver unit with LDAC audio.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_sony_xm5",
      },
    ],
    specifications: {
      driver: "30mm Carbon Fiber Composite",
      batteryLife: "Up to 30 Hours (3 min charge = 3 hrs)",
      anc: "Integrated Processor V1 + QN1",
      bluetooth: "Bluetooth 5.2 with LDAC & AAC",
      weight: "250g Ultra-comfortable synthetic leather",
      warranty: "1 Year Official Sony Warranty",
    },
  },
  {
    title: "Bose QuietComfort Ultra Spatial Audio Earbuds",
    brand: "Bose",
    category: "Audio",
    regularPrice: 29900,
    salePrice: 23900,
    stock: 22,
    rating: 4.7,
    numReviews: 215,
    isFeatured: false,
    description:
      "Breakthrough spatial audio for immersive listening. World-class active noise cancellation with CustomTune technology tailoring sound to your ear shape.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_bose_qc",
      },
    ],
    specifications: {
      battery: "6 hours per charge (24 hours with case)",
      anc: "Active CustomTune Adaptive ANC",
      waterResistance: "IPX4 Sweat & Weather resistant",
      spatialAudio: "Bose Immersive Spatial Mode",
      warranty: "1 Year Bose India Warranty",
    },
  },
  {
    title: "Sony PlayStation 5 Pro (2TB Digital Edition)",
    brand: "Sony",
    category: "Gaming",
    regularPrice: 79990,
    salePrice: 72990,
    stock: 15,
    rating: 4.9,
    numReviews: 340,
    isFeatured: true,
    description:
      "PlayStation Spectral Super Resolution (PSSR) AI upscaling. Advanced ray tracing, high frame rate 120fps fidelity mode, and 2TB high-speed PCIe SSD.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_ps5_pro",
      },
    ],
    specifications: {
      gpu: "Upgraded RDNA 3 GPU (16.7 TFLOPS)",
      storage: "2TB Custom NVMe SSD",
      resolution: "4K 60-120fps with PSSR AI",
      controllers: "1x DualSense Wireless Controller",
      warranty: "1 Year Official Sony PlayStation Warranty",
    },
  },
  {
    title: 'Samsung Odyssey OLED G9 (49" Dual QHD, 240Hz, 0.03ms)',
    brand: "Samsung",
    category: "Monitors",
    regularPrice: 199990,
    salePrice: 149990,
    stock: 7,
    rating: 4.9,
    numReviews: 95,
    isFeatured: true,
    description:
      "49-inch curved 1800R gaming monitor with Neo Quantum Processor Pro. Infinite contrast with pure black OLED, 240Hz refresh rate, and 0.03ms response time.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_odyssey_g9",
      },
    ],
    specifications: {
      screenSize: '49" Curved 32:9 Aspect Ratio',
      resolution: "Dual QHD (5120 x 1440)",
      refreshRate: "240Hz with AMD FreeSync Premium Pro",
      responseTime: "0.03ms (GtG)",
      ports: "HDMI 2.1, DisplayPort 1.4, Micro HDMI",
      warranty: "3 Years Samsung On-site Panel Warranty",
    },
  },
  {
    title: "Apple Watch Ultra 2 (49mm Titanium, GPS + Cellular)",
    brand: "Apple",
    category: "Wearables",
    regularPrice: 89900,
    salePrice: 82900,
    stock: 16,
    rating: 4.9,
    numReviews: 240,
    isFeatured: true,
    description:
      "The most rugged and capable Apple Watch. Aerospace-grade 49mm titanium case, dual-frequency precision GPS, 3000-nit display, and up to 72-hour battery life.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        public_id: "seed_watch_ultra",
      },
    ],
    specifications: {
      caseSize: "49mm Natural Aerospace Titanium",
      display: "Always-On Retina OLED (3000 nits peak)",
      waterResistance: "100m Water resistant (EN13319 certified)",
      battery: "36 hours normal / 72 hours Low Power",
      sensors: "ECG, Blood Oxygen, Depth Gauge, Temperature",
      warranty: "1 Year Official Apple Warranty",
    },
  },
];

async function seedDatabase() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://raviashoktiwari9559_db_user:pdmN2DnTtORlCypC@cluster0.9o0nhec.mongodb.net/TechHaven";

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully to DB.");

    // 1. Seed or find Categories
    const categoryMap = {};
    for (const cat of categoriesData) {
      let existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        existing = await Category.create({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
        });
        console.log(`Created category: ${cat.name}`);
      }
      categoryMap[cat.name] = existing;
    }

    // 2. Seed or find Brands
    const brandMap = {};
    for (const b of brandsData) {
      let existing = await Brand.findOne({ slug: b.slug });
      if (!existing) {
        existing = await Brand.create({
          name: b.name,
          slug: b.slug,
          logo: b.logo,
        });
        console.log(`Created brand: ${b.name}`);
      }
      brandMap[b.name] = existing;
    }

    // 3. Seed Products
    let createdCount = 0;
    for (const p of productsData) {
      const generatedSlug = slugify(p.title, { lower: true, strict: true });
      let existing = await Product.findOne({ slug: generatedSlug });

      if (!existing) {
        const catDoc = categoryMap[p.category];
        const brandDoc = brandMap[p.brand];

        await Product.create({
          title: p.title,
          slug: generatedSlug,
          brand: brandDoc ? brandDoc._id : undefined,
          brandName: p.brand,
          category: catDoc ? catDoc._id : undefined,
          categoryName: p.category,
          sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
          description: p.description,
          regularPrice: p.regularPrice,
          salePrice: p.salePrice,
          stock: p.stock,
          rating: p.rating,
          numReviews: p.numReviews,
          isFeatured: p.isFeatured,
          isActive: true,
          images: p.images,
          specifications: p.specifications,
          warranty: p.specifications?.warranty || "1 Year Standard Warranty",
        });
        createdCount++;
        console.log(`Seeded product: ${p.title}`);
      }
    }

    console.log(`\nSeed completed! Added ${createdCount} new flagship electronics products.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exit(1);
  }
}

seedDatabase();
