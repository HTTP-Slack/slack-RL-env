import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter;

const initializeTransporter = () => {
  if (transporter) return transporter;

  // For development: Use Ethereal email (fake SMTP service)
  // For production: Use real SMTP service like Gmail, SendGrid, etc.
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    // Production SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Use console logging
    console.log('📧 Email service running in development mode (console only)');
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n📨 ===== EMAIL WOULD BE SENT =====');
        console.log('From:', mailOptions.from);
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML Body:', mailOptions.html);
        console.log('================================\n');
        return { messageId: 'dev-' + Date.now() };
      },
    };
  }

  return transporter;
};

/**
 * Send workspace invitation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.workspaceName - Name of the workspace
 * @param {string} options.inviterName - Name of the person inviting
 * @param {string} options.joinLink - Link to join the workspace
 */
export const sendInvitationEmail = async ({ to, workspaceName, inviterName, joinLink }) => {
  try {
    const transporter = initializeTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Slack Clone" <noreply@slack-clone.com>',
      to,
      subject: `${inviterName} invited you to join ${workspaceName} on Slack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join ${workspaceName} on Slack</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #611f69;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        You've been invited to join a workspace
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #1d1c1d;">
                        <strong>${inviterName}</strong> invited you to join <strong>${workspaceName}</strong> on Slack.
                      </p>
                      
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #1d1c1d;">
                        Slack is where work happens. It's a place where teams come together to collaborate, 
                        share ideas, and get work done.
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${joinLink}" style="display: inline-block; padding: 14px 32px; background-color: #611f69; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 700;">
                              Join ${workspaceName}
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 20px; color: #616061;">
                        Or copy and paste this URL into your browser:<br>
                        <a href="${joinLink}" style="color: #1264a3; text-decoration: none;">${joinLink}</a>
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 30px 0;">
                      
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #616061;">
                        This invitation will expire in 30 days. If you don't want to join this workspace, 
                        you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f9f9f9; border-top: 1px solid #e8e8e8;">
                      <p style="margin: 0; font-size: 12px; line-height: 18px; color: #616061; text-align: center;">
                        This email was sent by Slack Clone<br>
                        © ${new Date().getFullYear()} Slack Clone. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        ${inviterName} invited you to join ${workspaceName} on Slack
        
        Slack is where work happens. It's a place where teams come together to collaborate, 
        share ideas, and get work done.
        
        Click the link below to join:
        ${joinLink}
        
        This invitation will expire in 30 days.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send multiple invitation emails
 * @param {Array} invitations - Array of invitation objects
 */
export const sendBulkInvitations = async (invitations) => {
  const results = await Promise.allSettled(
    invitations.map((invitation) => sendInvitationEmail(invitation))
  );

  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;

  return {
    total: results.length,
    successful,
    failed,
    results,
  };
};
