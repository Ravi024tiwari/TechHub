import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get all registered customers with low-latency lean projection & pagination
 * @route   GET /api/v1/users/admin/customers
 * @access  Private (Admin only)
 */
export const getAllCustomersAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { search, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const query = { role: { $ne: "admin" } };

  // Status Filter: active vs blocked
  if (status === "active") {
    query.isBlocked = false;
  } else if (status === "blocked") {
    query.isBlocked = true;
  }

  // Instant Search by name, email, or phone
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  // Dynamic sorting configuration
  const allowedSortFields = ["createdAt", "name", "email"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortConfig = { [sortField]: sortDirection };

  // Ultra-low-latency lean projection: Only select essential fields for listing
  const projection = "name email phone avatar.url isBlocked role createdAt";

  // Execute count, paginated query, and status summary counts concurrently
  const [totalCustomers, customers, activeCount, blockedCount] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select(projection)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ role: { $ne: "admin" }, isBlocked: false }),
    User.countDocuments({ role: { $ne: "admin" }, isBlocked: true })
  ]);

  const totalPages = Math.ceil(totalCustomers / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customers,
        summary: {
          total: activeCount + blockedCount,
          active: activeCount,
          blocked: blockedCount
        },
        pagination: {
          totalCustomers,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      "Customers fetched successfully"
    )
  );
});

/**
 * @desc    Get complete 360-degree customer details (profile, addresses, order metrics, recent orders)
 * @route   GET /api/v1/users/admin/customers/:userId
 * @access  Private (Admin only)
 */
export const getCustomerDetailsAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid customer ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [customer, orderAggregates, recentOrders, reviewCount] = await Promise.all([
    // 1. Full customer profile with addresses
    User.findById(userId)
      .select("name email phone avatar role addresses isBlocked createdAt updatedAt")
      .lean(),

    // 2. Comprehensive Order & Spending Metrics via Aggregation
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
                completedOrdersCount: { $sum: 1 }
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
          totalOrdersCount: [{ $count: "total" }]
        }
      }
    ]),

    // 3. Up to 10 latest orders for this customer
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "orderNumber orderItems.length pricing.grandTotal orderStatus paymentInfo trackingInfo createdAt"
      )
      .lean(),

    // 4. Count of product reviews submitted by this customer
    Review.countDocuments({ user: userObjectId })
  ]);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  // Parse aggregation results
  const facetResult = orderAggregates[0] || {};
  const totalOrders = facetResult.totalOrdersCount?.[0]?.total || 0;
  const lifetimeSpent = facetResult.lifetimeSpend?.[0]?.totalSpent || 0;
  const completedOrders = facetResult.lifetimeSpend?.[0]?.completedOrdersCount || 0;

  const statusMap = (facetResult.statusCounts || []).reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatar: customer.avatar?.url || "",
          role: customer.role,
          isBlocked: customer.isBlocked,
          addresses: customer.addresses || [],
          totalAddressesCount: customer.addresses?.length || 0,
          registeredAt: customer.createdAt
        },
        orderMetrics: {
          totalOrders,
          completedOrders,
          lifetimeSpent: Math.round(lifetimeSpent * 100) / 100,
          deliveredOrders: statusMap["DELIVERED"] || 0,
          cancelledOrders: statusMap["CANCELLED"] || 0,
          processingOrders:
            (statusMap["PLACED"] || 0) +
            (statusMap["CONFIRMED"] || 0) +
            (statusMap["PROCESSING"] || 0),
          inTransitOrders:
            (statusMap["SHIPPED"] || 0) + (statusMap["OUT_FOR_DELIVERY"] || 0)
        },
        recentOrders: recentOrders.map((ord) => ({
          _id: ord._id,
          orderNumber: ord.orderNumber,
          totalItems: ord.orderItems?.length || 0,
          grandTotal: ord.pricing?.grandTotal || 0,
          orderStatus: ord.orderStatus,
          paymentMethod: ord.paymentInfo?.method,
          paymentStatus: ord.paymentInfo?.status,
          trackingNumber: ord.trackingInfo?.trackingNumber || "",
          courierPartner: ord.trackingInfo?.courierPartner || "",
          createdAt: ord.createdAt
        })),
        totalReviewsSubmitted: reviewCount
      },
      "Customer details fetched successfully"
    )
  );
});

/**
 * @desc    Block or Unblock a customer account
 * @route   PATCH /api/v1/users/admin/customers/:userId/block
 * @access  Private (Admin only)
 */
export const toggleBlockCustomerAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isBlocked, reason = "" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid customer ID format");
  }

  // Prevent an admin from blocking their own account
  if (userId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot block your own administrator account");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Determine new block state (explicit boolean or toggle)
  const newBlockState =
    typeof isBlocked === "boolean" ? isBlocked : !user.isBlocked;

  user.isBlocked = newBlockState;

  // If blocking user, revoke their refresh token so active sessions cannot renew
  if (newBlockState) {
    user.refreshToken = undefined;
  }

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
        reason: newBlockState ? reason : undefined
      },
      `Customer account ${user.isBlocked ? "suspended (blocked)" : "reactivated (unblocked)"} successfully`
    )
  );
});
