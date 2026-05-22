import { skeletonClass } from "@/src/lib/ui";

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${skeletonClass} h-72`} />
      ))}
    </div>
  );
}
