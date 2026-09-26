import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Cart } from "../models/cart.model.js";
import { Wishlist } from "../models/wishlist.model.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: Calculate date range based on timeframe parameter
const parseTimeframe = (timeframe, startDateParam, endDateParam) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date(now);
  let groupFormat = "%Y-%m-%d"; // default daily grouping

  if (startDateParam && endDateParam) {
    startDate = new Date(startDateParam);
    endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) groupFormat = "%Y-%m";
    return { startDate, endDate, groupFormat };
  }

  switch (timeframe) {
    case "7d":
      startDate.setDate(now.getDate() - 7);
      groupFormat = "%Y-%m-%d";
      break;
    case "90d":
      startDate.setDate(now.getDate() - 90);
      groupFormat = "%Y-%m-%d";
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      groupFormat = "%Y-%m";
      break;
    case "30d":
    default:
      startDate.setDate(now.getDate() - 30);
      groupFormat = "%Y-%m-%d";
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate, groupFormat };
};

// ==========================================
// CUSTOMER DASHBOARD CONTROLLER
// ==========================================



export const getCustomerDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Run independent customer queries concurrently
  const [userProfile, orderStats, recentOrders, cartData, wishlistData, reviewStats] =
    await Promise.all([
      // 1. User Profile & Saved Addresses
      User.findById(userId).select("name email phone avatar role addresses createdAt"),

      // 2. Customer Order Statistics
      Order.aggregate([
        { $match: { user: userObjectId } },
        {
          $facet: {
            lifetimeSpend: [
              {
                $match: {
                  orderStatus: { $ne: "CANCELLED" },
                  $or: [
                    { "paymentInfo.status": "PAID" },
                    { "paymentInfo.method": "COD", orderStatus: "DELIVERED" }
                  ]
                }
              },
              {
                $group: {
                  _id: null,
                  totalSpent: { $sum: "$pricing.grandTotal" },
                  paidOrdersCount: { $sum: 1 }
                }
              }
            ],
            statusCounts: [
              {
                $group: {
                  _id: "$orderStatus",
                  count: { $sum: 1 }
                }
              }
            ],
            overallCount: [{ $count: "total" }]
          }
        }
      ]),

      // 3. Recent 5 Orders with essential tracking snapshots
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "orderNumber orderItems pricing orderStatus paymentInfo trackingInfo createdAt"
        )
        .lean(),

      // 4. Active Cart summary
      Cart.findOne({ user: userId })
        .select("items pricing")
        .lean(),

      // 5. Wishlist preview (total items + first 4 items populated)
      Wishlist.findOne({ user: userId })
        .populate({
          path: "products.product",
          select: "title slug regularPrice salePrice images stock isActive"
        })
        .lean(),

      // 6. Review metrics submitted by this customer
      Review.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            totalHelpfulVotes: { $sum: "$helpfulCount" },
            averageRatingGiven: { $avg: "$rating" }
          }
        }
      ])
    ]);

  if (!userProfile) {
    throw new ApiError(404, "User profile not found");
  }

  // Parse order stats from facet
  const facetResult = orderStats[0] || {};
  const totalOrders = facetResult.overallCount?.[0]?.total || 0;
  const lifetimeSpent = facetResult.lifetimeSpend?.[0]?.totalSpent || 0;

  const statusMap = (facetResult.statusCounts || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const activeOrdersCount =
    (statusMap["PLACED"] || 0) +
    (statusMap["CONFIRMED"] || 0) +
    (statusMap["PROCESSING"] || 0) +
    (statusMap["SHIPPED"] || 0) +
    (statusMap["OUT_FOR_DELIVERY"] || 0);
  const deliveredOrdersCount = statusMap["DELIVERED"] || 0;
  const cancelledOrdersCount = statusMap["CANCELLED"] || 0;

  // Format Wishlist Preview
  const wishlistItems = wishlistData?.products || [];
  const wishlistPreview = wishlistItems
    .slice(0, 4)
    .filter((item) => item.product)
    .map((item) => {
      const prod = item.product;
      const primaryImage =
        prod.images?.find((img) => img.isPrimary)?.url || prod.images?.[0]?.url || "";
      return {
        productId: prod._id,
        title: prod.title,
        slug: prod.slug,
        regularPrice: prod.regularPrice,
        salePrice: prod.salePrice,
        thumbnail: primaryImage,
        inStock: (prod.stock || 0) > 0,
        addedAt: item.addedAt
      };
    });

  // Default address resolution
  const defaultAddress =
    userProfile.addresses?.find((addr) => addr.isDefault) ||
    userProfile.addresses?.[0] ||
    null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        profile: {
          _id: userProfile._id,
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          avatar: userProfile.avatar?.url || "",
          memberSince: userProfile.createdAt,
          defaultAddress
        },
        metrics: {
          totalOrders,
          activeOrdersCount,
          deliveredOrdersCount,
          cancelledOrdersCount,
          lifetimeSpent: Math.round(lifetimeSpent * 100) / 100
        },
        recentOrders,
        cart: {
          totalItems: cartData?.pricing?.totalItems || cartData?.items?.length || 0,
          grandTotal: cartData?.pricing?.grandTotal || 0
        },
        wishlist: {
          totalItems: wishlistItems.length,
          preview: wishlistPreview
        },
        reviews: {
          totalReviews: reviewStats[0]?.totalReviews || 0,
          totalHelpfulVotes: reviewStats[0]?.totalHelpfulVotes || 0,
          averageRatingGiven: reviewStats[0]?.averageRatingGiven
            ? Math.round(reviewStats[0].averageRatingGiven * 10) / 10
            : 0
        }
      },
      "Customer dashboard summary retrieved successfully"
    )
  );
});

