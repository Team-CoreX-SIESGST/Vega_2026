import { MainNotification, UserNotification } from "../models/Notification.js";
import User from "../models/User.js";
import {
    sendSSENotification,
    sendSSENotificationToUsers
} from "../controllers/notifications/notificationController.js";

/**
 * Create a main notification (broadcast to all users in the organization)
 * @param {String} title - Notification title
 * @param {String} description - Notification description
 * @param {String} notificationType - Type of notification ('good', 'normal', 'alert')
 * @param {String} organization - Organization name
 * @param {String} createdBy - User ID who created the notification
 * @returns {Object} Created notification object
 */
export const createMainNotification = async (
    title,
    description,
    notificationType,
    organization,
    createdBy
) => {
    try {
        const notification = await MainNotification.create({
            title,
            description,
            notificationType,
            organization,
            createdBy
        });

        // Get all users in the organization for SSE
        const users = await User.find({ organization }).select("_id");
        const userIds = users.map((user) => user._id);

        // Send SSE to all users in organization
        await sendSSENotificationToUsers(userIds, {
            type: "main-notification",
            data: {
                id: notification._id,
                title: notification.title,
                description: notification.description,
                notificationType: notification.notificationType,
                isBroadcast: true
            }
        });

        return {
            success: true,
            data: notification,
            message: "Main notification created successfully"
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || "Failed to create main notification"
        };
    }
};

/**
 * Create user-specific notifications
 * @param {String} title - Notification title
 * @param {String} description - Notification description
 * @param {Array} users - Array of user IDs to send notification to
 * @param {String} notificationType - Type of notification ('good', 'normal', 'alert')
 * @param {String} createdBy - User ID who created the notification
 * @returns {Object} Result object with success status
 */
export const createUserNotification = async (
    title,
    description,
    users,
    notificationType,
    createdBy
) => {
    try {
        // Get the organization from the creator user
        const creator = await User.findById(createdBy).select("organization");
        if (!creator) {
            return {
                success: false,
                data: null,
                message: "Creator user not found"
            };
        }

        const organization = creator.organization;

        // Create notification documents for each user
        const notifications = users.map((userId) => ({
            title,
            description,
            user: userId,
            notificationType,
            organization
        }));

        // Insert all notifications in bulk
        const createdNotifications = await UserNotification.insertMany(notifications);

        // Send SSE to each user
        for (const notification of createdNotifications) {
            await sendSSENotification(notification.user, {
                type: "user-notification",
                data: {
                    id: notification._id,
                    title: notification.title,
                    description: notification.description,
                    notificationType: notification.notificationType,
                    isSeen: false
                }
            });
        }

        return {
            success: true,
            data: createdNotifications,
            message: `Notifications created for ${createdNotifications.length} user(s)`
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.message || "Failed to create user notifications"
        };
    }
};
