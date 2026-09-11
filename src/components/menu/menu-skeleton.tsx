/** Esqueleto do cardápio, exibido enquanto os produtos são carregados. */
export function MenuSkeleton() {
  return (
    <div aria-hidden className="pt-6">
      <div className="mb-10 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-10 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="skeleton aspect-[4/3] w-full rounded-[var(--card-radius)]" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
