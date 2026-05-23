type AiPlanTipsProps = {
  tips: string[];
};

export function AiPlanTips({ tips }: AiPlanTipsProps) {
  return (
    <ul className="space-y-2">
      {tips.map((tip) => (
        <li
          key={tip}
          className="flex gap-3 rounded-xl border border-violet-400/15 bg-gradient-to-r from-violet-500/[0.08] to-transparent px-4 py-3 text-sm leading-relaxed text-violet-50/95"
        >
          <span className="mt-0.5 shrink-0 text-violet-400" aria-hidden>
            ✦
          </span>
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  );
}
