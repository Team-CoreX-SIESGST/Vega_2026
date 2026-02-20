import { MainNotification, UserNotification } from "../../models/Notification.js";
import User from "../../models/User.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";
import mongoose from "mongoose";

// Store SSE connections
const clients = new Map();

/**
 * @desc    Get all main notifications with filters and pagination
 * @route   GET /api/notifications/main
 * @access  Private
 */
export const getAllMainNotifications = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Extract query parameters
    const {
        search = "",
        notificationType = "all",
        isActive = "all",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    // Build query object
    const query = {
        organization: currentUser.organization
    };

    // Apply search filter
    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Apply notification type filter
    if (notificationType && notificationType !== "all") {
        query.notificationType = notificationType;
    }

    // Apply active status filter
    if (isActive && isActive !== "all") {
        query.isActive = isActive === "true";
    }

    // Filter out expired notifications
    query.$and = [
        {
            $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }]
        }
    ];

    // Calculate pagination
    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build sort object
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Execute query with pagination
    const [notifications, total] = await Promise.all([
        MainNotification.find(query)
            .populate({
                path: "createdBy",
                select: "_id fullName email"
            })
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage)
            .lean(),

        MainNotification.countDocuments(query)
    ]);

    // Format notifications
    const formattedNotifications = notifications.map((notification) => ({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        notificationType: notification.notificationType,
        organization: notification.organization,
        isActive: notification.isActive,
        expiryDate: notification.expiryDate,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        createdBy: notification.createdBy
            ? {
                  id: notification.createdBy._id,
                  fullName: notification.createdBy.fullName,
                  email: notification.createdBy.email
              }
            : null
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + itemsPerPage, total);

    // Get statistics
    const stats = await MainNotification.aggregate([
        {
            $match: {
                organization: currentUser.organization,
                $and: [
                    {
                        $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }]
                    }
                ]
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                },
                expired: {
                    $sum: { $cond: [{ $lt: ["$expiryDate", new Date()] }, 1, 0] }
                },
                byType: {
                    $push: {
                        type: "$notificationType",
                        isActive: "$isActive"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                total: 1,
                active: 1,
                expired: 1,
                goodCount: {
                    $size: {
                        $filter: {
                            input: "$byType",
                            as: "item",
                            cond: { $eq: ["$$item.type", "good"] }
                        }
                    }
                },
                normalCount: {
                    $size: {
                        $filter: {
                            input: "$byType",
                            as: "item",
                            cond: { $eq: ["$$item.type", "normal"] }
                        }
                    }
                },
                alertCount: {
                    $size: {
                        $filter: {
                            input: "$byType",
                            as: "item",
                            cond: { $eq: ["$$item.type", "alert"] }
                        }
                    }
                }
            }
        }
    ]);

    return sendResponse(
        res,
        true,
        {
            notifications: formattedNotifications,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                itemsPerPage,
                startIndex,
                endIndex,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            },
            filters: {
                search,
                notificationType,
                isActive
            },
            statistics: stats[0] || {
                total: 0,
                active: 0,
                expired: 0,
                goodCount: 0,
                normalCount: 0,
                alertCount: 0
            },
            filterOptions: {
                notificationTypes: ["good", "normal", "alert"],
                statuses: ["active", "inactive"]
            }
        },
        "Main notifications retrieved successfully",
        200
    );
});

/**
 * @desc    Get user notifications with filters and pagination
 * @route   GET /api/notifications/user
 * @access  Private
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Extract query parameters
    const {
        isSeen = "all",
        notificationType = "all",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    // Build query object
    const query = {
        user: currentUser._id
    };

    // Apply seen status filter
    if (isSeen && isSeen !== "all") {
        query.isSeen = isSeen === "true";
    }

    // Apply notification type filter
    if (notificationType && notificationType !== "all") {
        query.notificationType = notificationType;
    }

    // Calculate pagination
    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build sort object
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Execute query with pagination
    const [notifications, total, unreadCount] = await Promise.all([
        UserNotification.find(query).sort(sort).skip(skip).limit(itemsPerPage).lean(),

        UserNotification.countDocuments(query),

        UserNotification.countDocuments({
            user: currentUser._id,
            isSeen: false
        })
    ]);

    // Format notifications
    const formattedNotifications = notifications.map((notification) => ({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        notificationType: notification.notificationType,
        isSeen: notification.isSeen,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + itemsPerPage, total);

    return sendResponse(
        res,
        true,
        {
            notifications: formattedNotifications,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                itemsPerPage,
                startIndex,
                endIndex,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            },
            summary: {
                total,
                unread: unreadCount,
                read: total - unreadCount
            },
            filters: {
                isSeen,
                notificationType
            }
        },
        "User notifications retrieved successfully",
        200
    );
});

/**
 * @desc    Mark user notification as read
 * @route   PUT /api/notifications/user/:id/read
 * @access  Private
 */
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const { id } = req.params;

    // Find and update the notification
    const notification = await UserNotification.findOneAndUpdate(
        {
            _id: id,
            user: currentUser._id,
            isSeen: false
        },
        {
            $set: { isSeen: true }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!notification) {
        return sendResponse(
            res,
            false,
            null,
            "Notification not found, already read, or you don't have permission",
            404
        );
    }

    return sendResponse(
        res,
        true,
        {
            notification: {
                id: notification._id,
                title: notification.title,
                description: notification.description,
                notificationType: notification.notificationType,
                isSeen: notification.isSeen,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt
            }
        },
        "Notification marked as read",
        200
    );
});

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/user/mark-all-read
 * @access  Private
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Update all unread notifications for the user
    const result = await UserNotification.updateMany(
        {
            user: currentUser._id,
            isSeen: false
        },
        {
            $set: { isSeen: true }
        }
    );

    return sendResponse(
        res,
        true,
        {
            updatedCount: result.modifiedCount
        },
        `Marked ${result.modifiedCount} notifications as read`,
        200
    );
});

