export function detectStore(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

    if (hostname.includes("amazon.")) return "Amazon";
    if (hostname.includes("flipkart.")) return "Flipkart";
    if (hostname.includes("myntra.")) return "Myntra";
    if (hostname.includes("ajio.")) return "Ajio";
    if (hostname.includes("croma.")) return "Croma";

    return "Unknown";
  } catch {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes("amazon.")) return "Amazon";
    if (lowerUrl.includes("flipkart.")) return "Flipkart";
    if (lowerUrl.includes("myntra.")) return "Myntra";
    if (lowerUrl.includes("ajio.")) return "Ajio";
    if (lowerUrl.includes("croma.")) return "Croma";

    return "Unknown";
  }
}

function cleanText(value: string): string {
  return value
    .replace(/%20/g, " ")
    .replace(/[+]/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function generateTitleFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    const pathnameParts = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part));

    const ignoredParts = new Set([
      "dp",
      "p",
      "product",
      "products",
      "gp",
      "aw",
      "s",
      "search",
      "shop",
      "ref",
    ]);

    for (const part of pathnameParts) {
      const lower = part.toLowerCase();

      if (ignoredParts.has(lower)) continue;
      if (/^[A-Z0-9]{8,}$/i.test(part)) continue;
      if (part.length < 4) continue;
      if (!/[a-zA-Z]/.test(part)) continue;

      const cleaned = titleCase(cleanText(part));
      if (cleaned.length > 2) return cleaned;
    }

    const possibleQueryKeys = ["k", "q", "query", "search", "keyword"];
    for (const key of possibleQueryKeys) {
      const value = parsedUrl.searchParams.get(key);
      if (value) {
        const cleaned = titleCase(cleanText(decodeURIComponent(value)));
        if (cleaned.length > 2) return cleaned;
      }
    }

    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    return titleCase(`${hostname} Product`);
  } catch {
    return "Sample Product";
  }
}