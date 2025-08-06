 
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  expectedAnswer: {
    type: Boolean,
    required: true
  },
  weightage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  }
});

const interviewRoundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roundNumber: {
      type: Number,
      required: true,
      unique: true
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     
    },
    description: {
      type: String,
      trim: true,
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      required: true,
      default: 70
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 30
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const InterViewRound = mongoose.model("InterviewRound", interviewRoundSchema);
module.exports = InterViewRound;