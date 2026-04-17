const Loader = () => {
  return (
    <div className="flex items-center gap-2 text-[var(--text-muted)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
      <span className="text-sm">Loading...</span>
    </div>
  );
};

export default Loader;
