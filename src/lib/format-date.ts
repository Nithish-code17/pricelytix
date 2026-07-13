export function formatISTDateTime(date: Date | string | null | undefined): string {
  if (!date) return "Never";

  const d = new Date(date);
  // Ensure the date is valid
  if (isNaN(d.getTime())) return "Never";

  // Use "en-US" style for month abbreviation or construct it cleanly
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  // en-US formats like: "Jul 13, 10:33 AM"
  return `${formatted} IST`;
}

export function formatISTTime(date: Date | string | null | undefined): string {
  if (!date) return "Never";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "Never";

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${formatted} IST`;
}