// ==========================================
// ADMIN DASHBOARD CONTROLLERS
// ==========================================


export const getAdminDashboardOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Parallel aggregations for headline performance cards
  const [orderMetrics, productMetrics, customerCount, recentOrders, recentUsers, recentReviews] =
    await Promise.all([
      // 1. All-time, Today, and Yesterday Order & Revenue Breakdown
      Order.aggregate([
        {
          $facet: {
            allTime: [
              {
                $group: {
                  _id: null,
                  totalGrossRevenue: { $sum: "$pricing.grandTotal" },
                  totalOrders: { $sum: 1 },
                  avgOrderValue: { $avg: "$pricing.grandTotal" }
                }
              }
            ],
            netRevenue: [
              {
                $match: {
                  orderStatus: { $nin: ["CANCELLED", "RETURNED"] },
                  $or: [
                    { "paymentInfo.status": "PAID" },
                    { "paymentInfo.method": "COD", orderStatus: "DELIVERED" }
                  ]
                }
              },
              {
                $group: {
                  _id: null,
                  totalNetRevenue: { $sum: "$pricing.grandTotal" },
                  completedOrders: { $sum: 1 }
                }
              }
            ],
            todayStats: [
              { $match: { createdAt: { $gte: startOfToday } } },
              {
                $group: {
                  _id: null,
                  todayRevenue: { $sum: "$pricing.grandTotal" },
                  todayOrders: { $sum: 1 }
                }
              }
            ],
            yesterdayStats: [
              {
                $match: {
                  createdAt: { $gte: startOfYesterday, $lt: startOfToday }
                }
              },
              {
                $group: {
                  _id: null,
                  yesterdayRevenue: { $sum: "$pricing.grandTotal" },
                  yesterdayOrders: { $sum: 1 }
                }
              }
            ],
            statusBreakdown: [
              {
                $group: {
                  _id: "$orderStatus",
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]),

      // 2. Product Catalog & Inventory Health Status
      Product.aggregate([
        {
          $facet: {
            catalogSummary: [
              {
                $group: {
                  _id: null,
                  totalProducts: { $sum: 1 },
                  activeProducts: {
                    $sum: { $cond: ["$isActive", 1, 0] }
                  },
                  featuredProducts: {
                    $sum: { $cond: ["$isFeatured", 1, 0] }
                  },
                  totalStockUnits: { $sum: "$stock" }
                }
              }
            ],
            outOfStock: [
              { $match: { stock: 0 } },
              { $count: "count" }
            ],
            lowStock: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $gt: ["$stock", 0] },
                      { $lte: ["$stock", "$lowStockThreshold"] }
                    ]
                  }
                }
              },
              { $count: "count" }
            ]
          }
        }
      ]),

      // 3. Registered Customer Base
      User.countDocuments({ role: "customer" }),

      // 4. Recent 5 Orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email avatar")
        .select("orderNumber user pricing orderStatus paymentInfo orderItems createdAt")
        .lean(),

      // 5. Recent 5 Customer Registrations
      User.find({ role: "customer" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email phone avatar createdAt isBlocked")
        .lean(),

      // 6. Recent 5 Customer Reviews
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email avatar")
        .populate("product", "title slug images")
        .select("title rating comment helpfulCount user product createdAt")
        .lean()
    ]);

  // Extract order facet metrics
  const orderFacet = orderMetrics[0] || {};
  const allTime = orderFacet.allTime?.[0] || { totalGrossRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
  const netRev = orderFacet.netRevenue?.[0] || { totalNetRevenue: 0, completedOrders: 0 };
  const today = orderFacet.todayStats?.[0] || { todayRevenue: 0, todayOrders: 0 };
  const yesterday = orderFacet.yesterdayStats?.[0] || { yesterdayRevenue: 0, yesterdayOrders: 0 };

  const statusMap = (orderFacet.statusBreakdown || []).reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const pendingFulfillment =
    (statusMap["PLACED"] || 0) +
    (statusMap["CONFIRMED"] || 0) +
    (statusMap["PROCESSING"] || 0);

  // Day-over-day revenue growth calculation
  let revenueGrowthPercentage = 0;
  if (yesterday.yesterdayRevenue > 0) {
    revenueGrowthPercentage = Math.round(
      ((today.todayRevenue - yesterday.yesterdayRevenue) / yesterday.yesterdayRevenue) * 100
    );
  } else if (today.todayRevenue > 0) {
    revenueGrowthPercentage = 100;
  }

  // Extract product facet metrics
  const productFacet = productMetrics[0] || {};
  const catalog = productFacet.catalogSummary?.[0] || {
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalStockUnits: 0
  };
  const outOfStockCount = productFacet.outOfStock?.[0]?.count || 0;
  const lowStockCount = productFacet.lowStock?.[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          revenue: {
            totalGrossRevenue: Math.round(allTime.totalGrossRevenue * 100) / 100,
            totalNetRevenue: Math.round(netRev.totalNetRevenue * 100) / 100,
            todayRevenue: Math.round(today.todayRevenue * 100) / 100,
            yesterdayRevenue: Math.round(yesterday.yesterdayRevenue * 100) / 100,
            revenueGrowthPercentage,
            avgOrderValue: Math.round(allTime.avgOrderValue * 100) / 100
          },
          orders: {
            totalOrders: allTime.totalOrders,
            completedOrders: netRev.completedOrders,
            todayOrders: today.todayOrders,
            yesterdayOrders: yesterday.yesterdayOrders,
            pendingFulfillment,
            shippedOrders: (statusMap["SHIPPED"] || 0) + (statusMap["OUT_FOR_DELIVERY"] || 0),
            deliveredOrders: statusMap["DELIVERED"] || 0,
            cancelledOrders: statusMap["CANCELLED"] || 0,
            returnedOrders: statusMap["RETURNED"] || 0
          },
          catalog: {
            totalProducts: catalog.totalProducts,
            activeProducts: catalog.activeProducts,
            featuredProducts: catalog.featuredProducts,
            totalStockUnits: catalog.totalStockUnits,
            lowStockCount,
            outOfStockCount
          },
          customers: {
            totalCustomers: customerCount
          }
        },
        recentActivity: {
          recentOrders,
          recentUsers,
          recentReviews
        }
      },
      "Admin executive dashboard overview retrieved successfully"
    )
  );
});

