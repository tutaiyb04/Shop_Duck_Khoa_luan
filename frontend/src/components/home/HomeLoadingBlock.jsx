export default function HomeLoadingBlock({ message = "Đang tải…" }) {
  return (
    <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
      {message}
    </div>
  );
}
