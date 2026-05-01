const ROW_KEYS = ["a", "b", "c", "d"];

export default function NotificationListSkeleton() {
  return (
    <div className="space-y-2 px-2 py-3">
      {ROW_KEYS.map((k) => (
        <div
          key={k}
          className="flex gap-3 rounded-xl border border-amber-100/60 bg-gradient-to-r from-muted/30 to-transparent p-2.5"
        >
          <div className="size-11 shrink-0 animate-pulse rounded-xl bg-amber-100/60" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
            <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted/80" />
            <div className="h-2 w-1/3 animate-pulse rounded-full bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
