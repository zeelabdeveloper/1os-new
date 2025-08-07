const { EmailConfig } = require("../helper/emailConfig");
const EmailNotification = require("../models/setting/emailNotification");
const sendEmail = require("./forgetpassmail");
const path=require('path')
const RejectionMail = async (application) => {
  try {
    const allNotification = await EmailNotification.findOne().lean();

    const recipients = [];

    if (allNotification?.newApplicationRejection && application?.email) {
      recipients.push(application.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for rejection emails");
      return;
    }

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients,
      subject: "Zeelab - Application Status Update",
      html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background-color: #e74c3c; padding: 20px; color: white; text-align: center;">
                  <h2 style="margin: 0;">Application Status Update</h2>
                  <p style="margin: 0; font-size: 14px;">Thank you for your interest in Zeelab</p>
                </div>
                <div style="padding: 30px;">
                  <h3 style="color: #333;">Dear ${application?.name || "Applicant"},</h3>
                  <p style="color: #555;">We appreciate the time and effort you took to apply for the position at Zeelab.</p>
                  
                  <p style="color: #555;">After careful consideration, we regret to inform you that your application has not been successful at this time.</p>
                  
                  <p style="color: #555;">This decision was not made lightly, and we recognize the value of your skills and experience. We encourage you to apply for future positions that may be a better fit for your qualifications.</p>
                  
                  <p style="color: #555;">Thank you again for your interest in joining our team.</p>
                  
                  <p style="color: #e74c3c; font-weight: 500;">Best regards,</p>
                  <p style="color: #333;"><strong>– Zeelab Team</strong></p>
                </div>
                <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                  © ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.
                </div>
              </div>
            </div>
          `,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error; // Consider throwing the error so the calling function knows it failed
  }
};
const onboardingMail = async (application) => {
  try {
    const allNotification = await EmailNotification.findOne().lean();

    const recipients = [];

    if (allNotification?.onboardingNotify && application?.email) {
      recipients.push(application.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for onboarding emails");
      return;
    }

    // Generate a unique tracking link (replace with your actual tracking URL generation logic)
    const trackingLink = `http://139.59.85.95/career/application?id=${application?._id}`;

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients,
      subject: "Welcome to Zeelab Pharmacy - Onboarding Process Started!",
      html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="background-color: #2ecc71; padding: 20px; color: white; text-align: center;">
                  <h2 style="margin: 0;">Congratulations on Your Selection!</h2>
                  <p style="margin: 0; font-size: 14px;">Welcome to the Zeelab Pharmacy Family</p>
                </div>
                <div style="padding: 30px;">
                  <h3 style="color: #333;">Dear ${application?.name || "Team Member"},</h3>
                  <p style="color: #555;">We are thrilled to inform you that your onboarding process with Zeelab Pharmacy has officially begun!</p>
                   <p style="color: #555;">please fill the attched forms and share a scanned copy by uploading it through tracking Link!</p>
                  <div style="background-color: #f8f9fa; border-left: 4px solid #2ecc71; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #2c3e50;">Next Steps:</h4>
                    <ol style="color: #555; padding-left: 20px;">
                      <li style="margin-bottom: 8px;"><strong>Document Upload:</strong> Please upload all required documents through our secure portal</li>
                      <li style="margin-bottom: 8px;"><strong>Complete Your Details:</strong> Fill in your personal and professional information</li>
                      <li style="margin-bottom: 8px;"><strong>Track Your Progress:</strong> Use your personal tracking link below</li>
                    </ol>
                  </div>
                  
                  <p style="color: #555;">Your personal onboarding tracking link: <a href="${trackingLink}" style="color: #2ecc71; text-decoration: none; font-weight: 500;">${trackingLink}</a></p>
                  
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${trackingLink}" style="background-color: #2ecc71; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: 500; display: inline-block;">Start Onboarding Process</a>
                  </div>
                  
                  <p style="color: #555;">Our HR team will be in touch shortly to guide you through the process. If you have any questions, please don't hesitate to contact us at hr@zeelabpharmacy.com.</p>
                  
                  <p style="color: #2ecc71; font-weight: 500;">Welcome aboard!</p>
                  <p style="color: #333;"><strong>– Team Zeelab Pharmacy </strong></p>
                </div>
                <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                  © ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.
                </div>
              </div>
            </div>
          `,
          
        



attachments: [
  
  {
    filename: "Nomini.pdf",
    path: path.resolve(__dirname, "../public/letter/Nom.pdf"),
  },
  {
    filename: "Joining Form.pdf",
    path: path.resolve(__dirname, "../public/letter/Joining.pdf"),
  },
],



        
        
        };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending onboarding email:", error);
    throw error;
  }
};

 
 

async function sendConfirmationEmail(user, tempPassword) {
  try {
    const allNotification = await EmailNotification.findOne().lean();
    const recipients = [];

    if (allNotification?.joiningConfirmMail && user?.email) {
      recipients.push(user.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for onboarding emails");
      return;
    }

    // Generate a password reset link (implement your actual reset link generation)
    const resetLink = `http://139.59.85.95/forget-pass`;

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: user.email,
      subject: "Welcome to Zeelab Pharmacy - Your Account is Ready!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background-color: #3498db; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0;">Welcome to Zeelab Pharmacy!</h2>
              <p style="margin: 0; font-size: 14px;">Your account has been successfully created</p>
            </div>
            <div style="padding: 30px;">
              <h3 style="color: #333;">Dear ${user.firstName || 'Team Member'},</h3>
              <p style="color: #555;">We're excited to have you join the Zeelab Pharmacy family. Below are your account details:</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50;">Your Login Credentials:</h4>
                <ul style="color: #555; padding-left: 20px; margin-bottom: 0;">
                  <li style="margin-bottom: 8px;"><strong>Email:</strong> ${user.email}</li>
                  <li style="margin-bottom: 8px;"><strong>Temporary Password:</strong> ${tempPassword}</li>
                </ul>
              </div>
              
              <p style="color: #555; font-weight: 500;">For security reasons, please change your password immediately after first login.</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: 500; display: inline-block;">Set Your Password</a>
              </div>
              
              <p style="color: #555;">If you didn't request this account or need any assistance, please contact our HR team immediately at <a href="mailto:hr@zeelabpharmacy.com" style="color: #3498db;">hr@zeelabpharmacy.com</a>.</p>
              
              <p style="color: #3498db; font-weight: 500;">We look forward to working with you!</p>
              <p style="color: #333;"><strong>– Team Zeelab Pharmacy </strong></p>
            </div>
            <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              <p style="margin: 0;">For security reasons, never share your password with anyone.</p>
              <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("Confirmation email sent to", user.email);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw error;
  }
}
async function ActiveInactiveEmail(user) {
  try {
    const allNotification = await EmailNotification.findOne().lean();
    const recipients = [];

    if (allNotification?.activeInactiveEmployeeMail && user?.email) {
      recipients.push(user.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for status change emails");
      return;
    }

    const status = user.isActive ? "activated" : "deactivated";
    const actionDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: user.email,
      subject: `Your Zeelab Pharmacy 1os Account Has Been ${status.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Account Status Update</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #2c3e50, #3498db); padding: 30px; text-align: center; color: white; }
                .header img { height: 50px; margin-bottom: 15px; }
                .content { padding: 30px; color: #555; line-height: 1.6; }
                .status-box { background: ${user.isActive ? '#e8f5e9' : '#ffebee'}; border-left: 4px solid ${user.isActive ? '#4caf50' : '#f44336'}; padding: 15px; margin: 20px 0; }
                .details { background: #f8f9fa; border-radius: 6px; padding: 15px; margin: 20px 0; }
                .footer { background: #2c3e50; color: white; text-align: center; padding: 15px; font-size: 12px; }
                .button { display: inline-block; padding: 12px 25px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; margin: 15px 0; }
                .highlight { color: #2c3e50; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Pharmacy Logo">
                    <h2>Account ${user.isActive ? 'Activated' : 'Deactivated'}</h2>
                </div>
                
                <div class="content">
                    <p>Dear <span class="highlight">${user.firstName} ${user.lastName}</span>,</p>
                    
                    <p>We would like to inform you that your account with Zeelab Pharmacy has been <strong>${status}</strong> effective from <span class="highlight">${actionDate}</span>.</p>
                    
                    <div class="status-box">
                        <h3 style="margin-top: 0; color: ${user.isActive ? '#4caf50' : '#f44336'};">Account Status: ${user.isActive ? 'ACTIVE' : 'INACTIVE'}</h3>
                        ${user.isActive ? 
                          '<p>You can now access all authorized systems and applications.</p>' : 
                          '<p>You will no longer have access to company systems. Please contact HR if this is unexpected.</p>'}
                    </div>
                    
 <div class="details">
    <h4 style="margin-top: 0;">Your Account Details:</h4>
    <p><strong>Full Name:</strong> ${user.firstName} ${user.lastName}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    ${user.isActive ? `<p><strong>Pass:</strong> zee@12345</p>` : ""}
    ${user.isActive ? `<p>If showing invalid credential, <br/> just forget your password: <a href="http://139.59.85.95/forget-pass">Click here</a></p>` : ""}
    <p><strong>Contact Number:</strong> ${user.contactNumber}</p>
    <p><strong>Status Changed On:</strong> ${actionDate}</p>
  </div>
                    
                    ${user.isActive ? `
                    <p>To access your account, please use the credentials previously provided to you.</p>
                    <a href="http://139.59.85.95/login" class="button">Login to Portal</a>
                    ` : ''}
                    
                    <p>If you believe this status change was made in error or have any questions, please contact our HR department immediately:</p>
                    <p><strong>HR Contact:</strong> hr@zeelabpharmacy.com | +919896062723</p>
                    
                    <p>Thank you for being part of the Zeelab Pharmacy family.</p>
                    
                    <p>Best regards,<br>
                    <strong>The Zeelab Pharmacy Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.</p>
                    <p>This is an automated notification - please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await sendEmail(mailOptions);
    console.log("Status change email sent to", user.email);
  } catch (error) {
    console.error("Failed to send status change email:", error);
    throw error;
  }
}
 



async function OwnSeparationMailEmail(user, separation, head) {
  try {
    const allNotification = await EmailNotification.findOne().lean();
    const recipients = [];

    // Add employee email if notification is enabled
    if (allNotification?.OwnSeparationInitiatedMail && user?.email) {
      recipients.push(user.email);
    }

    // Add head email if notification is enabled
    if (allNotification?.OwnSeparationInformHead && head?.email) {
      recipients.push(head.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for separation emails");
      return;
    }

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients.join(','),
      subject: "Separation Process Initiated - Zeelab Pharmacy",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background-color: #e74c3c; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0;">Separation Process Initiated</h2>
              <p style="margin: 0; font-size: 14px;">Zeelab Pharmacy</p>
            </div>
            
            <div style="padding: 30px;">
              <h3 style="color: #333;">Dear ${user?.firstName || 'Team Member'},</h3>
              
              <p style="color: #555;">This is to inform you that the separation process has been initiated for <strong>${user?.firstName} ${user?.lastName}</strong> with the following details:</p>
              
              <!-- Separation Details Box -->
              <div style="background-color: #f9f2f2; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #c0392b;">Separation Details:</h4>
                <ul style="color: #555; padding-left: 20px; margin-bottom: 0;">
                  <li style="margin-bottom: 8px;"><strong>Employee:</strong> ${user?.firstName} ${user?.lastName}</li>
                  <li style="margin-bottom: 8px;"><strong>Type:</strong> ${separation?.separationType || 'Not specified'}</li>
                  <li style="margin-bottom: 8px;"><strong>Reason:</strong> ${separation?.reason || 'Not specified'}</li>
                  <li style="margin-bottom: 8px;"><strong>Notice Period:</strong> ${separation?.noticePeriod || '0'} days</li>
                  <li style="margin-bottom: 8px;"><strong>Expected Separation Date:</strong> ${separation?.expectedSeparationDate ? new Date(separation.expectedSeparationDate).toLocaleDateString() : 'Not specified'}</li>
                </ul>
              </div>
              
              <!-- Common Next Steps -->
              <h4 style="color: #c0392b; margin-top: 20px;">Next Steps:</h4>
              <ol style="color: #555; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Complete all pending tasks and handovers</li>
                <li style="margin-bottom: 8px;">Return company assets (laptop, ID card, etc.)</li>
                <li style="margin-bottom: 8px;">Clear any pending dues or formalities</li>
                <li style="margin-bottom: 8px;">Participate in exit formalities (if applicable)</li>
              </ol>
              
              <!-- Contact Information -->
              <div style="margin-top: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
                <p style="color: #555; margin: 0; text-align: center;">
                  For any questions regarding this separation process, please contact HR at 
                  <a href="mailto:hr@zeelabpharmacy.com" style="color: #e74c3c; font-weight: 500;">hr@zeelabpharmacy.com</a>
                </p>
              </div>
              
              <p style="color: #e74c3c; font-weight: 500; text-align: center; margin-top: 20px;">
                We appreciate the contributions made during the tenure with Zeelab Pharmacy.
              </p>
              
              <p style="color: #333; text-align: center;"><strong>– Zeelab Pharmacy HR Team</strong></p>
            </div>
            
            <!-- Email Footer -->
            <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("Separation notification email sent to:", recipients.join(', '));
  } catch (error) {
    console.error("Failed to send separation email:", error);
    throw error;
  }
}

async function CVTransftermail(application, recipient, assignType) {
  try {
    const allNotification = await EmailNotification.findOne().lean();
    const recipients = [];

    // Add recipient email if notification is enabled
    if (allNotification?.assignToManagerOrHrNotify && recipient?.email) {
      recipients.push(recipient.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for CV transfer notification");
      return;
    }

    // Determine transfer details based on assignType
    const transferDetails = {
      action: assignType === 'hr' ? 'HR Assignment' : 'Manager Review Assignment',
      assignedTo: `${recipient?.firstName} ${recipient?.lastName}`,
      assignedBy: `${application?.createdBy?.firstName} ${application?.createdBy?.lastName}`,
      applicationId: application._id,
      candidateName: application.name || 'Unknown Candidate',
      position: application.position || 'Unknown Position'
    };

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients.join(','),
      subject: `CV Assignment Notification - Zeelab Pharmacy`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header with Zeelab branding -->
            <div style="background-color: #2c3e50; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0; font-weight: 600;">CV Assignment Notification</h2>
              <p style="margin: 0; font-size: 14px;">Zeelab Pharmacy Recruitment</p>
            </div>
            
            <div style="padding: 30px;">
              <h3 style="color: #2c3e50; margin-top: 0;">Dear ${recipient.firstName},</h3>
              
              <p style="color: #555; line-height: 1.6;">
                This is to inform you that a candidate's CV has been ${assignType === 'hr' ? 'assigned to you as HR' : 'assigned to you for review'}.
              </p>
              
              <!-- Assignment Details Box -->
              <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 8px;">Assignment Details</h4>
                <table style="width: 100%; color: #555;">
                  <tr>
                    <td style="width: 40%; padding: 5px 0; font-weight: 500;">Action:</td>
                    <td style="padding: 5px 0;">${transferDetails.action}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Assigned To:</td>
                    <td style="padding: 5px 0;">${transferDetails.assignedTo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Assigned By:</td>
                    <td style="padding: 5px 0;">${transferDetails.assignedBy}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Candidate Name:</td>
                    <td style="padding: 5px 0;">${transferDetails.candidateName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Position:</td>
                    <td style="padding: 5px 0;">${transferDetails.position}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Application ID:</td>
                    <td style="padding: 5px 0;">${transferDetails.applicationId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Date:</td>
                    <td style="padding: 5px 0;">${new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Action Required -->
              <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50;">Action Required</h4>
                <p style="color: #555; margin-bottom: 0;">
                  ${assignType === 'hr' 
                    ? 'Please review the candidate profile and proceed with the HR screening process.' 
                    : 'Please review the candidate profile and provide your evaluation.'}
                </p>
              </div>
              
              <!-- Button to access application -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="http://139.59.85.95/recruitment/application/review?id=${application._id}" 
                   style="display: inline-block; background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                  View Application
                </a>
              </div>
              
              <!-- Contact Information -->
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
                <p style="color: #777; font-size: 14px; text-align: center;">
                  For any questions regarding this assignment, please contact the recruitment team at 
                  <a href="mailto:recruitment@zeelabpharmacy.com" style="color: #3498db; font-weight: 500;">recruitment@zeelabpharmacy.com</a>
                </p>
              </div>
              
              <p style="color: #2c3e50; font-weight: 500; text-align: center; margin-top: 20px;">
                Thank you for your contribution to our recruitment process.
              </p>
              
              <p style="color: #333; text-align: center;"><strong>– Zeelab Pharmacy Recruitment Team</strong></p>
            </div>
            
            <!-- Email Footer -->
            <div style="background-color: #2c3e50; text-align: center; padding: 15px; font-size: 12px; color: #ecf0f1;">
              <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("CV transfer notification email sent to:", recipients.join(', '));
  } catch (error) {
    console.error("Failed to send CV transfer email:", error);
    throw error;
  }
}




async function getFeedbackMailFromReviwer(creator, manager, application) {
  try {
    const allNotification = await EmailNotification.findOne().lean();
    const recipients = [];

    // Add creator's email if notification is enabled
    if (allNotification?.getFeedbackMailFromReviwer && creator?.email) {
      recipients.push(creator.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for feedback notification");
      return;
    }

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients.join(','),
      subject: `Feedback Received on Candidate Review - Zeelab Pharmacy`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header with Zeelab branding -->
            <div style="background-color: #2c3e50; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0; font-weight: 600;">Feedback Received</h2>
              <p style="margin: 0; font-size: 14px;">Zeelab Pharmacy Recruitment</p>
            </div>
            
            <div style="padding: 30px;">
              <h3 style="color: #2c3e50; margin-top: 0;">Dear ${creator.firstName},</h3>
              
              <p style="color: #555; line-height: 1.6;">
                This is to inform you that ${manager.firstName} has provided feedback on the candidate you assigned for review.
              </p>
              
              <!-- Feedback Details Box -->
              <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 8px;">Feedback Details</h4>
                <table style="width: 100%; color: #555;">
                  <tr>
                    <td style="width: 40%; padding: 5px 0; font-weight: 500;">Reviewed By:</td>
                    <td style="padding: 5px 0;">${manager.firstName} ${manager.lastName || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Status:</td>
                    <td style="padding: 5px 0; text-transform: capitalize;">${application?.managerReview?.status.replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Feedback Date:</td>
                    <td style="padding: 5px 0;">${new Date(application.managerReview.feedbackAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Candidate Name:</td>
                    <td style="padding: 5px 0;">${application?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Position:</td>
                    <td style="padding: 5px 0;">${application?.position}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Application ID:</td>
                    <td style="padding: 5px 0;">${application?._id}</td>
                  </tr>
                  ${application.managerReview?.note ? `
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500; vertical-align: top;">Notes:</td>
                    <td style="padding: 5px 0;">${application?.managerReview?.note}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <!-- Action Required -->
              <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50;">Next Steps</h4>
                <p style="color: #555; margin-bottom: 0;">
                  Please review the feedback provided and take appropriate action for the candidate's next steps in the recruitment process.
                </p>
              </div>
              
              <!-- Button to access application -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="http://139.59.85.95/recruitment/application?id=${application._id}" 
                   style="display: inline-block; background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                  View Application Details
                </a>
              </div>
              
              <!-- Contact Information -->
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
                <p style="color: #777; font-size: 14px; text-align: center;">
                  For any questions regarding this feedback, please contact the recruitment team at 
                  <a href="mailto:recruitment@zeelabpharmacy.com" style="color: #3498db; font-weight: 500;">recruitment@zeelabpharmacy.com</a>
                </p>
              </div>
              
              <p style="color: #2c3e50; font-weight: 500; text-align: center; margin-top: 20px;">
                Thank you for your contribution to our recruitment process.
              </p>
              
              <p style="color: #333; text-align: center;"><strong>– Zeelab Pharmacy Recruitment Team</strong></p>
            </div>
            
            <!-- Email Footer -->
            <div style="background-color: #2c3e50; text-align: center; padding: 15px; font-size: 12px; color: #ecf0f1;">
              <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("Feedback notification email sent to:", recipients.join(', '));
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    throw error;
  }
}
async function getFeedbackMailFromManagerForManpower(creator, manager, application) {
  try {
    const allNotification = await EmailNotification.findOne().lean();
    const recipients = [];

    // Add creator's email if notification is enabled
    if (allNotification?.getFeedbackMailFromManagerForManpower && creator?.email) {
      recipients.push(creator.email);
    }

    if (recipients.length === 0) {
      console.log("No recipients configured for feedback notification");
      return;
    }

    const mailOptions = {
      from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
      to: recipients.join(','),
      subject: `Feedback Received on Candidate Review - Zeelab Pharmacy`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header with Zeelab branding -->
            <div style="background-color: #2c3e50; padding: 20px; color: white; text-align: center;">
              <h2 style="margin: 0; font-weight: 600;">Feedback Received</h2>
              <p style="margin: 0; font-size: 14px;">Zeelab Pharmacy Recruitment</p>
            </div>
            
            <div style="padding: 30px;">
              <h3 style="color: #2c3e50; margin-top: 0;">Dear ${creator.firstName},</h3>
              
              <p style="color: #555; line-height: 1.6;">
                This is to inform you that ${manager.firstName} has provided feedback on the candidate you assigned for review.
              </p>
              
              <!-- Feedback Details Box -->
              <div style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 8px;">Feedback Details</h4>
                <table style="width: 100%; color: #555;">
                  <tr>
                    <td style="width: 40%; padding: 5px 0; font-weight: 500;">Reviewed By:</td>
                    <td style="padding: 5px 0;">${manager.firstName} ${manager.lastName || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Status:</td>
                    <td style="padding: 5px 0; text-transform: capitalize;">${application?.managerReview?.status.replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Feedback Date:</td>
                    <td style="padding: 5px 0;">${new Date(application.managerReview.feedbackAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Candidate Name:</td>
                    <td style="padding: 5px 0;">${application?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Position:</td>
                    <td style="padding: 5px 0;">${application?.position}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500;">Application ID:</td>
                    <td style="padding: 5px 0;">${application?._id}</td>
                  </tr>
                  ${application.managerReview?.note ? `
                  <tr>
                    <td style="padding: 5px 0; font-weight: 500; vertical-align: top;">Notes:</td>
                    <td style="padding: 5px 0;">${application?.managerReview?.note}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <!-- Action Required -->
              <div style="background-color: #e8f4fd; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #2c3e50;">Next Steps</h4>
                <p style="color: #555; margin-bottom: 0;">
                  Please review the feedback provided and take appropriate action for the candidate's next steps in the recruitment process.
                </p>
              </div>
              
              <!-- Button to access application -->
              <div style="text-align: center; margin: 25px 0;">
                <a href="http://139.59.85.95/recruitment/application?id=${application._id}" 
                   style="display: inline-block; background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                  View Application Details
                </a>
              </div>
              
              <!-- Contact Information -->
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee;">
                <p style="color: #777; font-size: 14px; text-align: center;">
                  For any questions regarding this feedback, please contact the recruitment team at 
                  <a href="mailto:recruitment@zeelabpharmacy.com" style="color: #3498db; font-weight: 500;">recruitment@zeelabpharmacy.com</a>
                </p>
              </div>
              
              <p style="color: #2c3e50; font-weight: 500; text-align: center; margin-top: 20px;">
                Thank you for your contribution to our recruitment process.
              </p>
              
              <p style="color: #333; text-align: center;"><strong>– Zeelab Pharmacy Recruitment Team</strong></p>
            </div>
            
            <!-- Email Footer -->
            <div style="background-color: #2c3e50; text-align: center; padding: 15px; font-size: 12px; color: #ecf0f1;">
              <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
              <p style="margin: 5px 0 0;">© ${new Date().getFullYear()} Zeelab Pharmacy. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    console.log("Feedback notification email sent to:", recipients.join(', '));
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    throw error;
  }
}



module.exports = { RejectionMail ,   getFeedbackMailFromManagerForManpower,     ActiveInactiveEmail,CVTransftermail,getFeedbackMailFromReviwer,  OwnSeparationMailEmail, sendConfirmationEmail,   onboardingMail  };