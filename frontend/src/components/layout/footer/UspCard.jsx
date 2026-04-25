import { cn } from "@/lib/utils";

export default function UspCard({ icon: UspIcon, title, children }) {
  return (
    <div
      className={cn(
        "group flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-md",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          "bg-gradient-to-br from-amber-50 to-amber-100/60 text-yellow-700",
          "ring-1 ring-amber-200/50 shadow-inner",
        )}
      >
        <UspIcon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          {title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 text-balance">
          {children}
        </p>
      </div>
    </div>
  );
}
