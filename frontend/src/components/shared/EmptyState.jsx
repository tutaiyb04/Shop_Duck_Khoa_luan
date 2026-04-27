export default function EmptyState({ message }) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-white/80 py-16 text-center text-muted-foreground">
        {message}
      </div>
    );
  }
  