import * as cheerio from "cheerio";

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

function isValidFlipkartPriceText(text: string): boolean {
  const lower = text.toLowerCase();
  const blacklisted = ["emi", "off", "%", "save", "discount", "exchange", "coupon"];
  return !blacklisted.some((word) => lower.includes(word));
}

async function fetchDynamicPriceWithPuppeteer(
  url: string,
  store: string,
  selectors: string[]
): Promise<number | null> {
  console.log(`[PUPPETEER] Scraping dynamically on Vercel: ${url}`);
  const puppeteer = await import("puppeteer-core");
  const chromiumModule = await import("@sparticuz/chromium");
  const chromium = chromiumModule.default;

  const browser = await puppeteer.default.launch({
    args: [
      ...chromium.args,
      "--disable-http2",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
    },
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-IN,en;q=0.9",
    });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (type === "image" || type === "font" || type === "media") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    let foundPrice: number | null = null;

    // 1. Try structured meta tags
    const metaSelectors = [
      'meta[itemprop="price"]',
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
    ];

    for (const sel of metaSelectors) {
      try {
        const content = await page.evaluate((s) => {
          const el = document.querySelector(s);
          return el ? el.getAttribute("content") : null;
        }, sel);

        if (content) {
          const price = parsePrice(content);
          if (isReasonablePrice(price)) {
            foundPrice = price;
            console.log(`[PUPPETEER] Found price via meta tag ${sel}: ₹${price}`);
            break;
          }
        }
      } catch {}
    }

    // 2. Try JSON-LD script
    if (foundPrice === null) {
      try {
        const scriptTexts = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
          return scripts.map((s) => s.textContent || "");
        });

        const candidates: number[] = [];
        const addCandidate = (text: string) => {
          if (!text) return;
          const cleaned = text.toLowerCase();
          const blacklisted = ["emi", "off", "%", "save", "discount", "exchange", "coupon"];
          if (blacklisted.some((word) => cleaned.includes(word))) return;
          const parsed = parsePrice(text);
          if (parsed !== null && isReasonablePrice(parsed)) {
            candidates.push(parsed);
          }
        };

        for (const content of scriptTexts) {
          if (content) {
            try {
              const json = JSON.parse(content);
              const searchJsonLd = (obj: any) => {
                if (!obj || typeof obj !== "object") return;
                if (obj.offers) {
                  if (Array.isArray(obj.offers)) {
                    for (const off of obj.offers) {
                      if (off.price) addCandidate(String(off.price));
                    }
                  } else if (obj.offers.price) {
                    addCandidate(String(obj.offers.price));
                  }
                }
                if (obj.price) {
                  addCandidate(String(obj.price));
                }
                for (const key of Object.keys(obj)) {
                  searchJsonLd(obj[key]);
                }
              };
              searchJsonLd(json);
            } catch {}
          }
        }
        if (candidates.length > 0) {
          foundPrice = candidates[0];
          console.log(`[PUPPETEER] Found price via JSON-LD: ₹${foundPrice}`);
        }
      } catch (err) {
        console.error("[PUPPETEER] JSON-LD extraction failed:", err);
      }
    }

    // 3. Try selectors in priority order
    if (foundPrice === null) {
      for (const selector of selectors) {
        try {
          const text = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            return el ? el.textContent : null;
          }, selector);

          if (text) {
            const price = parsePrice(text);
            if (isReasonablePrice(price)) {
              foundPrice = price;
              console.log(`[PUPPETEER] Found price via selector ${selector}: ₹${price}`);
              break;
            }
          }
        } catch {}
      }
    }

    // 4. Fallback to body text rupee regex
    if (foundPrice === null) {
      try {
        const bodyText = await page.evaluate(() => document.body.innerText);
        const rupeeMatches = bodyText.match(/₹\s?[\d,]+/g);
        if (rupeeMatches) {
          for (const match of rupeeMatches) {
            const price = parsePrice(match);
            if (isReasonablePrice(price)) {
              foundPrice = price;
              console.log(`[PUPPETEER] Fallback found price in body text: ₹${price}`);
              break;
            }
          }
        }
      } catch {}
    }

    return foundPrice;
  } catch (error) {
    console.error("[PUPPETEER] Error scraping dynamic price:", error);
    return null;
  } finally {
    await browser.close();
  }
}

