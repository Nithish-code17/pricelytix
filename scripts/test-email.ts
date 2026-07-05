import { sendPriceAlertEmail } from "../src/lib/email";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("Starting SMTP Email alert system test...\n");

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const alertEmail = process.env.ALERT_EMAIL;

  console.log("Detected SMTP Env Variables:");
  console.log(`- SMTP_HOST: ${host || "Not set"}`);
  console.log(`- SMTP_PORT: ${port || "Not set"}`);
  console.log(`- SMTP_USER: ${user ? "Configure (hidden)" : "Not set"}`);
  console.log(`- SMTP_PASS: ${pass ? "Configure (hidden)" : "Not set"}`);
  console.log(`- ALERT_EMAIL: ${alertEmail || "Not set"}\n`);

  if (!host || !user || !pass || !alertEmail) {
    console.error("FAIL: One or more SMTP configurations are missing in .env.");
    process.exit(1);
  }

  console.log("Calling sendPriceAlertEmail with sample product data...");
  const success = await sendPriceAlertEmail({
    title: "SanDisk Cruzer Blade 32GB USB Flash Drive",
    url: "https://www.amazon.in/dp/B007JR532M",
    currentPrice: 320,
    targetPrice: 350,
    store: "Amazon"
  });

  if (success) {
    console.log("\nSUCCESS: Test email alert sent successfully! Check your inbox. ✅");
  } else {
    console.error("\nFAIL: Test email alert sending failed. Check errors above.");
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("TEST FATAL ERROR:", err);
  process.exit(1);
});
