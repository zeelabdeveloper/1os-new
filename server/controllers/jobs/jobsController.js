const { default: mongoose } = require("mongoose");
const { EmailConfig } = require("../../helper/emailConfig");
const Application = require("../../models/jobs/applicationSchema");

const InterviewSession = require("../../models/jobs/InterviewSession");
const Job = require("../../models/jobs/jobsSchema");
const Onboarding = require("../../models/jobs/Onboarding");
const EmailNotification = require("../../models/setting/emailNotification");
const User = require("../../models/User");
const {
  RejectionMail,
  onboardingMail,
  CVTransftermail,
} = require("../../services/RejectionMail");
const sendEmail = require("../../services/sendInterviewScheduledEmail");
const { application } = require("express");
const Notification = require("../../models/Notification");
const { createNotification, sendPushNotification } = require("../../helper/l1");
const Subscription = require("../../models/Subscription");

// Create a new job
const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
    };

    const newJob = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }
    console.error("Error creating job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// Get all jobs with filtering and pagination
const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      experience,
      sort,
      page = 1,
      limit = 10,
    } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (experience) {
      query.experience = experience;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "a-z") sortOption = { title: 1 };
    else if (sort === "z-a") sortOption = { title: -1 };

    const jobs = await Job.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("postedBy", "firstName email")
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    const count = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email")
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }
    console.error("Error fetching job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }
    console.error("Error updating job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: job,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }
    console.error("Error deleting job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const inactiveJobs = totalJobs - activeJobs;
    console.log(totalJobs, activeJobs, inactiveJobs);
    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        inactiveJobs,
      },
    });
  } catch (error) {
    console.error("Error fetching job stats:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job statistics",
      error: error.message,
    });
  }
};

// const getApplicationsForJob = async (req, res) => {
//   try {
//     const { startDate, endDate, jobId } = req.query;

//     // Base query - always filter by job ID

//     let query = {};

//     if (jobId) {
//       query.jobId = jobId;
//     }

//     // Handle date filter if provided
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         query.appliedAt = {
//           $gte: new Date(start.setHours(0, 0, 0, 0)), // start of day
//           $lte: new Date(end.setHours(23, 59, 59, 999)), // end of day
//         };
//       }
//     }

//     const applications = await Application.find(query)
//       .sort({ appliedAt: -1 })
//       .populate("jobId");

//     res.status(200).json(applications);
//   } catch (error) {
//     console.error("Error fetching applications:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch applications",
//       error: error.message,
//     });
//   }
// };

const getApplicationsForJob = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      jobId,
      search,
      page = 1,
      limit = 10,
      createdBy,
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (jobId) {
      query.jobId = jobId;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Handle search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { currentLocation: { $regex: search, $options: "i" } },
      ];
    }

    // Handle date filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        query.appliedAt = {
          $gte: new Date(start.setHours(0, 0, 0, 0)), // start of day
          $lte: new Date(end.setHours(23, 59, 59, 999)), // end of day
        };
      }
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("jobId"),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

const assignApplications = async (req, res) => {
  const { id } = req.params; // application ID
  const { assignType, personId } = req.body;

  try {
    const person = await User.findById(personId);
    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Person not found",
      });
    }
    const ApplicationDetails = await Application.findById(id).populate(
      "createdBy"
    );
    if (!ApplicationDetails) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    let updateFields = {};

    if (assignType === "hr") {
      updateFields.createdBy = person._id;
      updateFields.senderId = ApplicationDetails.createdBy;
    } else if (assignType === "manager") {
      updateFields.managerIdForReview = person._id;
      updateFields.managerReview = {
        ...ApplicationDetails.managerReview,
        reviewedBy:ApplicationDetails.createdBy._id,
        assignedAt: new Date(),
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid assignType. Must be 'hr' or 'manager'.",
      });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("createdBy");

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    await CVTransftermail(ApplicationDetails, person, assignType);

    await createNotification({
      receiver: person._id,
      sender: ApplicationDetails?.createdBy?._id, // assuming the current user is available in req.user
      title: `Application Assignment - ${
        assignType === "hr" ? "HR Review" : "Manager Review"
      }`,
      message: `You have been assigned an application (ID: ${id}) for ${
        assignType === "hr" ? "HR processing" : "manager review"
      }`,
      type: "task",
      link: `recruitment/application/review?id=${ApplicationDetails._id}`,
    });

    const subscribe = await Subscription.findOne({ userId: person._id });
    if (subscribe) {
      await sendPushNotification(
        JSON.stringify({
          title: "New Application Assigned!",
          body: `${ApplicationDetails?.createdBy.firstName} assigned an application `,
          url: `recruitment/application/review?id=${ApplicationDetails._id}`
        }),

subscribe

      );
    }

    res.status(200).json({
      success: true,
      message: `Application successfully assigned to ${assignType}`,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error assigning application:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign application",
    });
  }
};

