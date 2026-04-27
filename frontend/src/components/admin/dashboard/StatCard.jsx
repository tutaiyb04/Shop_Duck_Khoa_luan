import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const toneStyles = {
    slate: {
      icon: "border border-indigo-100/90 bg-indigo-50/90 text-indigo-700",
      chevron: "group-hover:text-indigo-600",
    },
    amber: {
      icon: "border border-amber-100/90 bg-amber-50/95 text-amber-800",
      chevron: "group-hover:text-amber-600",
    },
    red: {
      icon: "border border-rose-100/90 bg-rose-50/95 text-rose-700",
      chevron: "group-hover:text-rose-600",
    },
};

function StatCard({
    to,
    icon: Icon,
    title,
    value,
    subtitle,
    footnote,
    tone = "slate",
}) {
    const t = toneStyles[tone] ?? toneStyles.slate;

    return (
      <NavLink
        to={to}
        className={cn(
          "group block h-full rounded-xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50/80",
        )}
      >
        <Card
          className={cn(
            "h-full gap-0 !border-slate-200/85 bg-white py-0 shadow-sm !transition-all duration-200",
            "hover:border-slate-300/90 hover:shadow-md",
          )}
        >
          <CardHeader className="border-b border-slate-100/90 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={cn(
                    "shrink-0 rounded-lg p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]",
                    t.icon,
                  )}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <CardTitle className="text-left text-sm font-semibold leading-snug text-slate-800 sm:text-base">
                  {title}
                </CardTitle>
              </div>
              <ChevronRight
                className={cn(
                  "h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5",
                  t.chevron,
                )}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm leading-relaxed text-slate-600">{subtitle}</p>
            )}
            {footnote && (
              <p className="text-xs leading-relaxed text-slate-500">{footnote}</p>
            )}
          </CardContent>
        </Card>
      </NavLink>
    );
}

export default StatCard;