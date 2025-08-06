const express = require("express");
const { getManagerApplications, getApplicationDetails, updateManagerReview } = require("../controllers/applicationReview");
const router = express.Router();
 

 

// GET: Get applications assigned to manager (with pagination, filter, search)
router.get("/manager",getManagerApplications);

// GET: Get single application details for manager
router.get("/:id/details",  getApplicationDetails);

// PUT: Update review status and note for manager
router.patch("/:id/review", updateManagerReview);

module.exports = router;