const getHiredApplicationsForJob = async (req, res) => {
  console.log(req.params.id);
  try {
    const applications = await Application.aggregate([
      {
        $match: {
          status: { $in: ["onboarded", "onboarding"] },
          createdBy: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "onboardings",
          localField: "_id",
          foreignField: "applicationId",
          as: "onboarding",
        },
      },
      {
        $addFields: {
          onboarding: { $arrayElemAt: ["$onboarding", 0] },
        },
      },
    ]);

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// const fetchApplicationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const applications = await Application.findById(id).populate("jobId");

//     const InterviewSessionsss=await InterviewSession.find({applicationId:applications._id})
//     if(InterviewSessionsss.length>0){
//       InterviewSessionsss.map(int=>{
//         const passingScore=int.
//         int.answer.map(S=>console.log(S))
//       })
//     }

//     res.status(200).json(applications);
//   } catch (error) {
//     console.error("Error fetching applications:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch applications",
//       error: error.message,
//     });
//   }
// };

// const fetchApplicationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch application with job details
//     const application = await Application.findById(id).populate("jobId");
//     if (!application) {
//       return res.status(404).json({
//         success: false,
//         message: "Application not found",
//       });
//     }

//     // Fetch all interview sessions for this application
//     const interviewSessions = await InterviewSession.find({
//       applicationId: application._id,
//     }).populate("interviewRoundId");

//     // Calculate interview statistics
//     let totalInterviews = interviewSessions.length;
//     let completedInterviews = 0;
//     let passedInterviews = 0;
//     let totalScore = 0;
//     let maxScorePossible = 0;
//     let interviewDetails = [];

//     interviewSessions.forEach((session) => {
//       if (session.status === "completed") {
//         completedInterviews++;

//         // Calculate score for this interview if answers exist
//         let sessionScore = 0;
//         let roundMaxScore = 0;

//         if (session.answer && session.interviewRoundId?.questions) {
//           session.interviewRoundId.questions.forEach((question, index) => {
//             roundMaxScore += question.weightage;

//             if (session.answer[index] === question.expectedAnswer) {
//               sessionScore += question.weightage;
//             }
//           });

//           totalScore += sessionScore;
//           maxScorePossible += roundMaxScore;

//           // Check if passed this round
//           const passingScore = session.interviewRoundId.passingScore || 70;
//           const percentage = (sessionScore / roundMaxScore) * 100;

//           if (percentage >= passingScore) {
//             passedInterviews++;
//           }
//         }

//         interviewDetails.push({
//           roundNumber: session.interviewRoundId?.roundNumber,
//           roundName: session.interviewRoundId?.name,
//           interviewer: session.interviewRoundId?.interviewer,
//           score: sessionScore,
//           maxScore: roundMaxScore,
//           percentage: roundMaxScore > 0 ? Math.round((sessionScore / roundMaxScore) * 100) : 0,
//           status: session.outcome,
//           feedback: session.notes,
//           comments: session.comments,
//         });
//       }
//     });

//     // Prepare final response
//     const response = {
//        ...application,
//       interviewStatistics: {
//         totalInterviews,
//         completedInterviews,
//         passedInterviews,
//         overallScore: totalScore,
//         maxPossibleScore: maxScorePossible,
//         overallPercentage: maxScorePossible > 0 ? Math.round((totalScore / maxScorePossible) * 100) : 0,
//       },
//       interviewDetails,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching application:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch application details",
//       error: error.message,
//     });
//   }
// };

// const fetchApplicationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch application with job details
//     const application = await Application.findById(id).populate("jobId");
//     if (!application) {
//       return res.status(404).json({
//         success: false,
//         message: "Application not found",
//       });
//     }

//     // Fetch all interview sessions for this application and populate interviewer details
//     const interviewSessions = await InterviewSession.find({
//       applicationId: application._id,
//     }).populate({
//       path: "interviewRoundId",
//       populate: {
//         path: "interviewer",
//         model: "User",
//         select: "firstName email" // Select only necessary fields
//       }
//     });

//     // Calculate interview statistics
//     let totalInterviews = interviewSessions.length;
//     let completedInterviews = 0;
//     let passedInterviews = 0;
//     let totalScore = 0;
//     let maxScorePossible = 0;
//     let interviewDetails = [];

//     interviewSessions.forEach((session) => {
//       if (session.status === "completed") {
//         completedInterviews++;

//         // Calculate score for this interview if answers exist
//         let sessionScore = 0;
//         let roundMaxScore = 0;
//         let passingScore = session?.interviewRoundId?.passingScore || 72;
//         let TotalQuestion=Array.isArray(session.answer) && session.answer.length || 0
//         let RightQuestion=0;
//         if (session.answer &&  Array.isArray(session.answer)) {
//           session?.answer?.forEach((question, index) => {
//             console.log(session.answer[index])

//             if (question?.answer === question?.expectedAnswer) {
//               RightQuestion++
//             }
//           });
//           const IsPassedOnThisInterview=
//           totalScore += sessionScore;
//           maxScorePossible += roundMaxScore;

//           // Get passing score for this round
//           passingScore = session.interviewRoundId.passingScore || 70;
//           const percentage = (sessionScore / roundMaxScore) * 100;

//           if (percentage >= passingScore) {
//             passedInterviews++;
//           }
//         }

//         interviewDetails.push({
//           roundNumber: session.interviewRoundId?.roundNumber,
//           roundName: session.interviewRoundId?.name,
//           interviewer: {
//             _id: session.interviewRoundId?.interviewer?._id,
//             name: session.interviewRoundId?.interviewer?.firstName,
//             email: session.interviewRoundId?.interviewer?.email
//           },
//           score: sessionScore,
//           maxScore: roundMaxScore,
//           passingScore: passingScore, // Include passing score for each round
//           percentage: roundMaxScore > 0 ? Math.round((sessionScore / roundMaxScore) * 100) : 0,
//           status: session.outcome,
//           feedback: session.notes,
//           comments: session.comments,
//         });
//       }
//     });

//     // Prepare final response in the requested format
//     const response = {
//       ...application.toObject(), // Convert mongoose document to plain object
//       interviewStatistics: {
//         totalInterviews,
//         completedInterviews,
//         passedInterviews,
//         overallScore: totalScore,
//         maxPossibleScore: maxScorePossible,
//         passingPercentage: 70, // Overall passing percentage (can be customized)
//         overallPercentage: maxScorePossible > 0 ? Math.round((totalScore / maxScorePossible) * 100) : 0,
//       },
//       interviewDetails,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching application:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch application details",
//       error: error.message,
//     });
//   }
// };

// const fetchApplicationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch application with job details
//     const application = await Application.findById(id).populate("jobId");
//     if (!application) {
//       return res.status(404).json({
//         success: false,
//         message: "Application not found",
//       });
//     }

//     // Fetch all interview sessions for this application and populate interviewer details
//     const interviewSessions = await InterviewSession.find({
//       applicationId: application._id,
//     }).populate({
//       path: "interviewRoundId",
//       populate: {
//         path: "interviewer",
//         model: "User",
//         select: "firstName email",
//       },
//     });

//     // Calculate interview statistics
//     let totalInterviews = interviewSessions.length;
//     let completedInterviews = 0;
//     let passedInterviews = 0;
//     let totalRightQuestions = 0;
//     let totalQuestions = 0;
//     let interviewDetails = [];

//     interviewSessions.forEach((session) => {
//       if (session.status === "completed") {
//         completedInterviews++;

//         // Calculate score based on right answers
//         let rightQuestions = 0;
//         let totalRoundQuestions = 0;
//         let passingScore = session?.interviewRoundId?.passingScore || 72;

//         if (session.answer && Array.isArray(session.answer)) {
//           totalRoundQuestions = session.answer.length;
//           session.answer.forEach((question) => {
//             if (question?.answer === question?.expectedAnswer) {
//               rightQuestions++;
//             }
//           });
//         }

//         totalRightQuestions += rightQuestions;
//         totalQuestions += totalRoundQuestions;

//         // Check if passed this round
//         const percentage =
//           totalRoundQuestions > 0
//             ? Math.round((rightQuestions / totalRoundQuestions) * 100)
//             : 0;

//         const isPassed = percentage >= passingScore;
//         if (isPassed) {
//           passedInterviews++;
//         }

//         interviewDetails.push({
//           roundNumber: session.interviewRoundId?.roundNumber,
//           roundName: session.interviewRoundId?.name,
//           interviewer: {
//             _id: session.interviewRoundId?.interviewer?._id,
//             name: session.interviewRoundId?.interviewer?.firstName,
//             email: session.interviewRoundId?.interviewer?.email,
//           },
//           rightQuestions,
//           totalQuestions,
//           passingScore,
//           percentage,
//           status: isPassed ? "passed" : "failed",
//           feedback: session?.notes,
//           comments: session?.comments,
//           outcome: session?.outcome,
//           interviewerStatus: session?.status,
//         });
//       }
//     });

//     // Prepare final response
//     const response = {
//       ...application.toObject(),
//       interviewStatistics: {
//         totalInterviews,
//         completedInterviews,
//         passedInterviews,
//         totalRightQuestions,
//         totalQuestions,

//         overallPercentage:
//           totalQuestions > 0
//             ? Math.round((totalRightQuestions / totalQuestions) * 100)
//             : 0,
//       },
//       interviewDetails,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching application:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch application details",
//       error: error.message,
//     });
//   }
// };

const fetchApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch application with job details
  const application = await Application.findById(id)
  .populate("jobId")
  .populate('managerIdForReview')
  .populate({
    path: 'managerReview.reviewedBy',
    select: 'firstName lastName email'  
  });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Fetch all interview sessions for this application and populate interviewer details
    const interviewSessions = await InterviewSession.find({
      applicationId: application._id,
    })
      .populate("interviewRoundId")
      .populate("interviewer");

    // Calculate interview statistics
    let totalInterviews = interviewSessions.length;
    let completedInterviews = 0;
    let passedInterviews = 0;
    let totalMarksObtained = 0;
    let totalPossibleMarks = 0;
    let interviewDetails = [];

    interviewSessions.forEach((session) => {
      if (session.status === "completed") {
        completedInterviews++;

        // Calculate score based on right and wrong answers
        let marksObtained = 0;
        let roundPossibleMarks = 0;
        let passingScore = session?.interviewRoundId?.passingScore || 72;

        if (session.answer && Array.isArray(session.answer)) {
          roundPossibleMarks = session.answer.length; // Each question worth 1 mark
          session.answer.forEach((question) => {
            if (question?.answer === question?.expectedAnswer) {
              marksObtained += 1; // +1 for correct answer
            } else if (
              !question.answer ||
              question?.answer !== undefined ||
              question?.answer !== null
            ) {
              marksObtained -= 0.25; // -0.25 for wrong answer
            }
            // No marks deducted for unanswered questions
          });
        }

        // Ensure marks don't go negative for the round
        marksObtained = Math.max(0, marksObtained);
        totalMarksObtained += marksObtained;
        totalPossibleMarks += roundPossibleMarks;

        // Check if passed this round
        const percentage =
          roundPossibleMarks > 0
            ? Math.round((marksObtained / roundPossibleMarks) * 100)
            : 0;

        const isPassed = percentage >= passingScore;
        if (isPassed) {
          passedInterviews++;
        }

        interviewDetails.push({
          roundNumber: session.interviewRoundId?.roundNumber,
          roundName: session.interviewRoundId?.name,
          interviewer: {
            _id: session.interviewer?._id,
            name: session.interviewer?.firstName || "User Not Found!",
            email: session?.interviewer?.email || "No Email Found!",
          },
          marksObtained,
          possibleMarks: roundPossibleMarks,
          passingScore,
          percentage,
          status: isPassed ? "passed" : "failed",
          feedback: session?.notes,
          comments: session?.comments,
          outcome: session?.outcome,
          interviewerStatus: session?.status,
        });
      }
    });

    // Prepare final response
    const response = {
      ...application.toObject(),
      interviewStatistics: {
        totalInterviews,
        completedInterviews,
        passedInterviews,
        totalMarksObtained,
        totalPossibleMarks,
        overallPercentage:
          totalPossibleMarks > 0
            ? Math.round((totalMarksObtained / totalPossibleMarks) * 100)
            : 0,
      },
      interviewDetails,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
      error: error.message,
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    console.log(req.body);
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        $push: {
          history: {
            status: req.body.status,
            date: new Date(),
            notes: req.body.notes || "",
          },
        },
      },
      { new: true }
    );

    if (!application) {
      res.status(404).json({ message: "Applications Not Found!" });
    }

    if (req.body.status !== "hired" || req.body.status !== "onboarding") {
      await Onboarding.findOneAndDelete({ application: application._id });
    }
    if (req.body.status === "rejected") {
      await RejectionMail(application);
    }

    if (req.body.status === "onboarding") {
      await onboardingMail(application);
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update application",
      error: error.message,
    });
  }
};

