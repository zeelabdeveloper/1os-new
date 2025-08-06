// server.js
const express = require("express");

const https = require("https");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const { refreshEmailConfig } = require("./helper/emailConfig.js");
const cron = require("node-cron");
const Separation = require("./models/Separation.js");
const User = require("./models/User.js");
dotenv.config();
const webpush = require("web-push");
const Subscription = require("./models/Subscription.js");

const app = express();

// Connect DB
connectDB();

webpush.setVapidDetails(
  "mailto:satyampandit021@gmail.com",
  process.env.publicKeyForRealWebNotify,
  process.env.privateKeyForRealWebNotify
);

app.use("/uploads", express.static("uploads"));
app.use("/profile", express.static("profile"));
app.use(morgan("tiny"));

// Middleware

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

cron.schedule(
  "59 17 * * *",
  async () => {
    try {
      const today = new Date();

      const separations = await Separation.find({
        status: "approved",
        expectedSeparationDate: { $lte: today },
      }).populate("user");

      for (const sep of separations) {
        if (sep.user && sep.user.isActive) {
          await User.findByIdAndUpdate(sep.user._id, { isActive: false });
          console.log(
            `User ${sep.user._id} deactivated (Separation Date: ${sep.expectedSeparationDate})`
          );
        }
      }
      console.log("Done");
    } catch (err) {
      console.error("Separation cron job error:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

app.get("/api/notify", async (req, res) => {
  const payload = JSON.stringify({
    title: "HRMS Notification",
    body: "Your leave was approved!",
    url: "http://localhost:5173/leave-status",
  });

  try {
    const subscriptions = await Subscription.find();

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: "No subscriptions found" });
    }

    // Process all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, payload);
          return { status: "fulfilled", subscription };
        } catch (err) {
          if (err.statusCode === 410) {
            // Remove expired subscription
            await Subscription.findByIdAndDelete(subscription._id);
          }
          return { status: "rejected", subscription, error: err };
        }
      })
    );

    // Count successful and failed notifications
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - successful;

    res.status(200).json({
      message: `Notifications processed`,
      successful,
      failed,
    });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: "Failed to process notifications" });
  }
});

app.post("/api/subscribe", async (req, res) => {
  try {
    const { subscription, userId } = req.body;
     
    // Validate input
    if (!subscription?.endpoint || !userId) {
      return res
        .status(400)
        .json({ message: "Invalid subscription or userId" });
    }

    // Check if subscription exists for this user
    const existing = await Subscription.findOne({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });

    if (existing) {
      // Update existing subscription
      await Subscription.updateOne(
        { userId },
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        }
      );
      return res.status(200).json({ message: "Subscription updated" });
    } else {
      // Create new subscription
      await Subscription.create({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId,
      });
      return res.status(201).json({ message: "Subscribed successfully" });
    }
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ message: "Failed to save subscription" });
  }
});

// Routes
app.use("/api/v1", require("./routes/route.js"));
app.use("/api/v1/roles", require("./routes/roles-routes.js"));
app.use("/api/v1/finance", require("./routes/finance-routes.js"));
app.use("/api/v1/company", require("./routes/company-routes.js"));
app.use("/api/v1/user", require("./routes/user-route.js"));
app.use("/api/v1/helper", require("./routes/helper-route.js"));
app.use("/api/v1/attendance", require("./routes/attendance-routes.js"));
app.use("/api/v1/separations", require("./routes/separation.js"));
app.use("/api/v1/regularization", require("./routes/regularization.js"));
app.use("/api/v1/messages", require("./routes/messageRoutes.js"));
app.use("/api/v1/tracker/job-link", require("./routes/jobLink.js"));
app.use(
  "/api/v1/store/storeGroups",
  require("./routes/store/storeGroupRoutes.js")
);
app.use("/api/v1/store/roles", require("./routes/store/storeRoles.js"));
app.use("/api/v1/stores", require("./routes/store/store.js"));
app.use("/api/v1/jobs", require("./routes/jobsRoute.js"));
app.use("/api/v1/application", require("./routes/applicationReview.js"));
app.use("/api/v1/news", require("./routes/newsRoutes.js"));
app.use("/api/v1/recruitment", require("./routes/recruitment.js"));
app.use("/api/v1/notifications", require("./routes/Notification.js"));

app.use(
  "/api/v1/interview/interviewSessions",
  require("./routes/interviewSessions.js")
);

app.use("/api/v1/analytics", require("./routes/analytics.js"));
app.use("/api/v1/documents", require("./routes/documentRoutes.js"));
app.use("/api/v1/assets", require("./routes/AssetRoute.js"));
app.use("/api/v1/trainings", require("./routes/TrainingRoutes.js"));
app.use("/api/v1/letters", require("./routes/RelevantLetterRoutes.js"));
app.use("/api/v1/manage-letter", require("./routes/letterTemplates.js"));
app.use("/api/v1/stores", require("./routes/storeRoutes.js"));
app.use("/api/v1/storeuser", require("./routes/storeuser.js"));
app.use("/api/v1/team", require("./routes/team.js"));
app.use("/api/v1/support", require("./routes/managerCandidateRequests.js"));
app.use(
  "/api/v1/performance",
  require("./routes/performance/performanceRouter.js")
);

app.use("/api/v1/settings", require("./routes/setting/settingsRouter.js"));
app.use(
  "/api/v1/email-settings",
  require("./routes/setting/emailSettingRoutes.js")
);
app.use(
  "/api/v1/email-notification-setting",
  require("./routes/setting/emailNotificationRouter.js")
);

// permission
app.use("/api/v1/permission", require("./routes/permissionRoutes.js"));
// career
app.use("/api/v1/career", require("./routes/careerRoutes.js"));

// access For Only Developer

app.use(
  "/api/v2/developer/routes",
  require("./routes/DeveloperRouteAccess.js")
);

app.get("/health", (req, res) => res.send("Working"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await refreshEmailConfig();

  
  console.log(`Server running on port ${PORT}`);
});


// app.get("/", (req, res) => {
//   console.log(req)
//   res.send("Local HTTPS Node.js server working ✅");
// });


// const sslOptions = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };


// https.createServer(sslOptions, app).listen(PORT, async () => {
//    await refreshEmailConfig();
//   console.log("🚀 Server running at https://localhost/");
// });