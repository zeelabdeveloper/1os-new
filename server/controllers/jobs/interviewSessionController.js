const Application = require("../../models/jobs/applicationSchema");
const InterViewRound = require("../../models/jobs/InterviewRound");
const InterviewSession = require("../../models/jobs/InterviewSession");
const Onboarding = require("../../models/jobs/Onboarding");
const mongoose = require("mongoose");
const sendEmail = require("../../services/forgetpassmail");
const { EmailConfig } = require("../../helper/emailConfig");
const EmailNotification = require("../../models/setting/emailNotification");
const User = require("../../models/User");
const expressAsyncHandler = require("express-async-handler");
const { createNotification, sendPushNotification } = require("../../helper/l1");
const Subscription = require("../../models/Subscription");
// @desc    Get single interview session
// @route   GET /api/v1/interview/interviewSessions/:id
// @access  Private
exports.getInterviewSession = async (req, res, next) => {
  try {
    const interviewSessions = await InterviewSession.find({
      applicationId: req.params.id,
    })
      .populate("applicationId")
      .populate("interviewer")
      .populate("interviewRoundId");

    if (!interviewSessions || interviewSessions.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(interviewSessions);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// exports.getInterviewRoundsByInterviewer = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Validate if userId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     const interviewRounds = await InterViewRound.find({ interviewer: userId })
//       .populate("interviewer", "name email")
//       .sort({ roundNumber: 1 });

//     res.status(200).json({
//       success: true,
//       data: interviewRounds,
//       message:
//         interviewRounds.length > 0
//           ? "Interview rounds fetched successfully"
//           : "No interview rounds found for this user",
//     });
//   } catch (error) {
//     console.error("Error fetching interview rounds:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching interview rounds",
//     });
//   }
// };

exports.getInterviewRoundsByInterviewer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Build query
    const query = InterViewRound.find({ interviewer: userId });

    // Add date filter if provided
    if (startDate && endDate) {
      query.where({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });
    }

    // Execute query with pagination
    const interviewRounds = await query
      .populate("interviewer", "name email")
      .sort({ roundNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Get total count
    const total = await InterViewRound.countDocuments({ interviewer: userId });

    res.status(200).json({
      success: true,
      data: interviewRounds,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      message:
        interviewRounds.length > 0
          ? "Interview rounds fetched successfully"
          : "No interview rounds found for this user",
    });
  } catch (error) {
    console.error("Error fetching interview rounds:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interview rounds",
    });
  }
};

// exports.getInterviewByInterviewer = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     const interviewSessions = await InterviewSession.find({
//       interviewer: userId,
//     })
//       .populate("interviewRoundId")
//       .populate("applicationId")
//       .sort({ "interviewRoundId.roundNumber": 1 })
//       .sort({
//         createdAt: -1,
//       });

//     res.status(200).json({
//       success: true,
//       data: interviewSessions,
//     });
//   } catch (error) {
//     console.error("Error fetching interview assigned:", error);
//     res.status(500).json({
//       success: false,
//       message:
//         error.message || "Server error while fetching interview assigned",
//     });
//   }
// };

exports.getInterviewByInterviewer = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 1,
      startDate,
      endDate,
      search = "",
      ["status[]"]: status,
      "outcome[]": outcome,
    } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Build query object
    const queryObj = { interviewer: new mongoose.Types.ObjectId(userId) };

    // Filter by date range
    if (startDate && endDate) {
      queryObj.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Filter by status
    if (status) {
      queryObj.status = status;
    }

    // Filter by outcome
    if (outcome) {
      queryObj.outcome = outcome;
    }

    if (search) {
      // Step 1: Get distinct users who have created applications
      const applicantIds = await Application.distinct("createdBy");

      // Step 2: Search only among these applicants
      const matchingApplicants = await User.find({
        _id: { $in: applicantIds },
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      // Step 3: Get applications by these matched applicants
      const applications = await Application.find({
        createdBy: { $in: matchingApplicants.map((u) => u._id) },
      }).select("_id");

      queryObj.applicationId = { $in: applications.map((a) => a._id) };
    }

    // Fetch data with pagination
    const interviewSessions = await InterviewSession.find(queryObj)
      .populate("interviewRoundId")
      .populate("applicationId")
      .sort({ "interviewRoundId.roundNumber": 1, createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    // Get total count
    const total = await InterviewSession.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      data: interviewSessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      message:
        interviewSessions.length > 0
          ? "Interview sessions fetched successfully"
          : "No interview sessions found for this interviewer",
    });
  } catch (error) {
    console.error("Error fetching interview sessions:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Server error while fetching interview sessions",
    });
  }
};

// @desc    Create new interview session
// @route   POST /api/v1/interview/interviewSessions
// @access  Private
exports.createInterviewSession = async (req, res, next) => {
  try {
    const {
      interviewRoundId,
      interviewer,
      applicationId,
      timeRange,
      meetingLink,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !interviewRoundId ||
      !applicationId ||
      !interviewer ||
      !timeRange ||
      !Array.isArray(timeRange) ||
      timeRange.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: interviewRoundId,interviewerId, applicationId, and timeRange are required",
      });
    }

    const [startTime, endTime] = timeRange;
    console.log(startTime, endTime);
    // Check if application exists
    const application = await Application.findById(applicationId).populate('createdBy')
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found with that ID",
      });
    }

    // Get interview round with interviewer
    const interviewRound = await InterViewRound.findById(interviewRoundId);

    if (!interviewRound) {
      return res.status(404).json({
        success: false,
        message: "No interview round found with that ID",
      });
    }

    const interviewerDetails = await User.findById(interviewer);
    if (!interviewerDetails) {
      return res.status(404).json({
        success: false,
        message: "No interviewer found with that ID",
      });
    }

    // Check for scheduling conflicts (both for interviewer and candidate)
    const conflictingSession = await InterviewSession.findOne({
      $or: [
        {
          interviewer: new mongoose.Types.ObjectId(interviewer),
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
          ],
        },
        {
          applicationId,
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
          ],
        },
      ],
    });

    if (conflictingSession) {
      return res.status(400).json({
        success: false,
        message: "Scheduling conflict detected",
        conflictWith: conflictingSession._id,
      });
    }

    // Create new session
    const interviewSession = await InterviewSession.create({
      applicationId,
      interviewRoundId,
      interviewer: interviewer,
      startTime,
      endTime,
      meetingLink: meetingLink || "",
      notes: notes || "",
      status: "scheduled",
    });

    // Push interview session to existing onboarding or create new
    const existingOnboarding = await Onboarding.findOne({ applicationId });

    if (existingOnboarding) {
      existingOnboarding.InterviewSession.push(interviewSession._id);
      await existingOnboarding.save();
    } else {
      const newOnboarding = new Onboarding({
        applicationId,
        InterviewSession: [interviewSession._id],
      });
      await newOnboarding.save();
    }

    const allNotification = await EmailNotification.findOne().lean();

    const recipients = [];

    if (allNotification?.interviewInitiateApplicant && application?.email) {
      recipients.push(application.email);
    }

    if (
      allNotification.interviewInitiateInterviewer &&
      interviewerDetails?.email
    ) {
      recipients.push(interviewerDetails?.email);
    }

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients,
      subject: "Zeelab - Interview Schedule Confirmation",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background-color: #007bff; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0;">Zeelab Interview Scheduled</h2>
              <p style="margin: 0; font-size: 14px;">We're excited to move forward with this interview round!</p>
            </div>
            <div style="padding: 30px;">
              <h3 style="color: #333;">Hello,</h3>
              <p style="color: #555;">We are pleased to inform you that the following interview has been scheduled:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #333; width: 30%;">👤 Candidate:</td>
                  <td style="padding: 10px; color: #555;">${
                    application?.name || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #333; width: 30%;">☎ Details:</td>
                  <td style="padding: 10px; color: #555;">${
                    interviewRound?.name || "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #333; width: 30%;">✎ Round No:</td>
                  <td style="padding: 10px; color: #555;">${
                    interviewRound?.roundNumber || "N/A"
                  }</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                  <td style="padding: 10px; font-weight: bold; color: #333;">🧑‍💼 Interviewer:</td>
                  <td style="padding: 10px; color: #555;">${
                    interviewerDetails?.fullName ||
                    interviewerDetails?.firstName ||
                    "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #333;">🕒 Start Time:</td>
                  <td style="padding: 10px; color: #555;">${new Date(
                    startTime
                  ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                  <td style="padding: 10px; font-weight: bold; color: #333;">⏰ End Time:</td>
                  <td style="padding: 10px; color: #555;">${new Date(
                    endTime
                  ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
                ${
                  meetingLink
                    ? `
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #333;">📍 Meeting Link:</td>
                  <td style="padding: 10px;"><a href="${meetingLink}" style="color: #007bff; word-break: break-all;">${meetingLink}</a></td>
                </tr>`
                    : ""
                }
              </table>
              <p style="margin-top: 30px; color: #777;">Please be prepared and on time. If you have any questions, feel free to reach out to our team.</p>
              <p style="color: #007bff; font-weight: 500;">All the best!</p>
              <p style="color: #333;"><strong>– Zeelab Team</strong></p>
            </div>
            <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);







        await createNotification({
          receiver: interviewerDetails?._id,
          sender: application?.createdBy?._id,
          title: `New Interview assign`,
          message: `${
            application?.createdBy?.firstName || "Someone"
          } assign a new interview`,
          type: "alert",
          link: ``,
        });



const subscribe = await Subscription.findOne({ userId:interviewerDetails?._id });
if (subscribe) {
  await sendPushNotification(
    JSON.stringify({
               title: `New Interview assign`,
      body:`${
            application?.createdBy?.firstName || "Someone"
          } assign a new interview`,
      url:``,
    }),
    subscribe
  );
}










    res.status(201).json({
      success: true,
      message: "Interview created",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update interview session
// @route   PUT /api/v1/interview/interviewSessions/:id
// @access  Private
exports.updateInterviewSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle timeRange if provided
    if (updateData.timeRange) {
      if (!Array.isArray(updateData.timeRange)) {
        return res.status(400).json({
          success: false,
          message: "timeRange must be an array [startTime, endTime]",
        });
      }
      if (updateData.timeRange.length !== 2) {
        return res.status(400).json({
          success: false,
          message:
            "timeRange must contain exactly 2 elements [startTime, endTime]",
        });
      }
      updateData.startTime = updateData.timeRange[0];
      updateData.endTime = updateData.timeRange[1];
      delete updateData.timeRange;
    }

    const session = await InterviewSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No interview session found with that ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: session,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateInterviewSessionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isOutCome } = req.body;

    const session = await InterviewSession.findById(id)
      .populate({
        path: "applicationId",
        populate: {
          path: "createdBy",
        },
      })
      .populate("interviewer");
    console.log(session);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No interview session found with that ID",
      });
    }

    console.log(req.body);

    // Outcome update has priority if isOutCome is true
    if (isOutCome) {
      if (req?.body?.status?.ratings) {
        await InterviewSession.findByIdAndUpdate(id, req.body.status);

        await createNotification({
          receiver: session?.applicationId?.createdBy?._id,
          sender: session?.interviewer?._id,
          title: `Feedback Received From ${session?.interviewer?.firstName || "Someone" }`,
          message: `${
            session?.interviewer?.firstName || "Someone"
          } has provided feedback on application`,
          type: "alert",
          link: `recruitment/application?id=${session?.applicationId?._id}`,
        });



const subscribe = await Subscription.findOne({ userId: session?.applicationId?.createdBy?._id });
if (subscribe) {
  await sendPushNotification(
    JSON.stringify({
        title: `Feedback Received From ${session?.interviewer?.firstName || "Someone" }`,
      body:  `${
            session?.interviewer?.firstName || "Someone"
          } has provided feedback on application`,
      url: `recruitment/application?id=${session?.applicationId?._id}`
    }),
    subscribe
  );
}





        return res.status(200).json({
          success: true,
          message: "Feedback Updated!",
        });
      }

      const validOutcome = ["selected", "rejected", "hold"];
      if (!validOutcome.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid outcome value. Allowed: selected, rejected, hold",
        });
      }
      session.outcome = status;
    }
    // Status update
    else {
      session.status = status;
    }

    await session.save();

        await createNotification({
          receiver: session?.applicationId?.createdBy?._id,
          sender: session?.interviewer?._id,
          title: `Feedback Received From ${session?.interviewer?.firstName || "Someone" }`,
          message: `${
            session?.interviewer?.firstName || "Someone"
          } has provided feedback on application`,
          type: "alert",
          link: `recruitment/application?id=${session?.applicationId?._id}`,
        });



const subscribe = await Subscription.findOne({ userId: session?.applicationId?.createdBy?._id });
if (subscribe) {
  await sendPushNotification(
    JSON.stringify({
        title: `Feedback Received From ${session?.interviewer?.firstName || "Someone" }`,
      body:  `${
            session?.interviewer?.firstName || "Someone"
          } has provided feedback on application`,
      url: `recruitment/application?id=${session?.applicationId?._id}`
    }),
    subscribe
  );
}



    return res.status(200).json({
      success: true,
      message: "Interview session updated successfully",
      data: session,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Delete interview session
// @route   DELETE /api/v1/interview/interviewSessions/:id
// @access  Private
exports.deleteInterviewSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "No interview session found with that ID",
      });
    }
    await Onboarding.findOneAndUpdate(
      { applicationId: session.applicationId },
      { $pull: { InterviewSession: session._id } }
    );

    await session.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Get interview sessions for a specific application
// @route   GET /api/v1/interview/interviewSessions/application/:applicationId
// @access  Private
exports.getSessionsForApplication = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({
      applicationId: req.params.applicationId,
    })
      .populate({
        path: "interviewRoundId", // correct field name in InterviewSession
        populate: {
          path: "interviewer", // nested field inside InterviewRound
          model: "User", // make sure 'User' is the correct model name
        },
      })
      .populate("applicationId") // optional: if you want full application details
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// controllers/interviewSessionController.js

// Get statistics for ongoing interviews
exports.getInterviewStats = async (req, res) => {
  try {
    const { createdBy } = req.params;

    // Get all applications created by this user
    const applications = await Application.find({ createdBy });

    const applicationIds = applications.map((app) => app._id);

    const stats = await InterviewSession.aggregate([
      {
        $match: {
          applicationId: { $in: applicationIds },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await InterviewSession.countDocuments({
      applicationId: { $in: applicationIds },
    });

    const formattedStats = {
      total,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get filtered interview sessions with Mongoose pagination
exports.getInterviewSessions = async (req, res) => {
  try {
    const { createdBy } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      interviewer,
      candidateName,
      sortField = "updatedAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get all applications created by this user
    const applications = await Application.find({ createdBy });
    const applicationIds = applications.map((app) => app._id);

    // Build the base query
    let query = { applicationId: { $in: applicationIds } };

    // Add filters
    if (status) query.status = status;
    if (interviewer) query.interviewer = mongoose.Types.ObjectId(interviewer);

    // Date filter
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Candidate name filter (search in applications)
    if (candidateName) {
      // const nameFilteredApps = await Application.find({
      //   _id: { $in: applicationIds },
      //   name: { $regex: candidateName, $options: 'i' }
      // });

      const uniqueInterviewerIds = await InterviewSession.distinct(
        "interviewer"
      );
      console.log(uniqueInterviewerIds);

      const nameFilteredInterviwers = await User.find({
        _id: { $in: uniqueInterviewerIds },
        firstName: { $regex: candidateName, $options: "i" },
      });

      // query.applicationId = { $in: nameFilteredApps.map(app => app._id) };
      query.interviewer = {
        $in: nameFilteredInterviwers.map((app) => app._id),
      };
    }

    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === "desc" ? -1 : 1;

    // Get total count
    const total = await InterviewSession.countDocuments(query);

    // Get paginated results
    const docs = await InterviewSession.find(query)
      .populate([
        {
          path: "applicationId",
          select: "name position email ",
          populate: {
            path: "jobId",
            select: "title",
          },
        },
        { path: "interviewer", select: "firstName" },
        { path: "interviewRoundId", select: "name" },
      ])
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.status(200).json({
      docs,
      total,
      limit: limitNumber,
      page: pageNumber,
      totalPages,
      hasNextPage,
      hasPrevPage,
      pagingCounter: (pageNumber - 1) * limitNumber + 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interview sessions for a specific interviewer
// @route   GET /api/v1/interview/interviewSessions/interviewer/:interviewerId
// @access  Private
exports.getSessionsForInterviewer = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    let query = InterviewSession.find({
      interviewerId: req.params.interviewerId,
    })
      .populate("application")
      .populate("interviewRound");

    if (from && to) {
      query = query
        .where("startTime")
        .gte(new Date(from))
        .where("endTime")
        .lte(new Date(to));
    }

    const sessions = await query.sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
