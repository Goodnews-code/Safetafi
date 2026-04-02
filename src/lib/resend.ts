import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";

export const resend = new Resend(resendApiKey);

/**
 * Generates a premium HTML email template for SAFETAFI receipts
 */
export function getReceiptEmailHtml(data: {
  name: string;
  reference: string;
  amount: string;
  service: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .header { background-color: #001B44; padding: 40px; text-align: center; }
          .logo { color: #0047BB; font-weight: 900; font-size: 24px; text-transform: uppercase; letter-spacing: -1px; }
          .logo span { color: #FF8C00; }
          .content { padding: 40px; color: #334155; line-height: 1.6; }
          h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px; }
          .receipt-box { background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid #e2e8f0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .label { color: #64748b; font-weight: 600; }
          .value { color: #0f172a; font-weight: 700; text-align: right; }
          .total { border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
          .total .value { color: #0047BB; font-size: 18px; }
          .footer { padding: 40px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px; }
          .btn { display: inline-block; background-color: #0047BB; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAFE<span>TAFI</span></div>
          </div>
          <div class="content">
            <h1>Booking Confirmed!</h1>
            <p>Hi ${data.name},</p>
            <p>Thank you for choosing SAFETAFI. Your logistics booking has been successfully verified and our team has been notified. We will contact you within 2 hours to coordinate the final details.</p>
            
            <div class="receipt-box">
              <div class="row">
                <span class="label">Payment Reference</span>
                <span class="value">${data.reference}</span>
              </div>
              <div class="row">
                <span class="label">Service Category</span>
                <span class="value">${data.service}</span>
              </div>
              <div class="row total">
                <span class="label">Total Paid</span>
                <span class="value">${data.amount}</span>
              </div>
            </div>

            <p>If you have any urgent questions, feel free to contact our support desk.</p>
            <a href="https://safetafi.com" class="btn">View Tracking Status</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 SAFETAFI Transport & Logistics. All rights reserved.</p>
            <p>Lagos, Nigeria | +234 905 805 0350</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
