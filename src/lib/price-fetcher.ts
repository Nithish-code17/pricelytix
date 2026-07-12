import * as cheerio from "cheerio";

async function launchBrowser() {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    const [{ chromium: playwrightChromium }, chromiumModule] =
      await Promise.all([
        import("playwright-core"),
        import("@sparticuz/chromium"),
      ]);

    const chromium = chromiumModule.default;

    return playwrightChromium.launch({
      args: [
        ...chromium.args,
        "--disable-http2",
        "--disable-gpu",
        "--no-sandbox",
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { chromium } = await import("playwright");

  return chromium.launch({
    headless: true,
  });
}

function parsePrice(text: string): number | null {
  if (!text) return null;

  const cleaned = text
    .replace(/[^\d.,]/g, "")
    .replace(/,/g, "")
    .trim();

  if (!cleaned) return null;

  const value = Number(cleaned);

  if (Number.isNaN(value)) return null;
  if (value <= 0) return null;

  return value;
}

function isReasonablePrice(price: number | null): boolean {
  if (!price) return false;
  return price >= 50 && price <= 500000;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  return await response.text();
}

async function fetchAmazonPriceDynamic(url: string): Promise<number | null> {
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-IN",
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // Block heavy resources
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (type === "image" || type === "font" || type === "media") {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(5000);

    const selectors = [
      ".a-price .a-offscreen",
      ".aok-offscreen",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
    ];

    for (const selector of selectors) {
      try {
        const text = await page.locator(selector).first().textContent({ timeout: 2000 });
        const price = parsePrice(text || "");
        if (isReasonablePrice(price)) {
          console.log(`[AMAZON DYNAMIC] Found price via selector ${selector}: ₹${price}`);
          await context.close();
          return price;
        }
      } catch {}
    }

    await context.close();
    return null;
  } catch (error) {
    console.error("[AMAZON DYNAMIC] Error scraping dynamic price:", error);
    return null;
  } finally {
    await browser.close();
  }
}

async function fetchAmazonPrice(url: string): Promise<number | null> {
  let html = "";
  try {
    html = await fetchHtml(url);
  } catch (error) {
    console.warn("AMAZON STATIC FETCH FAILED:", error instanceof Error ? error.message : error);
    return await fetchAmazonPriceDynamic(url);
  }

  const $ = cheerio.load(html);

  const selectors = [
    ".a-price .a-offscreen",
    ".aok-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#priceblock_saleprice",
  ];

  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    const price = parsePrice(text);

    if (isReasonablePrice(price)) {
      return price;
    }
  }

  console.log("Amazon static selectors did not find a price. Trying dynamic browser fetch...");
  return await fetchAmazonPriceDynamic(url);
}

function isValidFlipkartPriceText(text: string): boolean {
  const lower = text.toLowerCase();
  const blacklisted = ["emi", "off", "%", "save", "discount", "exchange", "coupon"];
  return !blacklisted.some((word) => lower.includes(word));
}

async function fetchFlipkartPrice(url: string): Promise<number | null> {
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-IN",
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // Block heavy resources
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (type === "image" || type === "font" || type === "media") {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(5000);

    const candidates: Array<{ source: string; raw: string; price: number }> = [];

    const addCandidate = (source: string, rawText: string) => {
      if (!rawText) return;
      if (!isValidFlipkartPriceText(rawText)) return;
      const parsed = parsePrice(rawText);
      if (parsed !== null && parsed >= 50 && parsed <= 500000) {
        candidates.push({ source, raw: rawText.trim(), price: parsed });
      }
    };

    // 1. Try structured meta tags
    const metaSelectors = [
      'meta[itemprop="price"]',
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
    ];

    for (const sel of metaSelectors) {
      try {
        const content = await page.locator(sel).first().getAttribute("content", { timeout: 2000 });
        if (content) {
          addCandidate(`Meta ${sel}`, content);
        }
      } catch {}
    }

    // 2. Try JSON-LD script
    try {
      const scripts = await page.locator('script[type="application/ld+json"]').all();
      for (const script of scripts) {
        const content = await script.textContent();
        if (content) {
          try {
            const json = JSON.parse(content);
            const searchJsonLd = (obj: any) => {
              if (!obj || typeof obj !== "object") return;
              if (obj.offers) {
                if (Array.isArray(obj.offers)) {
                  for (const off of obj.offers) {
                    if (off.price) addCandidate("JSON-LD (offers.price)", String(off.price));
                  }
                } else if (obj.offers.price) {
                  addCandidate("JSON-LD (offers.price)", String(obj.offers.price));
                }
              }
              if (obj.price) {
                addCandidate("JSON-LD (price)", String(obj.price));
              }
              for (const key of Object.keys(obj)) {
                searchJsonLd(obj[key]);
              }
            };
            searchJsonLd(json);
          } catch {}
        }
      }
    } catch {}

    // 3. Try selectors in priority order
    const selectors = [
      "div.Nx9bqj.CxhGGd",
      "div.Nx9bqj",
      "div._30jeq3._16Jk6d",
      "div._30jeq3",
      "[class*='Nx9bqj']",
      "[class*='_30jeq3']",
    ];

    for (const selector of selectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const el of elements) {
          const text = await el.textContent({ timeout: 2000 });
          if (text) {
            addCandidate(selector, text);
          }
        }
      } catch {}
    }

    await context.close();

    if (candidates.length === 0) {
      console.log("[FLIPKART PRICE] No reliable price found");
      return null;
    }

    // Obvious EMI protection: Reject prices that are extremely low relative to the highest candidate
    const maxPrice = Math.max(...candidates.map((c) => c.price));
    const filteredCandidates = candidates.filter((c) => {
      if (maxPrice > 10000 && c.price < maxPrice * 0.15) {
        return false; // likely an EMI or small fee
      }
      return true;
    });

    if (filteredCandidates.length === 0) {
      console.log("[FLIPKART PRICE] No reliable price found");
      return null;
    }

    // Sort by source priority
    const getSourceScore = (source: string): number => {
      if (source.startsWith("Meta") || source.startsWith("JSON-LD")) return 100;
      const index = selectors.indexOf(source);
      if (index !== -1) {
        return 90 - index;
      }
      return 10;
    };

    filteredCandidates.sort((a, b) => getSourceScore(b.source) - getSourceScore(a.source));

    const bestCandidate = filteredCandidates[0];
    console.log(
      `[FLIPKART PRICE] Source: ${bestCandidate.source} | Raw: ${bestCandidate.raw} | Parsed: ${bestCandidate.price}`
    );

    return bestCandidate.price;
  } catch (error) {
    console.error("[FLIPKART PRICE] Error scraping price:", error);
    return null;
  } finally {
    await browser.close();
  }
}

export async function fetchProductPrice(
  url: string,
  store: string
): Promise<number | null> {
  try {
    if (store === "Amazon") {
      return await fetchAmazonPrice(url);
    }

    if (store === "Flipkart") {
      return await fetchFlipkartPrice(url);
    }

    // Myntra and Ajio are currently blocked / unstable
    return null;
  } catch (error) {
    console.error("PRICE FETCH ERROR:", error);
    return null;
  }
}