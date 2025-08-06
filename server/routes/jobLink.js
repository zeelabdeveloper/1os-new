const express = require('express');
const router = express.Router();
const Job = require('../models/jobs/jobsSchema');
const Application = require('../models/jobs/applicationSchema');
const QRCode = require('qrcode');
 
const mongoose = require('mongoose');

// Get job details and generate link data
router.get('/:jobId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.jobId)
      .populate('branch', 'name')
      .populate('department', 'name')
      .populate('role', 'name');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const applicationLink = `http://139.59.72.240/apply/${req.params.jobId}`;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(applicationLink);
    
    // Generate barcode (using a simple approach)
    const barcodeData = `JOB-${req.params.jobId}`;
    
    res.json({
      job,
      applicationLink,
      qrCode,
      barcodeData
    });
  } catch (error) {
    console.error('Error generating job link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





router.post('/', async (req, res) => {
  try {
    const { jobId, ...applicationData } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const application = new Application({
      jobId,
      ...applicationData,
      status: 'applied'
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications by job ID
// Get applications by job ID
router.get('/job/:jobId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const applications = await Application.find({ jobId: req.params.jobId });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});














module.exports = router;