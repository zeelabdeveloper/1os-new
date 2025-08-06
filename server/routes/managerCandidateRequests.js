const express = require("express");
const router = express.Router();
const EmployeeRequest = require("../models/ManagerCandidateRequest");
const EmailNotification = require("../models/setting/emailNotification");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Department = require("../models/Department");
const sendEmail = require("../services/sendInterviewScheduledEmail");
const { EmailConfig } = require("../helper/emailConfig");
const mongoose = require("mongoose");
const { createNotification, sendPushNotification } = require("../helper/l1");
const Subscription = require("../models/Subscription");
const { getFeedbackMailFromReviwer, getFeedbackMailFromManagerForManpower } = require("../services/RejectionMail");




// Create a new employee request (Manager)
router.post("/employeeRequests", async (req, res) => {
  try {

console.log(req.body)
const manager=await User.findById(req.body.managerId)
if(!manager) return res.status(404).json({message:"You are Not in Zeelab."})
 
    // Create the new employee request
    const request = new EmployeeRequest({
      ...req.body,
    });

    // Save the request first to get the ID
    const savedRequest = await request.save();

    const org = await Organization.findOne({
      isActive: true,
      user: savedRequest.managerId,
    }).populate("user");

    const department = await Department.findById(org?.department).populate(
      "head"
    );

    savedRequest.updatedBy = department.head._id;
    await request.save();

    // Check if email notifications are enabled for new hiring requests
    const notificationConfig = await EmailNotification.findOne({
      managerRequestRegardingNewHiring: true,
    });
  
    if (notificationConfig) {
      // Get the manager's organization and department head

      if (department && department.head) {
        const emailHTML = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
            <div style="background: #1890ff; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 10px 0 0; font-size: 24px;">New Hiring Request Notification</h1>
            </div>
            
            <div style="padding: 25px;">
              <h2 style="color: #2c3e50; margin-top: 0;">New Employee Request from ${
                org?.user?.firstName
              }</h2>
              
              <div style="margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Department:</p>
                <p style="margin: 5px 0 15px;">${request.department}</p>
                
                <p style="margin: 0; font-weight: bold;">Position:</p>
                <p style="margin: 5px 0 15px;">${request.position}</p>
                
                <p style="margin: 0; font-weight: bold;">Urgency:</p>
                <p style="margin: 5px 0 15px; text-transform: capitalize;">${
                  request.urgency
                }</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Job Description:</p>
                <p style="margin: 10px 0 0;">${request.jobDescription}</p>
              </div>
              
             
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #95a5a6;">
              <p style="margin: 0;">© ${new Date().getFullYear()} ${"Zee Lab"}. All rights reserved.</p>
              <p style="margin: 5px 0 0;">This is an automated notification email.</p>
            </div>
          </div>
          `;

        // Send email to department head
        await sendEmail({
          from: `${EmailConfig.mailUsername} <${EmailConfig.mailFromAddress}>`,
          to: department?.head?.email,
          subject: `🚀 New Hiring Request: ${request.position} in ${request.department}`,
          html: emailHTML,
        });
      }
    }



  await createNotification({
      receiver: department.head._id,
      sender: savedRequest.managerId, // assuming the current user is available in req.user
      title: `${manager.firstName} Requested for Man Power.`,
      message: `go to Review and give a feedback.`,
      type: "alert",
      link: `support/manager-request`,
    });

    const subscribe = await Subscription.findOne({ userId:department.head._id  });
    if (subscribe) {
      await sendPushNotification(
        JSON.stringify({
          title: `${manager.firstName} Requested for Man Power.`,
          body:  `go to Review and give a feedback.`,
          url: `support/manager-request`
        }),

subscribe

      );
    }





    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating employee request:", error);
    res.status(400).json({
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});




// Add this new route to your backend
router.get("/employeeRequests/filtered", async (req, res) => {
  try {
    const { 
      managerId, 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      month,
      year 
    } = req.query;

    const query = { managerId };

    // Status filter
    if (status) {
      query.status = status;
    }
console.log(startDate,endDate)
    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Month/year filter
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.createdAt = { $gte: start, $lte: end };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: "managerId"
    };

    const result = await EmployeeRequest.paginate(query, options);

    // Add counts for different statuses
    const counts = await EmployeeRequest.aggregate([
      { $match: { managerId:new mongoose.Types.ObjectId(managerId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      requests: result.docs,
      total: result.totalDocs,
      pages: result.totalPages,
      currentPage: result.page,
      counts: counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});








router.get("/employeeRequests/manager/:id", async (req, res) => {
  try {
    const requests = await EmployeeRequest.find({
      managerId: req.params.id,
    }).sort({ createdAt: -1 }).populate("managerId")
    
    res.json(requests);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});









router.delete("/employeeRequests/:id", async (req, res) => {
  try {
    const request = await EmployeeRequest.findByIdAndDelete(req.params.id);

    res.status(201).json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all requests (Admin)
router.get("/admin", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view all requests" });
    }

    const requests = await EmployeeRequest.find().populate(
      "managerId",
      "name email"
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get requests from creator


// // get list from manager 
// router.get("/employeeRequests/FromManager/:id", async (req, res) => {
//   try {
//     const requests = await EmployeeRequest.find({
//       updatedBy: req.params.id,
//     }).sort({ createdAt: -1 }).populate("managerId")
//     res.json(requests);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update request status (Admin)
// router.patch("/employeeRequests/:id", async (req, res) => {
//   try {
     

     
//     const request = await EmployeeRequest.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!request) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     res.json(request);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });










router.get("/employeeRequests/FromManager/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate 
    } = req.query;

    const query = { updatedBy: id };

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Get paginated results
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: "managerId"
    };

    const requests = await EmployeeRequest.paginate(query, options);

    // Get stats
    const stats = await EmployeeRequest.aggregate([
      { $match: { updatedBy:new mongoose.Types.ObjectId(id) } },
      { 
        $group: { 
          _id: null,
          pending: { 
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } 
          },
          approved: { 
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } 
          },
          rejected: { 
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } 
          },
          fulfilled: { 
            $sum: { $cond: [{ $eq: ["$status", "fulfilled"] }, 1, 0] } 
          },
          highUrgency: { 
            $sum: { $cond: [{ $eq: ["$urgency", "high"] }, 1, 0] } 
          },
          mediumUrgency: { 
            $sum: { $cond: [{ $eq: ["$urgency", "medium"] }, 1, 0] } 
          },
          lowUrgency: { 
            $sum: { $cond: [{ $eq: ["$urgency", "low"] }, 1, 0] } 
          },
          total: { $sum: 1 }
        } 
      }
    ]);

    res.json({
      data: requests.docs,
      total: requests.totalDocs,
      page: requests.page,
      pages: requests.totalPages,
      stats: stats[0] || {
        pending: 0,
        approved: 0,
        rejected: 0,
        fulfilled: 0,
        highUrgency: 0,
        mediumUrgency: 0,
        lowUrgency: 0,
        total: 0
      }
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update request
router.patch("/employeeRequests/:id", async (req, res) => {
  try {

console.log(req.body)


    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const request = await EmployeeRequest.findByIdAndUpdate(id, updateData, {
      new: true
    }   ).populate("managerId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }





      await getFeedbackMailFromManagerForManpower(request.createdBy, oldApplicaiton.managerIdForReview, oldApplicaiton);

 




// Create notification for the creator about the manager's feedback
await createNotification({
  receiver: oldApplicaiton?.createdBy?._id,  // Who receives the notification (original creator)
  sender: oldApplicaiton?.managerIdForReview?._id,  // Who sent the feedback (manager)
  title: `Feedback Received on Application`,
  message: `${oldApplicaiton?.managerIdForReview?.firstName} has provided ${application.managerReview.status} feedback on application (ID: ${id})`,
  type: "system",
  link: `recruitment/application?id=${application._id}`,
});

// Find subscription for the creator to send push notification
const subscribe = await Subscription.findOne({ userId: oldApplicaiton?.createdBy?._id });
if (subscribe) {
  await sendPushNotification(
    JSON.stringify({
      title: "Feedback Received!",
      body: `${oldApplicaiton?.managerIdForReview?.firstName} has reviewed the application you assigned`,
      url: `recruitment/application?id=${application._id}`
    }),
    subscribe
  );
}



















    res.json(request);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(400).json({ message: error.message });
  }
});







// Add candidate details (Admin)
router.patch("/:id/candidate", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can add candidate details" });
    }

    const request = await EmployeeRequest.findByIdAndUpdate(
      req.params.id,
      {
        candidateDetails: req.body,
        status: "fulfilled",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
