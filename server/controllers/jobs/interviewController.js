// controllers/interviewRoundController.js
const InterViewRound = require("../../models/jobs/InterviewRound");
const InterviewSession = require("../../models/jobs/InterviewSession");
const Onboarding = require("../../models/jobs/Onboarding");

exports.fetchInterviewRounds = async (req, res) => {
  try {
    const rounds = await InterViewRound.find()
      .populate("interviewer")
      .sort({ roundNumber: 1 });
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addInterviewRound = async (req, res) => {
  try {
    const {
      name,
      roundNumber,
      interviewer,
      description,
      questions,
      passingScore,
      duration,
      isActive,
    } = req.body;

    // Validate questions
    if (!questions || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one question is required" });
    }

    const round = new InterViewRound({
      name,
      isActive,
      roundNumber,
      interviewer,
      description,
      questions,
      passingScore,
      duration,
    });

    await round.save();
    res.status(201).json({
      data: round,
      message: "Added new interview round with questions",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;

    const round = await InterViewRound.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    if (!round) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    res.json({
      data: round,
      message: "Interview round updated successfully!",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// exports.deleteInterviewRound = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const round = await InterViewRound.findByIdAndDelete(id);
//     await InterviewSession.deleteMany({ interviewRoundId: id });

//     if (!round) {
//       return res.status(404).json({ message: "Interview round not found" });
//     }

//     res.json({ message: "Interview round deleted successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.deleteInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;

    const round = await InterViewRound.findByIdAndDelete(id);
    if (!round) return res.status(404).json({ message: "Not found" });

    const sessions = await InterviewSession.find({ interviewRoundId: id }, '_id');
    const ids = sessions.map(s => s._id);

    await Promise.all([
      InterviewSession.deleteMany({ _id: { $in: ids } }),
      Onboarding.updateMany({ InterviewSession: { $in: ids } }, { $pull: { InterviewSession: { $in: ids } } })
    ]);

    res.json({ message: "Deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};









exports.fetchInterviewRoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const round = await InterViewRound.findById(id).populate({
      path: "interviewer",
      populate: {
        path: "Organization",
        populate: {
          path: ["department", "role"],
        },
      },
    });

    if (!round) {
      return res.status(404).json({ message: "Interview round not found" });
    }

    res.json(round);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
