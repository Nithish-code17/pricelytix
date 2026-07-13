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

function isSuspiciousPriceForTitle(price: number, titleOrUrl: string): boolean {
  if (price < 50 || price > 500000) return true;

  const lowerText = titleOrUrl.toLowerCase();
  const expensiveKeywords = ["phone", "galaxy", "oneplus", "motorola", "iphone", "laptop"];
  const speakerKeywords = ["marshall", "speaker", "bluetooth"];

  if (expensiveKeywords.some((kw) => lowerText.includes(kw)) && price < 3000) {
    return true;
  }
  if (speakerKeywords.some((kw) => lowerText.includes(kw)) && price < 1000) {
    return true;
  }

  return false;
}

function normalizeProductUrl(url: string, store: string): string {
  try {
    const parsedUrl = new URL(url);
    const storeLower = store.toLowerCase();

    if (storeLower.includes("amazon")) {
      const dpMatch = parsedUrl.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
      if (dpMatch) {
        return `https://www.amazon.in/dp/${dpMatch[1]}`;
      }
      const gpMatch = parsedUrl.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      if (gpMatch) {
        return `https://www.amazon.in/dp/${gpMatch[1]}`;
      }
      parsedUrl.search = "";
      return parsedUrl.toString();
    }

    if (storeLower.includes("flipkart")) {
      const pid = parsedUrl.searchParams.get("pid");
      parsedUrl.search = "";
      if (pid) {
        parsedUrl.searchParams.set("pid", pid);
      }
      return parsedUrl.toString();
    }

    return url;
  } catch {
    return url;
  }
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

async function tryAmazonFallbackApi(url: string): Promise<number | null> {
  const fallbackUrl = process.env.AMAZON_PRICE_API_URL;
  if (!fallbackUrl) {
    return null;
  }

  try {
    const response = await fetch(`${fallbackUrl}?url=${encodeURIComponent(url)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[AMAZON FALLBACK API FAILED] HTTP status", response.status);
      return null;
    }

    const data = await response.json();
    if (data && typeof data.price === "number") {
      const price = data.price;
      if (isReasonablePrice(price)) {
        console.log(`[PRICE FOUND] AMAZON ₹${price} via external fallback API`);
        return price;
      }
    }
    
    console.warn("[AMAZON FALLBACK API FAILED] Invalid price format in JSON");
    return null;
  } catch (error) {
    console.error("[AMAZON FALLBACK API FAILED]", error instanceof Error ? error.message : error);
    return null;
  }
}

async function fetchDynamicPriceWithPuppeteer(
  url: string,
  store: string,
  selectors: string[]
): Promise<number | null> {
  console.log(`[PUPPETEER] Running on Vercel`);
  console.log(`[PUPPETEER] Scraping dynamically on Vercel: ${url}`);
  const puppeteer = await import("puppeteer-core");
  const chromiumModule = await import("@sparticuz/chromium");
  const chromium = chromiumModule.default;

  const fs = await import("node:fs");
  const path = await import("node:path");

  const chromiumBinPath = path.join(
    process.cwd(),
    "node_modules",
    "@sparticuz",
    "chromium",
    "bin"
  );

  let executablePath: string;

  if (fs.existsSync(chromiumBinPath)) {
    console.log("[PUPPETEER] Chromium bin path found:", chromiumBinPath);
    executablePath = await chromium.executablePath(chromiumBinPath);
  } else {
    console.warn("[PUPPETEER] Chromium bin path missing, trying default executablePath");
    executablePath = await chromium.executablePath();
  }

  const browser = await puppeteer.default.launch({
    args: [
      ...chromium.args,
      "--disable-http2",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
    ],
    executablePath,
    headless: true,
    defaultViewport: {
      width: 1366,
      height: 768,
    },
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(20000);
    page.setDefaultTimeout(10000);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-IN,en;q=0.9",
    });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (
        type === "image" ||
        type === "font" ||
        type === "media" ||
        type === "stylesheet"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
    } catch (gotoError) {
      console.warn("[PUPPETEER] Navigation warning, trying to read partial page:", gotoError instanceof Error ? gotoError.message : gotoError);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const bodyText = await page.evaluate(() => document.body.innerText);
    const bodyTextLower = bodyText.toLowerCase();
    const botIndicators = [
      "captcha",
      "robot",
      "automated access",
      "enter the characters",
      "sorry",
      "access denied",
      "blocked",
    ];
    if (botIndicators.some((indicator) => bodyTextLower.includes(indicator))) {
      console.warn(`[PUPPETEER] Bot/Captcha page detected for ${store}`);
      return null;
    }

    let foundPrice: number | null = null;

    // A. Store-specific selectors
    for (const selector of selectors) {
      try {
        const text = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? el.textContent : null;
        }, selector);

        if (text) {
          const price = parsePrice(text);
          if (price !== null && !isSuspiciousPriceForTitle(price, url)) {
            foundPrice = price;
            console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${price} via puppeteer selector`);
            break;
          }
        }
      } catch {}
    }

    // B. Meta tags
    if (foundPrice === null) {
      const metaSelectors = [
        'meta[itemprop="price"]',
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]',
        "meta[property='product:price:amount']",
        "meta[name='twitter:data1']",
        "meta[property='og:price:amount']"
      ];

      for (const sel of metaSelectors) {
        try {
          const content = await page.evaluate((s) => {
            const el = document.querySelector(s);
            return el ? el.getAttribute("content") : null;
          }, sel);

          if (content) {
            const price = parsePrice(content);
            if (price !== null && !isSuspiciousPriceForTitle(price, url)) {
              foundPrice = price;
              console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${price} via puppeteer meta tag`);
              break;
            }
          }
        } catch {}
      }
    }

    // C. JSON-LD scripts
    if (foundPrice === null) {
      try {
        const scriptTexts = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
          return scripts.map((s) => s.textContent || "");
        });

        const jsonLdCandidates: number[] = [];
        const addJsonLdCandidate = (text: string) => {
          if (!text) return;
          const cleaned = text.toLowerCase();
          const blacklisted = ["emi", "off", "%", "save", "discount", "exchange", "coupon"];
          if (blacklisted.some((word) => cleaned.includes(word))) return;
          const parsed = parsePrice(text);
          if (parsed !== null && !isSuspiciousPriceForTitle(parsed, url)) {
            jsonLdCandidates.push(parsed);
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
                      if (off.price) addJsonLdCandidate(String(off.price));
                    }
                  } else if (obj.offers.price) {
                    addJsonLdCandidate(String(obj.offers.price));
                  }
                }
                if (obj.price) {
                  addJsonLdCandidate(String(obj.price));
                }
                for (const key of Object.keys(obj)) {
                  searchJsonLd(obj[key]);
                }
              };
              searchJsonLd(json);
            } catch {}
          }
        }
        if (jsonLdCandidates.length > 0) {
          foundPrice = jsonLdCandidates[0];
          console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${foundPrice} via puppeteer JSON-LD`);
        }
      } catch (err) {
        console.error("[PUPPETEER] JSON-LD extraction failed:", err);
      }
    }

    // D. Next.js data script if available
    if (foundPrice === null) {
      try {
        const nextDataText = await page.evaluate(() => {
          const el = document.getElementById("__NEXT_DATA__");
          return el ? el.textContent : null;
        });
        if (nextDataText) {
          const json = JSON.parse(nextDataText);
          const nextCandidates: number[] = [];
          const searchNextData = (obj: any) => {
            if (!obj || typeof obj !== "object") return;
            if (obj.price && typeof obj.price === "number") {
              if (!isSuspiciousPriceForTitle(obj.price, url)) {
                nextCandidates.push(obj.price);
              }
            }
            if (obj.sellingPrice && typeof obj.sellingPrice === "number") {
              if (!isSuspiciousPriceForTitle(obj.sellingPrice, url)) {
                nextCandidates.push(obj.sellingPrice);
              }
            }
            for (const key of Object.keys(obj)) {
              searchNextData(obj[key]);
            }
          };
          searchNextData(json);
          if (nextCandidates.length > 0) {
            foundPrice = nextCandidates[0];
            console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${foundPrice} via puppeteer Next.js Data`);
          }
        }
      } catch {}
    }

    // E. Body rupee regex as last fallback only
    if (foundPrice === null) {
      try {
        const rupeeMatches = bodyText.match(/₹\s?[\d,]+/g);
        if (rupeeMatches) {
          const regexCandidates: number[] = [];
          for (const match of rupeeMatches) {
            const price = parsePrice(match);
            if (price !== null && !isSuspiciousPriceForTitle(price, url)) {
              regexCandidates.push(price);
            }
          }
          if (regexCandidates.length > 0) {
            regexCandidates.sort((a, b) => b - a);
            foundPrice = regexCandidates[0];
            console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${foundPrice} via puppeteer Body Regex`);
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
      if (
        type === "image" ||
        type === "font" ||
        type === "media" ||
        type === "stylesheet"
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (gotoError) {
      console.warn("[PLAYWRIGHT] Navigation warning, trying to read partial page:", gotoError instanceof Error ? gotoError.message : gotoError);
    }

    await page.waitForTimeout(5000);

    const bodyText = await page.locator("body").innerText();
    const bodyTextLower = bodyText.toLowerCase();
    const botIndicators = [
      "captcha",
      "robot",
      "automated access",
      "enter the characters",
      "sorry",
      "access denied",
      "blocked",
    ];
    if (botIndicators.some((indicator) => bodyTextLower.includes(indicator))) {
      console.warn(`[PLAYWRIGHT] Bot/Captcha page detected for ${store}`);
      await context.close();
      return null;
    }

    let foundPrice: number | null = null;

    // A. Store-specific selectors
    for (const selector of selectors) {
      try {
        const text = await page.locator(selector).first().textContent({ timeout: 2000 });
        if (text) {
          const price = parsePrice(text);
          if (price !== null && !isSuspiciousPriceForTitle(price, url)) {
            foundPrice = price;
            console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${price} via playwright selector`);
            break;
          }
        }
      } catch {}
    }

    // B. Meta tags
    if (foundPrice === null) {
      const metaSelectors = [
        'meta[itemprop="price"]',
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]',
        "meta[property='product:price:amount']",
        "meta[name='twitter:data1']",
        "meta[property='og:price:amount']"
      ];
      for (const sel of metaSelectors) {
        try {
          const content = await page.locator(sel).first().getAttribute("content", { timeout: 2000 });
          if (content) {
            const price = parsePrice(content);
            if (price !== null && !isSuspiciousPriceForTitle(price, url)) {
              foundPrice = price;
              console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${price} via playwright meta tag`);
              break;
            }
          }
        } catch {}
      }
    }

    // C. JSON-LD scripts
    if (foundPrice === null) {
      try {
        const scripts = await page.locator('script[type="application/ld+json"]').all();
        const jsonLdCandidates: number[] = [];
        const addJsonLdCandidate = (text: string) => {
          if (!text) return;
          const cleaned = text.toLowerCase();
          const blacklisted = ["emi", "off", "%", "save", "discount", "exchange", "coupon"];
          if (blacklisted.some((word) => cleaned.includes(word))) return;
          const parsed = parsePrice(text);
          if (parsed !== null && !isSuspiciousPriceForTitle(parsed, url)) {
            jsonLdCandidates.push(parsed);
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
                      if (off.price) addJsonLdCandidate(String(off.price));
                    }
                  } else if (obj.offers.price) {
                    addJsonLdCandidate(String(obj.offers.price));
                  }
                }
                if (obj.price) {
                  addJsonLdCandidate(String(obj.price));
                }
                for (const key of Object.keys(obj)) {
                  searchJsonLd(obj[key]);
                }
              };
              searchJsonLd(json);
            } catch {}
          }
        }
        if (jsonLdCandidates.length > 0) {
          foundPrice = jsonLdCandidates[0];
          console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${foundPrice} via playwright JSON-LD`);
        }
      } catch {}
    }

    // D. Next.js Data Script
    if (foundPrice === null) {
      try {
        const nextDataText = await page.locator('script#__NEXT_DATA__').first().textContent({ timeout: 2000 });
        if (nextDataText) {
          const json = JSON.parse(nextDataText);
          const nextCandidates: number[] = [];
          const searchNextData = (obj: any) => {
            if (!obj || typeof obj !== "object") return;
            if (obj.price && typeof obj.price === "number") {
              if (!isSuspiciousPriceForTitle(obj.price, url)) {
                nextCandidates.push(obj.price);
              }
            }
            if (obj.sellingPrice && typeof obj.sellingPrice === "number") {
              if (!isSuspiciousPriceForTitle(obj.sellingPrice, url)) {
                nextCandidates.push(obj.sellingPrice);
              }
            }
            for (const key of Object.keys(obj)) {
              searchNextData(obj[key]);
            }
          };
          searchNextData(json);
          if (nextCandidates.length > 0) {
            foundPrice = nextCandidates[0];
            console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${foundPrice} via playwright Next.js Data`);
          }
        }
      } catch {}
    }

    // E. Body rupee regex as last fallback only
    if (foundPrice === null) {
      try {
        const rupeeMatches = bodyText.match(/₹\s?[\d,]+/g);
        if (rupeeMatches) {
          const regexCandidates: number[] = [];
          for (const match of rupeeMatches) {
            const price = parsePrice(match);
            if (price !== null && !isSuspiciousPriceForTitle(price, url)) {
              regexCandidates.push(price);
            }
          }
          if (regexCandidates.length > 0) {
            regexCandidates.sort((a, b) => b - a);
            foundPrice = regexCandidates[0];
            console.log(`[PRICE FOUND] ${store.toUpperCase()} ₹${foundPrice} via playwright Body Regex`);
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
  }

  if (html) {
    const $ = cheerio.load(html);
    const bodyText = $.text();
    const bodyTextLower = bodyText.toLowerCase();
    const botIndicators = [
      "captcha",
      "robot",
      "automated access",
      "enter the characters",
      "sorry",
      "access denied",
      "blocked",
    ];
    if (botIndicators.some((indicator) => bodyTextLower.includes(indicator))) {
      console.warn("[PUPPETEER] Bot/Captcha page detected for Amazon");
      const fallbackResult = await tryAmazonFallbackApi(url);
      if (fallbackResult !== null) {
        return fallbackResult;
      }
      console.log(`[AMAZON BLOCKED] Bot/Captcha detected. Keeping previous price.`);
      console.log(`[PRICE NOT FOUND] AMAZON ${url}`);
      return null;
    }

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      const price = parsePrice(text);

      if (price !== null && isReasonablePrice(price) && !isSuspiciousPriceForTitle(price, url)) {
        console.log(`[PRICE FOUND] AMAZON ₹${price} via static selector`);
        return price;
      }
    }
  }

  console.log("Amazon static selectors did not find a price. Trying dynamic browser fetch...");
  const dynamicResult = await fetchDynamicPrice(url, "Amazon", selectors);
  if (dynamicResult !== null) {
    return dynamicResult;
  }

  const fallbackResult = await tryAmazonFallbackApi(url);
  if (fallbackResult !== null) {
    return fallbackResult;
  }

  console.log(`[AMAZON BLOCKED] Bot/Captcha detected. Keeping previous price.`);
  console.log(`[PRICE NOT FOUND] AMAZON ${url}`);
  return null;
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

  const metaSelectors = [
    "meta[property='product:price:amount']",
    "meta[name='twitter:data1']",
    "meta[property='og:price:amount']",
    "meta[itemprop='price']"
  ];

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      const price = parsePrice(text);
      if (isReasonablePrice(price) && isValidFlipkartPriceText(text)) {
        console.log(`[PRICE FOUND] FLIPKART ₹${price} via static selector`);
        return price;
      }
    }

    for (const sel of metaSelectors) {
      const content = $(sel).attr("content") || $(sel).attr("value");
      if (content) {
        const price = parsePrice(content);
        if (isReasonablePrice(price)) {
          console.log(`[PRICE FOUND] FLIPKART ₹${price} via static meta`);
          return price;
        }
      }
    }
  } catch (error) {
    // If static fetch fails
  }

  console.warn("FLIPKART STATIC FETCH FAILED. Trying dynamic browser fetch...");
  const dynamicResult = await fetchDynamicPrice(url, "Flipkart", selectors);
  if (dynamicResult === null) {
    console.log(`[PRICE NOT FOUND] FLIPKART ${url}`);
  }
  return dynamicResult;
}

export async function fetchProductPrice(
  url: string,
  store: string
): Promise<number | null> {
  const normalizedUrl = normalizeProductUrl(url, store);
  const normalizedStore = store.toLowerCase();

  try {
    if (normalizedStore.includes("amazon")) {
      return await fetchAmazonPrice(normalizedUrl);
    }

    if (normalizedStore.includes("flipkart")) {
      return await fetchFlipkartPrice(normalizedUrl);
    }

    return null;
  } catch (error) {
    console.error("PRICE FETCH ERROR:", error);
    return null;
  }
}