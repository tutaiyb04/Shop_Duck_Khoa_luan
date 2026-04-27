import { cn } from "@/lib/utils";

export default function LoadingBlock({ message = "Đang tải…", className }) {
  return (
    <div
      className={cn(
        "py-16 text-center text-sm text-muted-foreground animate-pulse",
        className,
      )}
    >
      {message}
    </div>
  );
}