// const updateApplicationAllStatus = async (req, res) => {
//  console.log(req.body)
//   try {
//     const application = await Application.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body
//       },
//       { new: true }
//     );
// console.log(application)
//     res.status(200).json(application);
//   } catch (error) {
//     console.error("Error updating application:", error);
//     res.status(error.statusCode || 500).json({
//       success: false,
//       message: error.message || "Failed to update application",
//       error: error.message,
//     });
//   }
// };

const updateApplicationAllStatus = async (req, res) => {
  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { ...req?.body?.data },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application",
      error: error.message,
    });
  }
};

const deleteApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      res.status(404).json({ message: "Applications Not Found!" });
    }

    await InterviewSession.deleteMany({ applicationId: application._id });

    res.status(200).json({ message: "Deleted Application SuccessFully." });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update application",
      error: error.message,
    });
  }
};

const createApplication = async (req, res) => {
  try {
    let resumePath = "";
    if (req.file) {
      resumePath = `/uploads/company/${req.file.filename}`;
    }
    const { phone, email } = req.body;

    const existedUser = await User.findOne({
      $or: [{ contactNumber: phone }, { email: email }],
    });

    if (existedUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    const app = await Application.findOne({
      $or: [{ phone: phone }, { email: email }],
    });

    if (app) {
      return res.status(400).json({ message: "Application already exists." });
    }

    const application = await Application.create({
      ...req.body,

      resume: resumePath,
      status: "applied",
    });

    const allNotification = await EmailNotification.findOne();
    if (allNotification.newApplicationStatus) {
      // Generate tracking URL
      const trackingUrl = `http://139.59.85.95/career/application?id=${application._id}`;

      const mailOptions = {
        from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
        to: req.body.email, // Using email from application body
        subject: "Your Zeelab Application Has Been Received",
        html: `
<!DOCTYPE html>
<html>
<head>
    <style type="text/css">
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4f46e5;
            color: white;
            padding: 25px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .info-box {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: 600;
            color: #4f46e5;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Received!</h1>
        </div>
        <div class="content">
            <p>Hello ${req.body.name},</p>
            <p>Thank you for applying with Zeelab. We've received your application.</p>
            
            <div class="info-box">
                <div class="info-item">
                    <span class="label">Application ID:</span> ${
                      application._id
                    }
                </div>
                <div class="info-item">
                    <span class="label">Current Status:</span> Applied
                </div>
            </div>
            
            <p>You can track your application status using the link below:</p>
            
            <a href="${trackingUrl}" class="button">Track Your Application</a>
            
            <p>We'll review your application and get back to you soon.</p>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© ${new Date().getFullYear()} Zeelab. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
      };

      const emailResult = await sendEmail(mailOptions);

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error);
        // Don't return error here - application was created successfully
      }
    }

    res.status(201).json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create application",
      error: error.message,
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  assignApplications,
  updateJob,
  deleteJob,
  getJobStats,
  deleteApplicationStatus,
  getApplicationsForJob,
  updateApplicationStatus,
  updateApplicationAllStatus,
  createApplication,
  getHiredApplicationsForJob,
  fetchApplicationById,
};
