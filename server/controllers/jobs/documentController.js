const Document = require("../../models/Document");
const Application = require("../../models/jobs/applicationSchema");
const Onboarding = require("../../models/jobs/Onboarding");

// Create or Update Document
exports.createOrUpdateDocument = async (req, res) => {
  try {
    const { documentType, id, applicationId, documentNumber, documentUrl } =
      req.body;
    console.log(req.body);

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found with that ID",
      });
    }

    if (id) {
      await Document.findByIdAndUpdate(id, req.body);
      return res.status(200).json({ message: "Document Updated!" });
    }

    let document = await Document.findOne({
      documentType,
      documentNumber,
      applicationId,
    });

    if (document) {
      // Update existing document
      document.documentNumber = documentNumber;
      document.documentUrl = documentUrl;
      document.verified = false;
      await document.save();
    } else {
      // Create new document
      document = new Document({
        applicationId,
        documentType,
        documentNumber,
        documentUrl,
      });
      await document.save();

      const onboarding = await Onboarding.findOne({ applicationId });

      if (onboarding) {
        onboarding.Document.push(document._id);
        await onboarding.save();
      } else {
        const newOnboarding = new Onboarding({
          applicationId,
          Document: [document._id],
        });
        await newOnboarding.save();
      }
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Documents for User
exports.getUserDocuments = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const documents = await Document.find({ applicationId });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Remove the document reference from Onboarding
    await Onboarding.findOneAndUpdate(
      { applicationId: document.applicationId },
      { $pull: { Document: document._id } }
    );

    res.status(200).json({
      success: true,
      message: "Document deleted successfully and removed from onboarding",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get All Documents (for verification)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate("user", "name email");
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
