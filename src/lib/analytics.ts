/** GA4 Measurement ID; override with NEXT_PUBLIC_GA_MEASUREMENT_ID on Vercel if needed. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-0LZKPYVL1Q";

export type GtagCommand = "config" | "event" | "js" | "set";

export type Gtag = (
  command: GtagCommand,
  ...args: unknown[]
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}
