import { fetchProductPrice } from "../src/lib/price-fetcher";
import dotenv from "dotenv";

dotenv.config();

const testUrls = [
  {
    name: "Apple iPhone 15 (Black, 128 GB)",
    url: "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm2d83c2c5b3a37",
    store: "Flipkart",
  },
  {
    name: "Apple AirPods Pro (2nd gen) (USB-C)",
    url: "https://www.flipkart.com/apple-airpods-pro-2nd-generation-magsafe-case-usb-c-bluetooth-headset/p/itm5b0a7c49015c7",
    store: "Flipkart",
  },
  {
    name: "Non-existent Flipkart Product (Should return null/skip safely)",
    url: "https://www.flipkart.com/this-product-does-not-exist-at-all-12345/p/itm12345",
    store: "Flipkart",
  },
  {
    name: "Amazon Product Test (SanDisk Flash Drive)",
    url: "https://www.amazon.in/dp/B007JR532M",
    store: "Amazon",
  }
];

async function runTests() {
  console.log("Starting Flipkart price fetching tests...\n");

  for (const item of testUrls) {
    console.log(`--------------------------------------------------`);
    console.log(`Testing: ${item.name}`);
    console.log(`URL: ${item.url}`);
    
    try {
      const price = await fetchProductPrice(item.url, item.store);
      console.log(`Fetched Price result: ${price !== null ? `₹${price.toLocaleString()}` : "NULL"}`);
    } catch (error) {
      console.error("Test execution error:", error);
    }
    console.log(`--------------------------------------------------\n`);
  }

  console.log("Flipkart price fetching test execution complete.");
}

runTests().catch(console.error);
