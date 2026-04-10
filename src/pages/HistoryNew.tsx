import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';

export function HistoryNew() {
  return (
    <DashboardLayoutNew>
      <section className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Archive & Library</h2>
        <p className="text-on-surface-variant font-body max-w-2xl leading-relaxed">
          Access your GED. Every document will be secured, classified and inserted into M-Files.
        </p>
      </section>

      <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 p-16 flex flex-col items-center justify-center text-center shadow-editorial min-h-[400px]">
        <div className="w-16 h-16 bg-primary-container/30 rounded-3xl flex items-center justify-center mb-6 text-primary scale-110">
          <span className="material-symbols-outlined text-3xl">inventory_2</span>
        </div>
        <h3 className="text-2xl font-bold mb-2 font-headline text-on-surface">Your library is empty</h3>
        <p className="text-on-surface-variant font-body max-w-xs mb-8">
          Once you process documents in the ingest section, they will appear here in your secure archive.
        </p>
        <button className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm hover:bg-primary-dim transition-all shadow-lg shadow-primary/10">
          Start Ingesting
        </button>
      </div>
    </DashboardLayoutNew>
  );
}