/**
 * @desc    Get Sales & Financial Analytics with Time-Series Trends
 * @route   GET /api/v1/dashboard/admin/sales-analytics
 * @access  Private (Admin only)
 */

export const getAdminSalesAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = "30d", startDate: startParam, endDate: endParam } = req.query;
  const { startDate, endDate, groupFormat } = parseTimeframe(timeframe, startParam, endParam);

  const [salesTimeline, categoryBreakdown, paymentMethodStats, statusDistribution] =
    await Promise.all([
      // 1. Time-Series Sales & Orders Curve
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $ne: "CANCELLED" }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupFormat, date: "$createdAt" }
            },
            totalRevenue: { $sum: "$pricing.grandTotal" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$pricing.grandTotal" },
            totalDiscountGiven: { $sum: "$pricing.discountAmount" }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            revenue: { $round: ["$totalRevenue", 2] },
            orders: "$orderCount",
            aov: { $round: ["$avgOrderValue", 2] },
            discount: { $round: ["$totalDiscountGiven", 2] }
          }
        }
      ]),

      // 2. Sales by Electronics Category
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $ne: "CANCELLED" }
          }
        },
        { $unwind: "$orderItems" },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.product",
            foreignField: "_id",
            as: "productDoc"
          }
        },
        { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "productDoc.category",
            foreignField: "_id",
            as: "categoryDoc"
          }
        },
        { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              $ifNull: [
                "$categoryDoc.name",
                { $ifNull: ["$productDoc.categoryName", "Electronics"] }
              ]
            },
            totalRevenue: {
              $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] }
            },
            unitsSold: { $sum: "$orderItems.quantity" },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        {
          $project: {
            _id: 0,
            category: "$_id",
            revenue: { $round: ["$totalRevenue", 2] },
            unitsSold: "$unitsSold",
            orderCount: "$orderCount"
          }
        }
      ]),

      // 3. Payment Methods Breakdown (Razorpay vs COD)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              method: "$paymentInfo.method",
              status: "$paymentInfo.status"
            },
            count: { $sum: 1 },
            totalAmount: { $sum: "$pricing.grandTotal" }
          }
        },
        {
          $project: {
            _id: 0,
            method: "$_id.method",
            status: "$_id.status",
            count: "$count",
            amount: { $round: ["$totalAmount", 2] }
          }
        }
      ]),

      // 4. Order Status Distribution Funnel
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
            totalValue: { $sum: "$pricing.grandTotal" }
          }
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: "$count",
            totalValue: { $round: ["$totalValue", 2] }
          }
        }
      ])
    ]);

  // Aggregate totals across timeframe
  const totalPeriodRevenue = salesTimeline.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalPeriodOrders = salesTimeline.reduce((acc, curr) => acc + curr.orders, 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        timeframe: {
          selected: timeframe,
          startDate,
          endDate,
          totalRevenue: Math.round(totalPeriodRevenue * 100) / 100,
          totalOrders: totalPeriodOrders
        },
        salesTimeline,
        categoryBreakdown,
        paymentMethodStats,
        statusDistribution
      },
      "Sales analytics retrieved successfully"
    )
  );
});

