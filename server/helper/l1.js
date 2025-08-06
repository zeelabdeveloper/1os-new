const Notification = require("../models/Notification");
const webpush = require("web-push");
const Subscription = require("../models/Subscription");
const buildSearchQuery = (search) => {
  if (!search) return {};

  const searchRegex = { $regex: search, $options: "i" };

  return {
    $or: [
      { email: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { contactNumber: searchRegex },
    ],
  };
};

const buildSortCriteria = (sortBy, sortOrder) => {
  const sortOptions = {
    name: { "Profile.firstName": sortOrder, "Profile.lastName": sortOrder },
    email: { email: sortOrder },
    status: { status: sortOrder },
    dateOfJoining: { dateOfJoining: sortOrder },
    default: { createdAt: sortOrder },
  };

  return sortOptions[sortBy] || sortOptions.default;
};

const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      receiver: notificationData?.receiver,
      sender: notificationData?.sender,
      title: notificationData?.title,
      message: notificationData?.message,
      type: notificationData.type || "info",
      link: notificationData?.link,
      isRead: false,
      createdAt: new Date(),
    });

    await notification.save();
    console.log("Notification created successfully:", notification);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

const sendPushNotification = async (  payload,  subscription) => {
  try {
    console.log(subscription)
    // Validate subscription
    if (!subscription || !subscription.endpoint) {
      console.error("Invalid subscription object");
      return { status: "rejected", error: "Invalid subscription" };
    }

    // Ensure payload is stringified if it's an object
    const notificationPayload =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    // Send notification
    await webpush.sendNotification(subscription, notificationPayload);

    console.log(
      `Push notification sent successfully to ${subscription.endpoint}`
    );
    return {
      status: "fulfilled",
      subscription,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Error sending push notification:", err);

    return {
      status: "rejected",
    };
  }
};

// Enhanced function to send to multiple subscriptions with batching
const sendBulkPushNotifications = async (subscriptions, payload) => {
  const results = [];
  const batchSize = 100; // Process in batches to avoid memory issues
  const totalBatches = Math.ceil(subscriptions.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const batchStart = i * batchSize;
    const batchEnd = batchStart + batchSize;
    const batch = subscriptions.slice(batchStart, batchEnd);

    const batchResults = await Promise.allSettled(
      batch.map((sub) => sendPushNotification(sub, payload))
    );

    results.push(...batchResults);

    // Small delay between batches to avoid rate limiting
    if (i < totalBatches - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return {
    total: subscriptions.length,
    fulfilled: results.filter((r) => r.status === "fulfilled").length,
    rejected: results.filter((r) => r.status === "rejected").length,
    results,
  };
};

module.exports = {
  buildSearchQuery,
  createNotification,
  sendBulkPushNotifications,
  sendPushNotification,
  buildSortCriteria,
};