/**
 * @desc    SSE endpoint for real-time notifications
 * @route   GET /api/notifications/stream
 * @access  Private
 */
export const notificationStream = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders(); // Send headers immediately

    // Create a unique client ID
    const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Store the connection
    const client = {
        id: clientId,
        userId: currentUser._id.toString(),
        response: res
    };

    clients.set(clientId, client);

    // Send initial connection message
    res.write(
        `data: ${JSON.stringify({ type: "connected", clientId, userId: currentUser._id })}\n\n`
    );

    // Send current unread count
    const unreadCount = await UserNotification.countDocuments({
        user: currentUser._id,
        isSeen: false
    });

    res.write(`data: ${JSON.stringify({ type: "initial", unreadCount })}\n\n`);

    // Handle client disconnect
    req.on("close", () => {
        console.log(`Client ${clientId} disconnected`);
        clients.delete(clientId);
    });

    // Keep connection alive with heartbeat
    const heartbeatInterval = setInterval(() => {
        if (clients.has(clientId)) {
            try {
                res.write(
                    `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`
                );
            } catch (error) {
                console.log(`Error sending heartbeat to client ${clientId}:`, error.message);
                clearInterval(heartbeatInterval);
                clients.delete(clientId);
            }
        } else {
            clearInterval(heartbeatInterval);
        }
    }, 30000); // Send heartbeat every 30 seconds
});

/**
 * Helper function to send SSE notification to specific users
 * @param {String} userId - User ID to send notification to
 * @param {Object} notificationData - Notification data
 */
export const sendSSENotification = async (userId, notificationData) => {
    const userIdStr = userId.toString();

    // Find all connections for this user
    const userConnections = Array.from(clients.values()).filter(
        (client) => client.userId === userIdStr
    );

    if (userConnections.length === 0) {
        return;
    }

    const eventData = {
        type: "new-notification",
        data: notificationData,
        timestamp: Date.now()
    };

    userConnections.forEach((client) => {
        try {
            client.response.write(`data: ${JSON.stringify(eventData)}\n\n`);
        } catch (error) {
            console.log(`Error sending SSE to client ${client.id}:`, error.message);
            clients.delete(client.id);
        }
    });
};

/**
 * Helper function to send SSE notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data
 */
export const sendSSENotificationToUsers = async (userIds, notificationData) => {
    for (const userId of userIds) {
        await sendSSENotification(userId, notificationData);
    }
};

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/statistics
 * @access  Private
 */
export const getNotificationStatistics = asyncHandler(async (req, res) => {
    const currentUser = req.user;

    const [userStats, mainStats, recentNotifications] = await Promise.all([
        // User notification statistics
        UserNotification.aggregate([
            {
                $match: {
                    user: currentUser._id
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    read: {
                        $sum: { $cond: [{ $eq: ["$isSeen", true] }, 1, 0] }
                    },
                    unread: {
                        $sum: { $cond: [{ $eq: ["$isSeen", false] }, 1, 0] }
                    },
                    byType: {
                        $push: {
                            type: "$notificationType",
                            isSeen: "$isSeen"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    read: 1,
                    unread: 1,
                    goodCount: {
                        $size: {
                            $filter: {
                                input: "$byType",
                                as: "item",
                                cond: { $eq: ["$$item.type", "good"] }
                            }
                        }
                    },
                    normalCount: {
                        $size: {
                            $filter: {
                                input: "$byType",
                                as: "item",
                                cond: { $eq: ["$$item.type", "normal"] }
                            }
                        }
                    },
                    alertCount: {
                        $size: {
                            $filter: {
                                input: "$byType",
                                as: "item",
                                cond: { $eq: ["$$item.type", "alert"] }
                            }
                        }
                    }
                }
            }
        ]),

        // Main notification statistics
        MainNotification.aggregate([
            {
                $match: {
                    organization: currentUser.organization,
                    isActive: true,
                    $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }]
                }
            },
            {
                $group: {
                    _id: null,
                    activeNotifications: { $sum: 1 }
                }
            }
        ]),

        // Recent notifications (last 5)
        UserNotification.find({
            user: currentUser._id
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
    ]);

    // Format recent notifications
    const formattedRecentNotifications = recentNotifications.map((notification) => ({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        notificationType: notification.notificationType,
        isSeen: notification.isSeen,
        createdAt: notification.createdAt
    }));

    const result = {
        userStatistics: userStats[0] || {
            total: 0,
            read: 0,
            unread: 0,
            goodCount: 0,
            normalCount: 0,
            alertCount: 0
        },
        mainStatistics: {
            activeNotifications: mainStats[0]?.activeNotifications || 0
        },
        recentNotifications: formattedRecentNotifications
    };

    return sendResponse(res, true, result, "Notification statistics retrieved successfully", 200);
});
