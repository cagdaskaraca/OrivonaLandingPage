import { getEventCountdown } from "@/src/lib/eventCountdown";

type EventPlanCountdownProps = {
  eventDate?: string | null;
  className?: string;
};

export function EventPlanCountdown({ eventDate, className = "" }: EventPlanCountdownProps) {
  const { countdownText, isPast } = getEventCountdown(eventDate);

  return (
    <p
      className={`text-xs font-medium ${
        isPast ? "text-zinc-500" : "text-violet-300/90"
      } ${className}`.trim()}
    >
      {countdownText}
    </p>
  );
}
