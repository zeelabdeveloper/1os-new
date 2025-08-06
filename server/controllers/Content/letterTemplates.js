const Onboarding = require("../../models/jobs/Onboarding");
const LetterTemplate = require("../../models/LetterTemplate");
const sendEmail = require("../../services/forgetpassmail");



const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer-core');

const job = require("../../models/jobs/jobsSchema");
const { EmailConfig } = require("../../helper/emailConfig");


const logoDDD = path.join(__dirname, "../../public/img/zeelabLogo.png");
const logoDDDDDD = fs.readFileSync(logoDDD, { encoding: 'base64' });

const logo = `data:image/png;base64,${logoDDDDDD}`


const letterTemplateController = {
  // Get all templates for the authenticated user
  getAllTemplates: async (req, res) => {
    try {
      const templates = await LetterTemplate.find();
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  viewLetter: async (req, res) => {
    try {
      const { applicationId } = req.query;
      console.log(applicationId);
      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: "Application ID is required",
        });
      }

      const onboarding = await Onboarding.findOne({
        applicationId,
      }).populate({
        path: "Letters.templateUsed",
        model: "LetterTemplate",
        select: "name type content",
      });

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          message: "Onboarding record not found",
        });
      }

      // Format the response data
      const letters = onboarding.Letters.map((letter) => ({
        _id: letter._id,
        type: letter.type,
        templateName: letter.templateUsed?.name || "Unknown Template",
        templateContent: letter.templateUsed?.content || "",
        sentAt: letter.sentAt,
        recipient: letter.recipient,
        downloadUrl: `/api/v1/letters/download/${letter._id}`,
      }));

      res.json({
        success: true,
        data: letters,
      });
    } catch (error) {
      console.error("Error fetching letters:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  // Get templates by type
  getTemplatesByType: async (req, res) => {
    try {
      const templates = await LetterTemplate.find({
        createdBy: req.user.id,
        type: req.params.type,
      });
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Get single template
  getTemplate: async (req, res) => {
    try {
      const template = await LetterTemplate.findOne({
        _id: req.params.id,
        createdBy: req.user.id,
      });

      if (!template) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Create new template
  createTemplate: async (req, res) => {
    try {
      const { name, type, content, variables } = req.body;
      console.log(req.body);
      // Validate variables
      if (variables && variables.some((v) => !v.name || !v.description)) {
        return res.status(400).json({
          success: false,
          message: "All variables must have name and description",
        });
      }

      const newTemplate = new LetterTemplate({
        name,
        type,
        content,
        variables: variables || [],
        createdBy: req?.user?.id,
      });

      await newTemplate.save();

      res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: newTemplate,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Update template
  updateTemplate: async (req, res) => {
    try {
      const { name, type, content, variables } = req.body;

      // Validate variables
      if (variables && variables.some((v) => !v.name || !v.description)) {
        return res.status(400).json({
          success: false,
          message: "All variables must have name and description",
        });
      }

      const updatedTemplate = await LetterTemplate.findOneAndUpdate(
        { _id: req.params.id },
        { name, type, content, variables: variables || [] },
        { new: true }
      );

      if (!updatedTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({
        success: true,
        message: "Template updated successfully",
        data: updatedTemplate,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Delete template
  deleteTemplate: async (req, res) => {
    try {
      const deletedTemplate = await LetterTemplate.findOneAndDelete({
        _id: req.params.id,
      });

      if (!deletedTemplate) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }

      res.json({
        success: true,
        message: "Template deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Generate letter from template

  // generateLetter: async (req, res) => {
  //   try {
  //     const template = await LetterTemplate.findOne({
  //       _id: req.body.templateId,
  //     });

  //     if (!template) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Template not found" });
  //     }

  //     const ApplicationDetails = await Onboarding.findOne({
  //       applicationId: req.body.applicationId,
  //     }).populate("applicationId");

  //     if (!ApplicationDetails) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Application not found" });
  //     }

  //     const user = ApplicationDetails.applicationId;
  //     const jobDetails = await job.findById(user.jobId);

  //     if (template.type === "offer") {
  //       // Generate stylish PDF offer letter
  //       const doc = new PDFDocument({
  //         size: "A4",
  //         margin: 50,
  //         layout: "portrait",
  //         info: {
  //           Title: `Offer Letter - ${user.name}`,
  //           Author: "Zeelab Pharmacy HR",
  //         },
  //       });

  //       // Create a temporary file path
  //       const filePath = path.join(
  //         __dirname,
  //         "../../temp",
  //         `offer_${user._id}.pdf`
  //       );
  //       const writeStream = fs.createWriteStream(filePath);
  //       doc.pipe(writeStream);

  //       // Add stylish header
  //       doc
  //         .image(
  //           path.join(__dirname, "../../public/img/zeelab-logo.png"),
  //           50,
  //           45,
  //           { width: 100 }
  //         )
  //         .fillColor("#444444")
  //         .fontSize(20)
  //         .text("OFFER LETTER", 200, 50, { align: "center" })
  //         .fontSize(10)
  //         .text("Zeelab Pharmacy Pvt. Ltd.", 200, 80, { align: "center" })
  //         .moveDown();

  //       // Add date
  //       doc
  //         .fontSize(10)
  //         .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
  //           align: "right",
  //         })
  //         .moveDown();

  //       doc
  //         .fontSize(12)
  //         .text(`Dear ${user.name},`, { align: "left" })
  //         .moveDown(0.5)
  //         .text("We are pleased to offer you the position of:")
  //         .font("Helvetica-Bold")
  //         .text(jobDetails.title, { indent: 30 })
  //         .font("Helvetica")
  //         .moveDown();

  //       doc
  //         .text("The terms of your employment are as follows:")
  //         .moveDown(0.5)
  //         .text(`• Position: ${jobDetails.title}`, { indent: 30 })
  //         .text(`• Department: ${jobDetails.department}`, { indent: 30 })
  //         .text(`• Joining Date: To be discussed`, { indent: 30 })
  //         .text(`• Compensation: As per discussion`, { indent: 30 })
  //         .moveDown();

  //       // Add standard clauses
  //       doc
  //         .text("This offer is contingent upon:")
  //         .moveDown(0.5)
  //         .text("1. Successful completion of background verification", {
  //           indent: 30,
  //         })
  //         .text("2. Submission of required documents", { indent: 30 })
  //         .text("3. Compliance with company policies", { indent: 30 })
  //         .moveDown();

  //       // Add closing
  //       doc
  //         .text(
  //           "We look forward to having you as part of our team. Please sign and return a copy of this letter to acknowledge your acceptance."
  //         )
  //         .moveDown(2)
  //         .text("Sincerely,")
  //         .moveDown(2)
  //         .text("___________________________")
  //         .text("HR Manager")
  //         .text("Zeelab Pharmacy Pvt. Ltd.")
  //         .moveDown()
  //         .text("Candidate Acceptance:")
  //         .moveDown(2)
  //         .text("___________________________")
  //         .text("Signature")
  //         .text("Date: ___________");

  //       // Finalize PDF
  //       doc.end();

  //       // Wait for PDF to be created
  //       await new Promise((resolve) => writeStream.on("finish", resolve));

  //       // Send email with PDF attachment
  //       const mailOptions = {
  //         from: `"Zeelab Pharmacy HR" <${process.env.MAIL_USER}>`,
  //         to: user.email,
  //         subject: `Offer Letter for ${jobDetails.title} Position`,
  //         html: `
  //                   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //                       <div style="background-color: #22c55e; padding: 20px; text-align: center;">
  //                           <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" style="height: 50px;">
  //                       </div>
  //                       <div style="padding: 20px;">
  //                           <h2 style="color: #22c55e;">Congratulations, ${user.name}!</h2>
  //                           <p>We are pleased to extend an offer for the position of <strong>${jobDetails.title}</strong> at Zeelab Pharmacy.</p>
  //                           <p>Please find your official offer letter attached with this email.</p>
  //                           <p>To accept this offer, please reply to this email or sign and return the attached document.</p>
  //                           <p>We look forward to welcoming you to our team!</p>
  //                           <br/>
  //                           <p>Best regards,<br/>
  //                           <strong>HR Team</strong><br/>
  //                           Zeelab Pharmacy Pvt. Ltd.</p>
  //                       </div>
  //                       <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px;">
  //                           <p>This is an automated email. Please do not reply directly to this message.</p>
  //                       </div>
  //                   </div>
  //               `,
  //         attachments: [
  //           {
  //             filename: `Zeelab_Offer_Letter_${user.name}.pdf`,
  //             path: filePath,
  //           },
  //         ],
  //       };

  //       const emailResult = await sendEmail(mailOptions);

  //       // Delete the temporary PDF file
  //       fs.unlinkSync(filePath);

  //       if (!emailResult.success) {
  //         return res.status(500).json({
  //           success: false,
  //           message:
  //             emailResult.error?.message ||
  //             "Failed to send email. Please try again.",
  //         });
  //       }

  //       // Update onboarding with letter details
  //       ApplicationDetails.Letters.push({
  //         type: "offer",
  //         sentAt: new Date(),
  //         recipient: user.email,
  //         templateUsed: template._id.toString(), // Ensure this is a string representation
  //       });
  //       await ApplicationDetails.save();
  //     }

  //     res.json({
  //       success: true,
  //       message: "Letter generated and sent successfully",
  //       ApplicationDetails,
  //     });
  //   } catch (error) {
  //     console.error("Error generating offer letter:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },

  // generateLetter: async (req, res) => {
  //   console.log(req.body);

  //   let tempFilePath = null;

  //   try {
  //     // Validate input
  //     if (!req.body.templateId || !req.body.applicationId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Template ID and Application ID are required",
  //       });
  //     }

  //     // Create temp directory if it doesn't exist
  //     const tempDir = path.join(process.cwd(), "temp");
  //     if (!fs.existsSync(tempDir)) {
  //       fs.mkdirSync(tempDir, { recursive: true });
  //     }

  //     // Find template
  //     const template = await LetterTemplate.findById(req.body.templateId);
  //     if (!template) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Template not found",
  //       });
  //     }

  //     // Find application details
  //     const ApplicationDetails = await Onboarding.findOne({
  //       applicationId: req.body.applicationId,
  //     }).populate("applicationId");

  //     if (!ApplicationDetails) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Application not found",
  //       });
  //     }

  //     const user = ApplicationDetails?.applicationId;
  //     const jobDetails = await job.findById(user.jobId);

  //     if (!jobDetails) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Job details not found",
  //       });
  //     }

  //     if (template.type === "appointment") {
  //       // Generate PDF
       
  //       // Send email with enhanced HTML
  //       const mailOptions = {
  //         from: `Zeelab Pharmacy HR <${EmailConfig.mailFromAddress}>`,
  //         to: user.email,
  //         cc: "hr@zeelabpharmacy.com",
  //         subject: `Offer of Employment - ${jobDetails.title} Position | Zeelab Pharmacy`,
  //         html: `
  //       <!DOCTYPE html>
  //       <html>
  //       <head>
  //           <style>
  //               body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
  //               .header { background-color: #22c55e; padding: 30px 20px; text-align: center; }
  //               .logo { height: 60px; }
  //               .content { padding: 30px 20px; }
  //               .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  //               h1 { color: #22c55e; font-size: 24px; margin-bottom: 25px; }
  //               p { margin-bottom: 15px; }
  //               .highlight-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
  //               .signature { margin-top: 30px; font-style: italic; color: #555; }
  //           </style>
  //       </head>
  //       <body>
  //           <div class="header">
  //               <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" class="logo">
  //           </div>
            
  //           <div class="content">
  //               <h1>Congratulations, ${user.name}!</h1>
                
  //               <p>On behalf of Zeelab Pharmacy Pvt. Ltd., we are delighted to extend an offer for the position of <strong>${
  //                 jobDetails.title
  //               }</strong> in our ${jobDetails.department} department.</p>
                
  //               <div class="highlight-box">
  //                   <p><strong>Your official offer letter is attached with this email.</strong> This document contains important information about your compensation, benefits, and terms of employment.</p>
  //               </div>
                
  //               <p><strong>Next Steps:</strong></p>
  //               <ol>
  //                   <li>Review the attached offer letter carefully</li>
  //                   <li>Sign and return the document within 7 days</li>
  //                   <li>Reply to this email with any questions</li>
  //                   <li>Our HR team will contact you for onboarding formalities</li>
  //               </ol>
                
  //               <p>We believe your skills and experience will be valuable assets to our organization, and we look forward to welcoming you to the Zeelab Pharmacy family.</p>
                
  //               <div class="signature">
  //                   <p>Best regards,</p>
  //                   <p><strong>HR Team</strong><br>
  //                   Zeelab Pharmacy Pvt. Ltd.<br>
  //                   Phone: +91-124-4123456<br>
  //                   Email: hr@zeelabpharmacy.com</p>
  //               </div>
  //           </div>
            
  //           <div class="footer">
  //               <p>This is an automated message. Please do not reply directly to this email.</p>
  //               <p>© ${new Date().getFullYear()} Zeelab Pharmacy Pvt. Ltd. All rights reserved.</p>
  //           </div>
  //       </body>
  //       </html>
  //       `,
  //         attachments: [
  //           {
  //             filename: `Zeelab_Pharmacy_Offer_Letter_${user.name.replace(
  //               /\s+/g,
  //               "_"
  //             )}.pdf`,
  //             path: tempFilePath,
  //           },
  //         ],
  //       };

  //       const emailResult = await sendEmail(mailOptions);

  //       if (!emailResult.success) {
  //         throw new Error(emailResult.error?.message || "Failed to send email");
  //       }

  //       // Update onboarding with letter details
  //       ApplicationDetails.Letters.push({
  //         type: "offer",
  //         sentAt: new Date(),
  //         recipient: user.email,
  //         templateUsed: template._id,
  //         documentPath: tempFilePath,
  //         reference: `ZL/HR/${new Date().getFullYear()}/${Math.floor(
  //           1000 + Math.random() * 9000
  //         )}`,
  //       });
  //       await ApplicationDetails.save();
  //     }

      

  //     res.json({
  //       success: true,
  //       message: "Letter generated and sent successfully",
  //       data: ApplicationDetails,
  //     });
  //   } catch (error) {
  //     console.error("Error generating letter:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to generate and send letter",
  //       error: error.message,
  //     });
  //   } finally {
  //     // Clean up temp file if it exists
  //     if (tempFilePath && fs.existsSync(tempFilePath)) {
  //       try {
  //         fs.unlinkSync(tempFilePath);
  //       } catch (cleanupError) {
  //         console.error("Error cleaning up temp file:", cleanupError);
  //       }
  //     }
  //   }
  // },





generateLetter: async (req, res) => {
    console.log(req.body);

    let tempFilePath = null;

    try {
      // Validate input
      if (!req.body.templateId || !req.body.applicationId) {
        return res.status(400).json({
          success: false,
          message: "Template ID and Application ID are required",
        });
      }

      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Find template
      const template = await LetterTemplate.findById(req.body.templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Find application details
      const ApplicationDetails = await Onboarding.findOne({
        applicationId: req.body.applicationId,
      }).populate("applicationId");

      if (!ApplicationDetails) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const user = ApplicationDetails?.applicationId;
      const jobDetails = await job.findById(user.jobId);

      if (!jobDetails) {
        return res.status(404).json({
          success: false,
          message: "Job details not found",
        });
      }

      if (template.type === "appointment") {
        // Generate PDF with the appointment letter HTML
        tempFilePath = path.join(tempDir, `offer_letter_${Date.now()}.pdf`);
        
        // Create browser instance for PDF generation
const browser = await puppeteer.launch({
 executablePath: '/usr/bin/chromium-browser', // Chrome path
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new'
});
        const page = await browser.newPage();
        
        // Generate the appointment letter HTML
        const appointmentLetterHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Letter</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    margin: 0;
                    padding: 20px;
                }
                .page {
                    margin-bottom: 30px;
                 
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h1 {
                    font-size: 24px;
                    margin: 0;
                }
                .ref {
                    text-align: right;
                    margin-bottom: 20px;
                }
                .to-address {
                    margin-bottom: 20px;
                }
                .confidential {
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                }
                .content {
                    margin-bottom: 20px;
                }
                .content p {
                    margin: 10px 0;
                }
                .content b {
                    font-weight: bold;
                }
                .terms-list {
                    margin-left: 20px;
                }
                .terms-list li {
                    margin-bottom: 10px;
                }
                .signature {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                }
                .signature-block {
                    width: 45%;
                }
                .annexure-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .annexure-header h1 {
                    font-size: 24px;
                    margin: 0;
                }
                .annexure-header h2 {
                    font-size: 20px;
                    margin: 10px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                table, th, td {
                    border: 1px solid black;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }
                .note {
                    margin-top: 20px;
                    font-style: italic;
                }
                .footer {
                    margin-top: 50px;
                }
            </style>
        </head>
        <body>
            <!-- Page 1 -->
            <div class="page">

 <div style="display: flex; justify-content: right; ">
                    <img src=${logo}  style=" width: 100px; "  alt="">
                </div>


                <div class="header">
                    <h1>Appointment Letter</h1>
                </div>
                
                <div class="ref">
                    Ref:ZLP/ HR–30<sup>st</sup> July 2025.
                </div>
                
                <div class="to-address">
                    To,<br>
                    Mr.${user?.name}<br>
                    Location: ${user?.currentLocation || 'NA'}<br>
                </div>
                
                <div class="confidential">
                    <b>Private and Confidential</b>
                </div>
                
                <div class="content">
                    <p>Dear Mr. ${user.name},</p>
                    
                    <p>With reference to your application and subsequent interview held before the selection 
                    committee, we are pleased to confirm your appointment as "${req?.body?.candidatePosition}" at Zeelab Pvt 
                    Ltd.<br>
                    You will be based on ${req?.body?.store || 'New Delhi Zee Lab Pharmacy Store'}. Subjected to Store Opening / 
                    Joining: ${  new Date(req?.body?.joiningDate)?.toLocaleDateString('en-IN') ||   new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}.</p>
                    
                    <p><b>Note: There is 9 hrs. Shift as per company policy. Also you have to indulge in Store 
                    Sales Promotional Activity.</b></p>
                    
                    <p>The terms and conditions incidental to the appointment are as mentioned below:</p>
                    
                    <ol class="terms-list">
                        <li>Your compensation package is attached herewith as an "${req?.body?.compensationPackage}"</li>
                        <li>Your salary is confidential and should be known to you only.</li>
                        <li>The management will be free to withhold and or refuse to pay you salary and allowance till 
                        it is satisfied that you have actually worked as per the instructions or requirements of the 
                        management.</li>
                        <li>You will be on probation period until a written confirmation. There will be no presumption 
                        of automatic confirmation in the absence of any written letter of confirmation from the 
                        company. You will get confirmation letter on the basis of your performance.</li>
                        <li>You would be entitled for leave as per the company policy may be in force at any relevant 
                        time.</li>
                        <li>Apart from your usual duties, your activities can also be extended over any other kind of 
                        duties, as deemed appropriate by the company at its discretion.</li>
                        <li>Your services are liable to be transferred to any other establishment within India as and 
                        when desired by the management. Your refusal for such transfer will be considered as your 
                        unwillingness to serve the company and in such a case, the management will be free to 
                        terminate your appointment for committing breach of agreed terms and conditions of 
                        employment.</li>
                        <li>During the period of this appointment, you shall not engage yourself in any other Job/ 
                        Business</li>
                    </ol>
                </div>
            </div>
            
            <!-- Page 2 -->
            <div class="page">

               
                <div class="content">
                    <ol class="terms-list" start="9">
                        <li>With or without any remuneration. You are required to maintain the highest order of 
                        discipline as regard the work of the company. In case of breach of discipline/ Trust, the 
                        company has right to reserve terminate your services with immediate effect.</li>
                        <li>Your appointment will be subject to the verification of your past service record and 
                        antecedents.</li>
                        <li>In case any information furnished by you in connection with the above appointment or 
                        during the currency of your employment in the company is found to be incorrect at any 
                        stage or correct information is found suppressed, you are liable to be removed from the 
                        services at any time without any notice.</li>
                        <li>You are required to maintain company's secrecy in regard to strategies, offers, incentives 
                        schemes, etc. and shall ensure that company's interests are safeguarded at all the times</li>
                        <li>You will be devoting entire duty hours to the company and will not utilize any time 
                        resources for any other activities.</li>
                        <li>You will take good care of and be responsible for the promotional items and other 
                        properties of the Company provided to you from time to time, and compensate to the 
                        Company in case of any loss of the same. If your services are terminated due to 
                        misconduct resulting in financial loss to the Company, the loss will be recovered from any 
                        amount due to you or otherwise.</li>
                        <li>If you remain absent without prior permission or overstay the sanctioned leave for more 
                        than five consecutive days, you will be deemed to have deserted your employment thereby 
                        bring about termination of your services with the Company automatically on your own.</li>
                        <li>Upon leaving employment you are required to return Company's property in your 
                        possession immediately without fail. Further you are required to obtain and submit NOC 
                        from the Distributors/others as required to settle your account in full and final settlement. If 
                        the claim of payable due is not received in maximum one month from the date of leaving, it 
                        would not be entertained. In case you fail to comply with the exit formalities, the cost of 
                        property as determined by the Company will be recovered from your dues payable to you 
                        in full and final settlement.</li>
                        <li><b>Please note that 10% of security amount will be deducted from your base salary for 
                        Next 10 months only from date of joining and it will be payable in your F&F 
                        settlement, when you will leave the organization in a proper manner. The same will 
                        not be payable in case of leaving the organization before completion of 10 months 
                        and not serving the notice period as per terms of appointment letter.</b></li>
                    </ol>
                </div>
            </div>
            
            <!-- Page 3 -->
            <div class="page">



                <div class="content">
                    <p><b>Discharge or Termination of Employment or Dismissal: -</b></p>
                    
                    <ol>
                        <li>The services of an employee can be terminated during the probation period at any time 
                        without assigning any reason. After confirmation of the service, the company has reserve 
                        the right to terminate this appointment at any time without assigning any reason either on 
                        <b>giving 30 days' notice or without any notice on payment of 30 days' basic salary in 
                        lieu of notice.</b></li>
                        <li>However, during the probation period and thereafter also, the employee will have to give 
                        30 days' notice or salary in lieu thereof, before leaving services of the company. The 
                        company has reserved the right to accept such resignation with immediate effect or at any 
                        time during the notice period and the employee shall not be entitled to any salary or other 
                        benefit after the effective date from which resignation such accepted. In that event, 
                        employee shall also surrender all other benefit and Company's property immediately and 
                        NOC's. The company has reserved the right to relieve the employee services subject to 
                        completion of all clearance formalities.</li>
                        <li>The services of an employee can be terminated immediately during probation period and 
                        thereafter also in case of fake reporting, Misconduct and insubordination behavior, in this 
                        connection employee will not be eligible for any full and final and will have no legal binding 
                        on employer.</li>
                        <li>If you absent yourself without leave more than 5 days, you shall be considered as voluntarily 
                        left the services without giving notice period. In this connection you will not be entitled for 
                        any F&F.</li>
                        <li>If any dispute arise then jurisdiction matter will be resolve in Delhi court only.</li>
                    </ol>
                    
                    <p>Please sign and return to the undersigned the duplicate copy of this letter signifying your 
                    acceptance.</p>
                    
                    <p>We take this opportunity to whole heartily welcome you to Zeelab and hope that your 
                    association with the Company will prove to be mutually beneficial and rewarding.</p>
                </div>
                
                <div class="signature">
                    <div class="signature-block">
                        <p><b>Zeelab Pharmacy Pvt Ltd</b></p>
                        <p><b>Authorized Signatory</b></p>
                    </div>
                    <div class="signature-block">
                        <p><b>I accept the above terms and Conditions.</b></p>
                    </div>
                </div>
            </div>
            
            <!-- Page 4 -->
            <div class="page">

           


                <div class="annexure-header">
                    <h1>ZEELAB</h1>
                    <h2>PHARMACY</h2>
                    <h2>"ANNEXURE- A"</h2>
                </div>
                
                <table>
                    <tr>
                        <td>Name</td>
                        <td>Designation</td>
                        <td>HQ</td>
                    </tr>
                    <tr>
                        <td>${user.name}</td>
                        <td>${req?.body?.candidatePosition}</td>
                        <td>${req?.body?.store || 'N/A'}</td>
                    </tr>
                    <tr >
                        <td>Remuneration</td>
                        <td>INR PM</td>
                        <td>INR- P.A</td>
                    </tr>
                    <tr>
                        <td>Basic</td>
                        <td>${req?.body?.basicMonthly || '17000'}</td>
                        <td>${req?.body?.basicAnnual || 17000}</td>
                    </tr>
                    <tr>
                        <td>HRA</td>
                        <td>${req?.body?.hraMonthly || '3000'}</td>
                        <td>${(req?.body?.hraAnnual || 3000) * 12}</td>
                    </tr>
                    <tr>
                        <td>Medical</td>
                           <td>${req?.body?.medicalMonthly || '0'}</td>
                        <td>${req?.body?.medicalAnnual }</td>
                    </tr>
                    <tr>
                        <td>Transport</td>
                          <td>${req?.body?.transportMonthly || '0'}</td>
                        <td>${req?.body?.transportAnnual ||0 }</td>
                    </tr>
                    <tr>
                        <td>Other Allowance</td>
                                <td>${req?.body?.otherAllowanceMonthly || '0'}</td>
                        <td>${req?.body?.otherAllowanceAnnual ||0 }</td>
                    </tr>
                    <tr>
                        <td>Base Salary</td>
                            <td>${req?.body?.baseSalaryMonthly || '0'}</td>
                        <td>${req?.body?.baseSalaryAnnual ||0 }</td>
                    </tr>
                   
                    
                    <tr>
                        <td>Total CTC</td>
                        <td>${( parseInt(req?.body?.baseSalaryMonthly)  || 17000) + (parseInt(req?.body?.hraMonthly)    || 3000) + 1070}</td>
                        <td>${((  parseInt( req?.body?.hraAnnual)  || 17000) + ( parseInt( req?.body?.hraMonthly)  || 3000) + 1070) * 12}</td>
                    </tr>
                    
                     
                     
                   
                </table>
                
                <div class="note">
                    <p>Note: The drug license Amount is included in your Salary</p>
                </div>
                
                <div class="footer">
                    <p>Please note - TDS will be deducted as per rules.<br>
                    I confirm that this contract is in accordance with our mutual understanding and unconditionally and irrevocably accept the above terms and conditions.</p>
                    
                    <div class="signature">
                        <div class="signature-block">
                            <p><b>Zeelab Pharmacy Pvt. Ltd</b></p>
                            <p><b>HR Dept.</b></p>
                        </div>
                        <div class="signature-block">
                            <p><b>I accept the above terms and Conditions</b></p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Set the HTML content and generate PDF
        await page.setContent(appointmentLetterHTML, {
          waitUntil: 'networkidle0'
        });
        
        // Generate PDF
        await page.pdf({
          path: tempFilePath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '25mm',
            right: '25mm',
            bottom: '25mm',
            left: '25mm'
          }
        });
        
        await browser.close();

        // Send email with enhanced HTML
        const mailOptions = {
          from: `Zeelab Pharmacy HR <${EmailConfig.mailFromAddress}>`,
          to: user.email,
          cc: "hr@zeelabpharmacy.com",
          subject: `Offer of Employment - ${jobDetails.title} Position | Zeelab Pharmacy`,
          html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
                .header { background-color: #22c55e; padding: 30px 20px; text-align: center; }
                .logo { height: 60px; }
                .content { padding: 30px 20px; }
                .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                h1 { color: #22c55e; font-size: 24px; margin-bottom: 25px; }
                p { margin-bottom: 15px; }
                .highlight-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
                .signature { margin-top: 30px; font-style: italic; color: #555; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy" class="logo">
            </div>
            
            <div class="content">
                <h1>Congratulations, ${user.name}!</h1>
                
                <p>On behalf of Zeelab Pharmacy Pvt. Ltd., we are delighted to extend an offer for the position of <strong>${
                  jobDetails.title
                }</strong> in Zeelab.</p>
                
                <div class="highlight-box">
                    <p><strong>Your official offer letter is attached with this email.</strong> This document contains important information about your compensation, benefits, and terms of employment.</p>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Review the attached offer letter carefully</li>
                    <li>Sign and return the document within 7 days</li>
                    <li>Reply to this email with any questions</li>
                    <li>Our HR team will contact you for onboarding formalities</li>
                </ol>
                
                <p>We believe your skills and experience will be valuable assets to our organization, and we look forward to welcoming you to the Zeelab Pharmacy family.</p>
                
                <div class="signature">
                    <p>Best regards,</p>
                    <p><strong>HR Team</strong><br>
                    Zeelab Pharmacy Pvt. Ltd.<br>
                    Phone: +91-124-4123456<br>
                    Email: hr@zeelabpharmacy.com</p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>© ${new Date().getFullYear()} Zeelab Pharmacy Pvt. Ltd. All rights reserved.</p>
            </div>
        </body>
        </html>
        `,
          attachments: [
            {
              filename: `Zeelab_Pharmacy_Appointment_Letter_${user.name.replace(
                /\s+/g,
                "_"
              )}.pdf`,
              path: tempFilePath,
            },
          ],
        };

        const emailResult = await sendEmail(mailOptions);

        if (!emailResult.success) {
          throw new Error(emailResult.error?.message || "Failed to send email");
        }

        // Update onboarding with letter details
        ApplicationDetails.Letters.push({
          type: "appointment",
          sentAt: new Date(),
          recipient: user.email,
          templateUsed: template._id,
          documentPath: tempFilePath,
          reference: `ZL/HR/${new Date().getFullYear()}/${Math.floor(
            1000 + Math.random() * 9000
          )}`,
        });
        await ApplicationDetails.save();
      }

      res.json({
        success: true,
        message: "Letter generated and sent successfully",
        data: ApplicationDetails,
      });
    } catch (error) {
      console.error("Error generating letter:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate and send letter",
        error: error.message,
      });
    } finally {
      // Clean up temp file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error("Error cleaning up temp file:", cleanupError);
        }
      }
    }
  },






};

module.exports = letterTemplateController;
