type HelpStepIconProps = {
  name:
    | "plan"
    | "discover"
    | "offer"
    | "approve"
    | "invite"
    | "qr"
    | "verified"
    | "ai"
    | "reservation";
  className?: string;
};

export function HelpStepIcon({ name, className = "h-6 w-6" }: HelpStepIconProps) {
  const cls = `${className} text-violet-200`;
  switch (name) {
    case "plan":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeWidth="1.6" strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
    case "discover":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <circle cx="11" cy="11" r="7" strokeWidth="1.6" />
          <path strokeWidth="1.6" strokeLinecap="round" d="M20 20l-3-3" />
        </svg>
      );
    case "offer":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeWidth="1.6" strokeLinecap="round" d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
        </svg>
      );
    case "approve":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
        </svg>
      );
    case "invite":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeWidth="1.6" strokeLinecap="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3" strokeWidth="1.6" />
          <path strokeWidth="1.6" strokeLinecap="round" d="M19 8v6M22 11h-6" />
        </svg>
      );
    case "qr":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <rect x="4" y="4" width="6" height="6" strokeWidth="1.6" rx="1" />
          <rect x="14" y="4" width="6" height="6" strokeWidth="1.6" rx="1" />
          <rect x="4" y="14" width="6" height="6" strokeWidth="1.6" rx="1" />
          <path strokeWidth="1.6" d="M14 14h2v2h-2zM18 14h2v6h-2zM14 18h2v2h-2z" />
        </svg>
      );
    case "verified":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeWidth="1.6" strokeLinecap="round" d="M12 3l7 3v6c0 4-3 7-7 9-3-2-7-9-7-9V6l7-3z" />
          <path strokeWidth="1.6" strokeLinecap="round" d="M9 12l2 2 4-4" />
        </svg>
      );
    case "ai":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path strokeWidth="1.6" strokeLinecap="round" d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
          <path strokeWidth="1.6" strokeLinecap="round" d="M6 21v-2a6 6 0 0 1 12 0v2" />
          <path strokeWidth="1.6" strokeLinecap="round" d="M4 8h2M18 8h2M7 4l1 1M16 4l-1 1" />
        </svg>
      );
    case "reservation":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.6" />
          <path strokeWidth="1.6" strokeLinecap="round" d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    default:
      return null;
  }
}
