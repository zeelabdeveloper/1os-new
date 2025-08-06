// notificationController.js

const asyncHandler = require("express-async-handler");
const Notification = require("../../models/Notification");

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, read, userId } = req.query;

  const query = { receiver: userId };
  if (read !== undefined) query.isRead = read === "true";

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: {
      isRead: 1, // 1 for ascending (unread first), -1 for descending
      createdAt: -1, // newest first
    },
    populate: [
      {
        path: "sender",
        select: "firstName lastName avatar",
        options: { lean: true },
      },
      {
        path: "receiver",
        select: "firstName lastName",
        options: { lean: true },
      },
    ],
    lean: true, // better performance
  };

  try {
    const notifications = await Notification.paginate(query, options);

    res.json({
      success: true,
      data: notifications.docs,
      pagination: {
        total: notifications.totalDocs,
        totalPages: notifications.totalPages,
        currentPage: notifications.page,
        hasNextPage: notifications.hasNextPage,
        hasPrevPage: notifications.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { receiver: req.body.userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    message: "Notification deleted successfully",
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