async function fetchDynamicPriceWithPlaywright(
  url: string,
  store: string,
  selectors: string[]
): Promise<number | null> {
  console.log(`[PLAYWRIGHT] Scraping dynamically locally: ${url}`);
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

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

    let foundPrice: number | null = null;

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
          const price = parsePrice(content);
          if (isReasonablePrice(price)) {
            foundPrice = price;
            console.log(`[PLAYWRIGHT] Found price via meta tag ${sel}: ₹${price}`);
            break;
          }
        }
      } catch {}
    }

    // 2. Try JSON-LD script
    if (foundPrice === null) {
      try {
        const scripts = await page.locator('script[type="application/ld+json"]').all();
        const candidates: number[] = [];
        const addCandidate = (text: string) => {
          if (!text) return;
          const cleaned = text.toLowerCase();
          const blacklisted = ["emi", "off", "%", "save", "discount", "exchange", "coupon"];
          if (blacklisted.some((word) => cleaned.includes(word))) return;
          const parsed = parsePrice(text);
          if (parsed !== null && isReasonablePrice(parsed)) {
            candidates.push(parsed);
          }
        };

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
                      if (off.price) addCandidate(String(off.price));
                    }
                  } else if (obj.offers.price) {
                    addCandidate(String(obj.offers.price));
                  }
                }
                if (obj.price) {
                  addCandidate(String(obj.price));
                }
                for (const key of Object.keys(obj)) {
                  searchJsonLd(obj[key]);
                }
              };
              searchJsonLd(json);
            } catch {}
          }
        }
        if (candidates.length > 0) {
          foundPrice = candidates[0];
          console.log(`[PLAYWRIGHT] Found price via JSON-LD: ₹${foundPrice}`);
        }
      } catch {}
    }

    // 3. Try selectors
    if (foundPrice === null) {
      for (const selector of selectors) {
        try {
          const elements = await page.locator(selector).all();
          for (const el of elements) {
            const text = await el.textContent({ timeout: 2000 });
            if (text) {
              const price = parsePrice(text);
              if (isReasonablePrice(price)) {
                foundPrice = price;
                console.log(`[PLAYWRIGHT] Found price via selector ${selector}: ₹${price}`);
                break;
              }
            }
          }
          if (foundPrice !== null) break;
        } catch {}
      }
    }

    // 4. Fallback to body text rupee regex
    if (foundPrice === null) {
      try {
        const bodyText = await page.locator("body").innerText();
        const rupeeMatches = bodyText.match(/₹\s?[\d,]+/g);
        if (rupeeMatches) {
          for (const match of rupeeMatches) {
            const price = parsePrice(match);
            if (isReasonablePrice(price)) {
              foundPrice = price;
              console.log(`[PLAYWRIGHT] Fallback found price in body text: ₹${match}`);
              break;
            }
          }
        }
      } catch {}
    }

    await context.close();
    return foundPrice;
  } catch (error) {
    console.error("[PLAYWRIGHT] Error scraping dynamic price:", error);
    return null;
  } finally {
    await browser.close();
  }
}

async function fetchDynamicPrice(
  url: string,
  store: string,
  selectors: string[]
): Promise<number | null> {
  const isVercel = process.env.VERCEL === "1";
  if (isVercel) {
    return await fetchDynamicPriceWithPuppeteer(url, store, selectors);
  } else {
    return await fetchDynamicPriceWithPlaywright(url, store, selectors);
  }
}

async function fetchAmazonPrice(url: string): Promise<number | null> {
  const selectors = [
    ".a-price .a-offscreen",
    ".aok-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#priceblock_saleprice",
  ];

  let html = "";
  try {
    html = await fetchHtml(url);
  } catch (error) {
    console.warn("AMAZON STATIC FETCH FAILED:", error instanceof Error ? error.message : error);
    return await fetchDynamicPrice(url, "Amazon", selectors);
  }

  const $ = cheerio.load(html);

  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    const price = parsePrice(text);

    if (isReasonablePrice(price)) {
      return price;
    }
  }

  console.log("Amazon static selectors did not find a price. Trying dynamic browser fetch...");
  return await fetchDynamicPrice(url, "Amazon", selectors);
}

async function fetchFlipkartPrice(url: string): Promise<number | null> {
  const selectors = [
    "div.Nx9bqj.CxhGGd",
    "div.Nx9bqj",
    "div._30jeq3._16Jk6d",
    "div._30jeq3",
    "[class*='Nx9bqj']",
    "[class*='_30jeq3']",
  ];
  return await fetchDynamicPrice(url, "Flipkart", selectors);
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

    return null;
  } catch (error) {
    console.error("PRICE FETCH ERROR:", error);
    return null;
  }
}