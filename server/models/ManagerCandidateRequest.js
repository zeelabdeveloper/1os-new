const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const employeeRequestSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  firstManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },




 history: [{
    handler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    
    },
    action: {
      type: String,
     
       
    },
    field: String,  
    oldValue: mongoose.Schema.Types.Mixed,  
    newValue: mongoose.Schema.Types.Mixed,
    notes: String,  
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]

,




  department: {
    type: String,
  },
  position: {
    type: String,
  },
  countRequired: [
    {
      type: String,
    },
  ],
  store: {
    type: String,
  },
  jobDescription: {
    type: String,
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "fulfilled"],
    default: "pending",
  },
  adminFeedback: {
    type: String,
    default: "",
  },

  candidateDetails: {
    name: String,
    resumeUrl: String,
    contact: String,
    interviewDate: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}  , {timestamps:true}  );

employeeRequestSchema.plugin(mongoosePaginate);

const managerCandidateRequests = mongoose.model(
  "ManagerCandidateRequest",
  employeeRequestSchema
);




module.exports = managerCandidateRequests;
