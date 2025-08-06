const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    managerIdForReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    managerReview: {
      assignedAt: Date,  
      feedbackAt: Date,  
      status: {
        type: String,
        enum: ["pending", "selected", "rejected", "on_hold"],
        default: "pending",
      },

 reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },


      note: String,
    },

    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    currentLocation: {
      type: String,
    },
    division: {
      type: String,
    },
    position: {
      type: String,
    },
    zone: {
      type: String,
    },
    salary: {
      type: String,
    },
    experience: {
      type: String,
    },
    education: {
      type: String,
    },
    currentCompany: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: Date,
    weaknesses: String,
    resume: {
      type: String,
    },
    history: {
      type: {},
    },
    coverLetter: String,
    status: {
      type: String,
      // enum:["appliend"  ,"onboarding" , "onboarded" , "interview_round", "rejected" ,"on_hold" , "telephonic"   ]
      default: "applied",
    },
    notes: String,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
