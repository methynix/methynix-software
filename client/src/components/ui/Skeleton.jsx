// Placeholder shapes shown while content loads. Each preset mirrors the layout
// it stands in for, so the page does not jump when the real content arrives.

export const Skeleton = ({ className = "", style }) => <div aria-hidden="true" style={style} className={`skeleton rounded-md ${className}`} />;

// Wraps a skeleton so screen readers hear one "Loading" instead of empty boxes.
const Busy = ({ label = "Loading", className = "", children }) => (
  <div role="status" aria-live="polite" aria-busy="true" className={className}>
    <span className="sr-only">{label}…</span>
    {children}
  </div>
);

const Lines = ({ count = 3, last = "w-2/3" }) => (
  <div className="space-y-2">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={`h-3 ${i === count - 1 ? last : "w-full"}`} />
    ))}
  </div>
);

const SkHeader = ({ actions = 1 }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div className="space-y-2.5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-3.5 w-72 max-w-[70vw]" />
    </div>
    <div className="flex gap-2">
      {Array.from({ length: actions }, (_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-lg" />
      ))}
    </div>
  </div>
);

const SkStat = () => (
  <div className="rounded-2xl border border-line bg-surface p-4 md:p-5 space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-7 w-32" />
    <Skeleton className="h-2.5 w-20" />
  </div>
);

const SkCard = ({ className = "", children, title = true }) => (
  <div className={`rounded-2xl border border-line bg-surface ${className}`}>
    {title ? (
      <div className="px-5 pt-4 pb-3 border-b border-line">
        <Skeleton className="h-4 w-36" />
      </div>
    ) : null}
    <div className="p-5">{children}</div>
  </div>
);

const SkRows = ({ rows = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
        <Skeleton className="h-3.5 w-20" />
      </div>
    ))}
  </div>
);

const SkChart = () => (
  <div>
    <div className="h-48 flex items-end gap-[2px] border-b border-line">
      {[35, 55, 25, 70, 45, 60, 30, 80, 50, 65, 40, 75].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-b-none rounded-t-[4px]" style={{ height: `${h}%` }} />
      ))}
    </div>
    <Skeleton className="h-2.5 w-48 mt-4" />
  </div>
);

