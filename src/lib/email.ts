import nodemailer from "nodemailer";

export interface PriceAlertEmailParams {
  title: string;
  url: string;
  currentPrice: number;
  targetPrice: number;
  store?: string;
  userEmail?: string;
}

export async function sendPriceAlertEmail(
  params: PriceAlertEmailParams
): Promise<boolean> {
  const { title, url, currentPrice, targetPrice, store = "Unknown Store", userEmail } = params;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const targetRecipient = userEmail || process.env.ALERT_EMAIL;

  if (!host || !user || !pass || !targetRecipient) {
    console.warn(
      "[EMAIL ALERT] SMTP environment variables or target recipient missing. Skipping email alert."
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const subject = `🚨 Price Drop Alert: ${title}`;
    const textMessage = `Price Drop Alert!\n\nProduct: ${title}\nStore: ${store}\nCurrent Price: ₹${currentPrice}\nTarget Price: ₹${targetPrice}\n\nView product: ${url}`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">🚨 Price Drop Alert!</h2>
        <p style="font-size: 16px; color: #1f2937;">Good news! A product you are tracking has reached your target price.</p>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111827;">${title}</h3>
          <p style="margin: 4px 0; color: #4b5563;"><strong>Store:</strong> ${store}</p>
          <p style="margin: 4px 0; color: #10b981; font-size: 18px; font-weight: bold;">
            Current Price: ₹${currentPrice}
          </p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
            Target Price: ₹${targetPrice}
          </p>
        </div>

        <a href="${url}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold;">
          View Product Page
        </a>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Pricelytix Alerts" <${user}>`,
      to: targetRecipient,
      subject,
      text: textMessage,
      html: htmlMessage,
    });

    console.log(`[EMAIL ALERT] Sent alert email to ${targetRecipient}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ALERT FAILED] Error sending price alert email:", error);
    return false;
  }
}
