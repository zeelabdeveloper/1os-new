const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
  createApplication,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteApplicationStatus,
  fetchApplicationById,
  getHiredApplicationsForJob,
  updateApplicationAllStatus,
  assignApplications,
} = require("../controllers/jobs/jobsController.js");
const {
  fetchInterviewRounds,
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
 
  fetchInterviewRoundById,
} = require("../controllers/jobs/interviewController.js");

const router = express.Router();

router.post("/", createJob);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.get("/stats/all", getJobStats);

// Multer storage configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/company");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.post("/applications", upload.single("resume"), createApplication);
router.get("/applications/status", getApplicationsForJob);
router.post("/applications/assign/:id", assignApplications);
router.get("/application/hired/:id", getHiredApplicationsForJob);
router.get("/application/:id", fetchApplicationById);

router.patch("/application/:id/status", updateApplicationStatus);
router.patch("/application/:id/status", updateApplicationStatus);
router.patch("/application/:id/status/allUpdate", updateApplicationAllStatus);
router.delete("/application/:id/status", deleteApplicationStatus);

router.get("/interview/interviewRounds", fetchInterviewRounds);
router.get('/interview/interviewRounds/:id',  fetchInterviewRoundById);
router.post("/interview/interviewRounds", addInterviewRound);
router.put("/interview/interviewRounds/:id", updateInterviewRound);
router.delete("/interview/interviewRounds/:id", deleteInterviewRound);
 



 




module.exports = router;
