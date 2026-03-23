/**
 * Lightweight user-agent parser — no extra npm packages needed.
 * Returns device type, browser, and OS.
 */
export function parseUserAgent(ua: string): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!ua) return { deviceType: "unknown", browser: "unknown", os: "unknown" };

  const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua);
  const isTablet = /tablet|ipad|playbook|silk/i.test(ua);
  const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  // Browser
  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/msie|trident/i.test(ua)) browser = "IE";

  // OS
  let os = "Other";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/chromeos/i.test(ua)) os = "ChromeOS";

  return { deviceType, browser, os };
}