/**
 * @desc    Get Inventory Health, Stock Alerts & Best-Sellers
 * @route   GET /api/v1/dashboard/admin/inventory-health
 * @access  Private (Admin only)
 */

export const getAdminInventoryHealth = asyncHandler(async (req, res) => {
  const [inventoryStats, criticalLowStock, outOfStockProducts, topSellingProducts] =
    await Promise.all([
      // 1. Warehouse Catalog Valuation & Stock Health Stats
      Product.aggregate([
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalProducts: { $sum: 1 },
                  totalInventoryUnits: { $sum: "$stock" },
                  inventoryValuation: {
                    $sum: {
                      $multiply: [
                        { $ifNull: ["$salePrice", "$regularPrice"] },
                        "$stock"
                      ]
                    }
                  }
                }
              }
            ],
            byCategory: [
              {
                $group: {
                  _id: "$category",
                  productCount: { $sum: 1 },
                  totalUnits: { $sum: "$stock" }
                }
              },
              { $sort: { totalUnits: -1 } }
            ]
          }
        }
      ]),

      // 2. Critical Low Stock Products (0 < stock <= lowStockThreshold)
      Product.find({
        $expr: {
          $and: [
            { $gt: ["$stock", 0] },
            { $lte: ["$stock", "$lowStockThreshold"] }
          ]
        }
      })
        .select("title slug sku category stock lowStockThreshold regularPrice salePrice images")
        .populate("category", "name slug")
        .sort({ stock: 1 })
        .limit(20)
        .lean(),

      // 3. Completely Out of Stock Products
      Product.find({ stock: 0 })
        .select("title slug sku category stock lowStockThreshold regularPrice salePrice images updatedAt")
        .populate("category", "name slug")
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),

      // 4. Top 10 Best-Selling Products of all time
      Order.aggregate([
        { $match: { orderStatus: { $ne: "CANCELLED" } } },
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            unitsSold: { $sum: "$orderItems.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] }
            },
            title: { $first: "$orderItems.title" },
            image: { $first: "$orderItems.image" }
          }
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDoc"
          }
        },
        { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "productDoc.category",
            foreignField: "_id",
            as: "categoryDoc"
          }
        },
        { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: "$_id",
            title: 1,
            image: 1,
            unitsSold: 1,
            totalRevenue: { $round: ["$totalRevenue", 2] },
            currentStock: "$productDoc.stock",
            sku: "$productDoc.sku",
            category: {
              $ifNull: [
                "$categoryDoc.name",
                { $ifNull: ["$productDoc.categoryName", "Electronics"] }
              ]
            }
          }
        }
      ])
    ]);

  const summary = inventoryStats[0]?.summary?.[0] || {
    totalProducts: 0,
    totalInventoryUnits: 0,
    inventoryValuation: 0
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalProducts: summary.totalProducts,
          totalInventoryUnits: summary.totalInventoryUnits,
          inventoryValuation: Math.round(summary.inventoryValuation * 100) / 100,
          outOfStockCount: outOfStockProducts.length,
          lowStockCount: criticalLowStock.length
        },
        stockByCategory: inventoryStats[0]?.byCategory || [],
        criticalLowStock,
        outOfStockProducts,
        topSellingProducts
      },
      "Inventory health and stock alerts retrieved successfully"
    )
  );
});

