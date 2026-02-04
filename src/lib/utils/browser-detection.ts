/**
 * Detects if the current browser is an in-app browser (WebView)
 * These browsers are blocked by Google OAuth due to security policies
 */
export function isInAppBrowser(): { isInApp: boolean; appName: string | null } {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { isInApp: false, appName: null };
  }

  const ua = navigator.userAgent || (navigator as any).vendor || "";

  const inAppBrowsers = [
    { pattern: /FBAN|FBAV/i, name: "Facebook" },
    { pattern: /Instagram/i, name: "Instagram" },
    { pattern: /Messenger/i, name: "Messenger" },
    { pattern: /Twitter/i, name: "Twitter/X" },
    { pattern: /TikTok/i, name: "TikTok" },
    { pattern: /LinkedInApp/i, name: "LinkedIn" },
    { pattern: /MicroMessenger/i, name: "WeChat" },
    { pattern: /Line\//i, name: "Line" },
    { pattern: /Pinterest/i, name: "Pinterest" },
    { pattern: /Snapchat/i, name: "Snapchat" },
    { pattern: /Reddit/i, name: "Reddit" },
    { pattern: /Slack/i, name: "Slack" },
    { pattern: /WhatsApp/i, name: "WhatsApp" },
    { pattern: /Telegram/i, name: "Telegram" },
  ];

  for (const browser of inAppBrowsers) {
    if (browser.pattern.test(ua)) {
      return { isInApp: true, appName: browser.name };
    }
  }

  return { isInApp: false, appName: null };
}
