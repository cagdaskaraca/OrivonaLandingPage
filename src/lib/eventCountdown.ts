export type EventCountdownInfo = {
  daysRemaining: number | null;
  countdownText: string;
  isPast: boolean;
};

export function getEventCountdown(eventDate?: string | null): EventCountdownInfo {
  if (!eventDate?.trim()) {
    return {
      daysRemaining: null,
      countdownText: "Tarih belirtilmedi",
      isPast: false,
    };
  }

  const target = new Date(eventDate);
  if (Number.isNaN(target.getTime())) {
    return {
      daysRemaining: null,
      countdownText: "Tarih belirtilmedi",
      isPast: false,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      daysRemaining: days,
      countdownText: "Etkinlik tamamlandı",
      isPast: true,
    };
  }

  if (days === 0) {
    return {
      daysRemaining: 0,
      countdownText: "Etkinlik bugün",
      isPast: false,
    };
  }

  return {
    daysRemaining: days,
    countdownText: `Etkinliğe ${days} gün kaldı`,
    isPast: false,
  };
}