/**
 * @desc    Get Customer Insights & Lifetime Value (LTV) Analytics
 * @route   GET /api/v1/dashboard/admin/customer-insights
 * @access  Private (Admin only)
 */

export const getAdminCustomerInsights = asyncHandler(async (req, res) => {
  const [topLtvCustomers, repeatPurchaseAnalysis, registrationTrends] =
    await Promise.all([
      // 1. Top 10 High-Value Customers (LTV)
      Order.aggregate([
        {
          $match: {
            orderStatus: { $ne: "CANCELLED" },
            $or: [
              { "paymentInfo.status": "PAID" },
              { "paymentInfo.method": "COD", orderStatus: "DELIVERED" }
            ]
          }
        },
        {
          $group: {
            _id: "$user",
            totalSpend: { $sum: "$pricing.grandTotal" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$pricing.grandTotal" },
            lastOrderDate: { $max: "$createdAt" }
          }
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDoc"
          }
        },
        { $unwind: "$userDoc" },
        {
          $project: {
            userId: "$_id",
            name: "$userDoc.name",
            email: "$userDoc.email",
            phone: "$userDoc.phone",
            avatar: "$userDoc.avatar.url",
            memberSince: "$userDoc.createdAt",
            totalSpend: { $round: ["$totalSpend", 2] },
            orderCount: "$orderCount",
            avgOrderValue: { $round: ["$avgOrderValue", 2] },
            lastOrderDate: "$lastOrderDate"
          }
        }
      ]),

      // 2. Repeat vs One-Time Buyers Ratio
      Order.aggregate([
        { $match: { orderStatus: { $ne: "CANCELLED" } } },
        {
          $group: {
            _id: "$user",
            ordersCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              $cond: [{ $gt: ["$ordersCount", 1] }, "Repeat Customers", "One-Time Buyers"]
            },
            customerCount: { $sum: 1 }
          }
        }
      ]),

      // 3. Customer Registrations over last 6 months
      User.aggregate([
        {
          $match: {
            role: "customer",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" }
            },
            newSignups: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            signups: "$newSignups"
          }
        }
      ])
    ]);

  // Format Repeat vs One-Time stats
  const repeatStats = repeatPurchaseAnalysis.reduce(
    (acc, curr) => {
      if (curr._id === "Repeat Customers") acc.repeatCustomers = curr.customerCount;
      if (curr._id === "One-Time Buyers") acc.oneTimeBuyers = curr.customerCount;
      return acc;
    },
    { repeatCustomers: 0, oneTimeBuyers: 0 }
  );

  const totalBuyers = repeatStats.repeatCustomers + repeatStats.oneTimeBuyers;
  const repeatRate =
    totalBuyers > 0 ? Math.round((repeatStats.repeatCustomers / totalBuyers) * 100) : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        retention: {
          totalBuyers,
          repeatCustomers: repeatStats.repeatCustomers,
          oneTimeBuyers: repeatStats.oneTimeBuyers,
          repeatPurchaseRatePercentage: repeatRate
        },
        registrationTrends,
        topLtvCustomers
      },
      "Customer insights and LTV analytics retrieved successfully"
    )
  );
});
