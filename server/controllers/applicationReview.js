const { createNotification, sendPushNotification } = require("../helper/l1");
const Application = require("../models/jobs/applicationSchema");
const Subscription = require("../models/Subscription");
const { getFeedbackMailFromReviwer } = require("../services/RejectionMail");

 

// Get applications for manager review with pagination
exports.getManagerApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10,managerId, status, search } = req.query;
     

    const query = {
      managerIdForReview: managerId,
      ...(status && { "managerReview.status": status }),
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'jobId.title': { $regex: search, $options: 'i' } }
        ]
      })
    };

    const applications = await Application.find(query)
      .populate("jobId", "title department")
      .populate("createdBy", "name")
     .populate({
  path: "managerReview.reviewedBy",
  select: "firstName",
  model: "User"
})
      .sort({ "managerReview.assignedAt": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
 
    const count = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalApplications: count
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};










// Update manager review
exports.updateManagerReview = async (req, res) => {
  try {
    const { id } = req.params;
   
    const { status, note } = req.body;
const oldApplicaiton=await Application.findById(id).populate('createdBy').populate('managerIdForReview')

if(!oldApplicaiton){
    return res.status(404).json({ message: "Application not found" });
}

    const application = await Application.findByIdAndUpdate(
      {
        _id: id,
       
      },
      {
        $set: {
          'managerReview.reviewedBy': oldApplicaiton?.managerIdForReview?._id,
          'managerReview.status': status,
          'managerReview.note': note,
          managerIdForReview:oldApplicaiton?.createdBy?._id,
          'managerReview.feedbackAt': status ? new Date() : undefined
        }
      },
      { new: true }
    ).populate("jobId", "title department");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }











      await getFeedbackMailFromReviwer(oldApplicaiton.createdBy, oldApplicaiton.managerIdForReview, oldApplicaiton);

 




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













    res.json(application);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};







// Get application details
exports.getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;
 

    const application = await Application.findOne({
      _id: id,
       
    })
    .populate("jobId", "title department description")
    .populate("createdBy", "name email")
    .populate("senderId", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};