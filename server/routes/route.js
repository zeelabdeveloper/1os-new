const express = require("express");
const {
  loginUser,
  fetchUser,
  createUser,
  verifyToken,
  createDepartment,
  createRole,
  forgotPassword,
  convertUserFromOnboarding,
  checkEmployeeConversion,
  deleteExp,
  deleteASset,
  deleteDocs,
  getCompanyStats,
  ProfileImageUpdate,
  getRecruiterStats,
} = require("../controllers/authController");
const ProfileImageUpload = require("../middlewares/uploadProfile");

const router = express.Router();

router.post("/login", loginUser);
router.post("/profile/image/upload", ProfileImageUpload.any(),ProfileImageUpdate);
router.delete("/deleteExp/:id", deleteExp);
router.delete("/deleteAsset/:id", deleteASset);
router.delete("/deleteDocs/:id", deleteDocs);
router.post("/forgot-password", forgotPassword);
router.post("/auth/verify", verifyToken);
router.get("/fetchUser", fetchUser);
router.get("/hiring/comp/stats", getCompanyStats);
router.get("/hiring/recruiter/stats", getRecruiterStats);
router.post("/createUser", createUser);
router.post("/employees/convert", convertUserFromOnboarding);
router.get("/employees/check-conversion", checkEmployeeConversion);
router.post("/createRole", createRole);
router.post("/departments", createDepartment);

module.exports = router;
