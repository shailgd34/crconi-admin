export default function SidebarWidget() {
  return (
    <div
      className="mx-auto mb-10 w-full max-w-60 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-5 text-center dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white text-theme-sm">
        Croconi Digital Admin
      </h3>
      <p className="mb-4 text-gray-500 text-theme-xs dark:text-gray-400">
        Enterprise edition with full analytics access, custom charts, and responsive controls.
      </p>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        System Active
      </div>
    </div>
  );
}
