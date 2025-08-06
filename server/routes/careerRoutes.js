const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/jobs/applicationSchema");
const Profile = require("../models/Profile");
const Onboarding = require("../models/jobs/Onboarding");
const Document = require("../models/Document");
const Experience = require("../models/Experience");
const router = express.Router();

// Simple application tracking route
router.get("/application-track/:id", async (req, res) => {
  try {
    // Check if ID is valid
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid application ID");
    }

    // Find application
    const application = await Application.findById(req.params.id)
      .select("name status jobId appliedAt updatedAt")
      .populate("jobId", "title");

    if (!application) {
      return res.status(404).send("Application not found");
    }

    // Send response
    res.json({
      id: application._id,
      name: application.name,
      status: application.status,
      jobTitle: application.jobId?.title || "Not specified",
      applied: application.appliedAt,
      updated: application.appliedAt,
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});
router.post("/onboarding", async (req, res) => {
  try {
    

    if (!mongoose.isValidObjectId(req.body.applicationId)) {
      return res.status(400).json({ message : "Invalid application ID"});
    }

    const onboarding=await Onboarding.findOne({applicationId:req.body.applicationId})
 if (!onboarding) {
      return res.status(400).json({message : "Inavlid Onboarding ID"});
    }


    if (req?.body?.profile || req?.body?.family  ) {
       

      const newProfile = new Profile({
        ...req?.body?.profile,

       
        family: {
          ...req.body.family,
        },
      });
      await newProfile.save();

      await onboarding.updateOne(
        { $set: { Profile: newProfile._id } },
        
      );





    }

    if (
      req?.body?.documents &&
      Array.isArray(req.body.documents) &&
      req?.body?.documents?.length === 0
    ) {
      return res.status(404).json({ message: "Document Kaha hai yrr!" });
    }





     if (req.body.documents && req.body.documents.length > 0) {
        // Assuming you have an Experience model
        const documents = req.body.documents.map((exp) => ({
          
           applicationId:req.body.applicationId,
          ...exp,
        }));
        const savedAssets = await Document.insertMany(documents, {
           
        });
        const AssetIds = savedAssets.map((exp) => exp._id);
        await onboarding.updateOne(
          { $set: { Document: AssetIds } },
          {   }
        );
      }




      if (req.body.experiences && req.body.experiences.length > 0) {
        // Assuming you have an Experience model
        const experiences = req.body.experiences.map((exp) => ({
          applicationId:req.body.applicationId,
          ...exp,
        }));
        const savedExperiences = await Experience.insertMany(experiences, {
           
        });
        const experienceIds = savedExperiences.map((exp) => exp._id);
        await onboarding.updateOne(
          { $set: { Experience: experienceIds } },
        
        );
      }


res.status(200).json({message:"Thanks For Sharing Data."})


  
    
  } catch (err) {
    console.log(err)
    res.status(500).json( { message:err.message || 'internal error'} );
  }
});

module.exports = router;
