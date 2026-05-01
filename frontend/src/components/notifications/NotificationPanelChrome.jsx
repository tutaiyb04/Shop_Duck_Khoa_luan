import { Bell } from "lucide-react";

export default function NotificationPanelChrome({ title, subtitle, actions }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-amber-50/90 to-background px-3 pb-3 pt-3">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 size-32 rounded-full bg-amber-200/35 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full bg-amber-400/15 blur-3xl"
      />
      <div className="relative flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
          <Bell className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="text-sm font-bold tracking-tight !text-amber-950">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xxs leading-snug text-amber-900/70">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
