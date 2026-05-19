import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const ADMIN_EMAIL = 'kaninpino1000@gmail.com';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export async function sendDeviceApprovalEmail(deviceInfo) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email notification');
    console.log('Device approval needed for:', deviceInfo.device_id);
    return;
  }

  const approveUrl = `${BASE_URL}/api/devices/approve/${deviceInfo.device_id}`;
  const rejectUrl = `${BASE_URL}/api/devices/reject/${deviceInfo.device_id}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #FAF9F6; padding: 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 24px; margin: 0;">Jewel Lifestyle Magazine</h1>
        <p style="color: #D4AF37; opacity: 0.7; margin: 5px 0 0;">Admin Device Access Request</p>
      </div>
      <div style="background: #1a1a1a; padding: 25px; margin-bottom: 20px;">
        <h2 style="color: #D4AF37; font-size: 18px; margin: 0 0 15px;">New Device Login Attempt</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Device ID</td><td style="padding: 8px 0; color: #fff; font-size: 13px; word-break: break-all;">${deviceInfo.device_id}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Device Name</td><td style="padding: 8px 0; color: #fff; font-size: 13px;">${deviceInfo.device_name || 'Unknown'}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">User Agent</td><td style="padding: 8px 0; color: #fff; font-size: 13px; word-break: break-all;">${deviceInfo.user_agent || 'Unknown'}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">IP Address</td><td style="padding: 8px 0; color: #fff; font-size: 13px;">${deviceInfo.ip_address || 'Unknown'}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #fff; font-size: 13px;">${new Date().toLocaleString()}</td></tr>
        </table>
      </div>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${approveUrl}" style="display: inline-block; background: #D4AF37; color: #000; text-decoration: none; padding: 12px 30px; margin: 0 8px; font-weight: bold; border-radius: 4px;">Approve Device</a>
        <a href="${rejectUrl}" style="display: inline-block; background: #333; color: #FAF9F6; text-decoration: none; padding: 12px 30px; margin: 0 8px; font-weight: bold; border-radius: 4px;">Reject Device</a>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">This is an automated security message from Jewel Lifestyle Magazine.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Jewel Magazine Security" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: 'Admin Device Access Request - Jewel Lifestyle Magazine',
      html,
    });
    console.log('Device approval email sent');
  } catch (err) {
    console.error('Failed to send device approval email:', err.message);
  }
}

export async function sendDeviceApprovalResultEmail(deviceId, approved) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping result notification');
    return;
  }

  const action = approved ? 'Approved' : 'Rejected';
  const color = approved ? '#4CAF50' : '#f44336';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #FAF9F6; padding: 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 24px; margin: 0;">Jewel Lifestyle Magazine</h1>
        <p style="color: #D4AF37; opacity: 0.7; margin: 5px 0 0;">Device ${action}</p>
      </div>
      <div style="background: #1a1a1a; padding: 25px; text-align: center;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: ${color}20; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
          <span style="font-size: 30px;">${approved ? '✓' : '✗'}</span>
        </div>
        <h2 style="color: ${color}; font-size: 18px; margin: 0 0 10px;">Device ${action}</h2>
        <p style="color: #888; font-size: 13px; word-break: break-all;">Device: ${deviceId}</p>
        <p style="color: #666; font-size: 12px; margin-top: 15px;">${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Jewel Magazine Security" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `Device ${action} - Jewel Lifestyle Magazine`,
      html,
    });
  } catch (err) {
    console.error('Failed to send result email:', err.message);
  }
}