export const SkeletonTable = ({ rows = 6, cols = 5 }) => (
  <div className="rounded-2xl border border-line bg-surface overflow-hidden">
    <div className="flex gap-6 px-5 py-3.5 border-b border-line">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} className="flex gap-6 px-5 py-4 border-b border-line last:border-b-0">
        {Array.from({ length: cols }, (_, c) => (
          <Skeleton key={c} className={`h-3.5 flex-1 ${c === 0 ? "max-w-[30%]" : ""}`} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCardGrid = ({ count = 6, className = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" }) => (
  <div className={`grid gap-4 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="rounded-2xl border border-line bg-surface p-5 space-y-4">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Lines count={3} />
        <Skeleton className="h-3 w-28" />
      </div>
    ))}
  </div>
);

// ------------------------------------------------------------- page presets

export const SkeletonOverview = () => (
  <Busy label="Loading overview">
    <SkHeader actions={2} />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }, (_, i) => <SkStat key={i} />)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
      <SkCard className="xl:col-span-2"><SkChart /></SkCard>
      <SkCard><SkRows rows={5} /></SkCard>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
      <SkCard>
        <div className="space-y-3">
          {[90, 70, 55, 40, 30, 20].map((w, i) => (
            <div key={i} className="grid grid-cols-[110px_1fr_28px] items-center gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 rounded-full" style={{ width: `${w}%` }} />
              <Skeleton className="h-3 w-5 justify-self-end" />
            </div>
          ))}
        </div>
      </SkCard>
      <SkCard><SkRows rows={5} /></SkCard>
    </div>
  </Busy>
);

export const SkeletonBoard = () => (
  <Busy label="Loading clients">
    <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 overflow-hidden pb-3">
      {[3, 2, 2, 1, 2].map((n, col) => (
        <div key={col} className="rounded-2xl bg-surface/40 border border-line p-3 min-h-[200px]">
          <div className="flex justify-between px-1 mb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-4" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-3.5 space-y-2.5">
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-2.5 w-1/2" />
                <Skeleton className="h-1.5 w-full rounded-full mt-3" />
                <Skeleton className="h-2.5 w-2/5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Busy>
);

export const SkeletonClientDetail = () => (
  <Busy label="Loading project">
    <Skeleton className="h-3.5 w-16 mb-4" />
    <SkHeader actions={3} />
    <div className="rounded-2xl border border-line bg-surface p-5 mb-4">
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} className="flex-1 space-y-1.5">
            <Skeleton className="h-1.5 rounded-full" />
            <Skeleton className="h-2 w-3/4" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-3 mt-6">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-3.5 w-80 max-w-[70vw]" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        <SkCard><SkRows rows={3} /></SkCard>
        <SkCard><SkRows rows={2} /></SkCard>
        <SkCard><SkRows rows={2} /></SkCard>
      </div>
      <div className="space-y-4">
        <SkCard><SkRows rows={4} /></SkCard>
        <SkCard><Lines count={5} /></SkCard>
      </div>
    </div>
  </Busy>
);

export const SkeletonFinance = () => (
  <Busy label="Loading finance">
    <SkHeader />
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: 5 }, (_, i) => <SkStat key={i} />)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
      <SkCard className="xl:col-span-2"><SkChart /></SkCard>
      <SkCard>
        <Skeleton className="h-7 w-40" />
        <div className="mt-4"><Lines count={3} /></div>
      </SkCard>
    </div>
    <div className="mt-4"><SkeletonTable rows={4} cols={5} /></div>
    <div className="mt-4"><SkeletonTable rows={6} cols={6} /></div>
  </Busy>
);

export const SkeletonProjects = () => (
  <Busy label="Loading projects">
    <SkHeader />
    <Skeleton className="h-11 w-96 max-w-full rounded-xl mb-3" />
    <Skeleton className="h-3.5 w-64 mb-5" />
    <SkeletonCardGrid count={6} />
  </Busy>
);

export const SkeletonInfrastructure = () => (
  <Busy label="Loading infrastructure">
    <SkHeader />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-4">
      {Array.from({ length: 4 }, (_, i) => <SkStat key={i} />)}
    </div>
    <div className="flex gap-1 mb-4">
      {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-7 w-20 rounded-lg" />)}
    </div>
    <SkeletonTable rows={6} cols={6} />
  </Busy>
);

export const SkeletonNotes = () => (
  <Busy label="Loading notes">
    <SkHeader />
    <Skeleton className="h-9 w-72 max-w-full rounded-lg mb-5" />
    <div className="columns-1 md:columns-2 xl:columns-3 gap-4 [&>*]:mb-4">
      {[4, 2, 6, 3, 5, 2].map((n, i) => (
        <div key={i} className="break-inside-avoid rounded-2xl border border-line bg-surface p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Lines count={n} />
          <Skeleton className="h-2.5 w-20" />
        </div>
      ))}
    </div>
  </Busy>
);

// Generic page while a lazy route chunk downloads.
export const SkeletonPage = () => (
  <Busy>
    <SkHeader />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 4 }, (_, i) => <SkStat key={i} />)}
    </div>
    <div className="mt-4"><SkeletonTable rows={5} cols={4} /></div>
  </Busy>
);

// Document editor while the PDF tooling loads.
export const SkeletonEditor = () => (
  <Busy label="Loading editor" className="space-y-6">
    <div className="flex flex-wrap justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3.5 w-28" />
      </div>
      <Skeleton className="h-8 w-56 rounded-lg" />
    </div>
    {Array.from({ length: 3 }, (_, s) => (
      <div key={s} className="space-y-3 pt-5 border-t border-line first:border-t-0 first:pt-0">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </Busy>
);

// Whole dashboard frame (sidebar + content) while the admin bundle loads.
export const SkeletonDashboardShell = () => (
  <div className="min-h-screen bg-ink lg:flex">
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen border-r border-line bg-surface/60 p-4 gap-6">
      <div className="flex items-center gap-2.5 px-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
      <div className="space-y-2 px-1">
        {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
      </div>
    </aside>
    <div className="lg:hidden h-14 border-b border-line flex items-center px-4">
      <Skeleton className="h-8 w-32" />
    </div>
    <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-[1400px] mx-auto">
        <SkeletonOverview />
      </div>
    </main>
  </div>
);

// ------------------------------------------------------------- public site

export const SkeletonWorkGrid = ({ count = 6 }) => (
  <Busy label="Loading work" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="rounded-xl overflow-hidden border border-line bg-surface">
        <Skeleton className="aspect-[16/10] rounded-none" />
        <div className="p-5 space-y-2.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    ))}
  </Busy>
);

export const SkeletonPosts = ({ count = 3 }) => (
  <Busy label="Loading updates" className="space-y-12">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 border-b border-line pb-12">
        <div className="md:col-span-3 space-y-2">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="md:col-span-9 space-y-3">
          <Skeleton className="h-7 w-2/3" />
          <Lines count={3} last="w-1/2" />
        </div>
      </div>
    ))}
  </Busy>
);
