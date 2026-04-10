import { DashboardLayoutNew } from '../components/layout/DashboardLayoutNew';
import { MetricsPulse } from '../components/history/MetricsPulse';
import { ActivitiesTable } from '../components/history/ActivitiesTable';

export function HistoryNew() {
  return (
    <DashboardLayoutNew>
      <div className="max-w-7xl mx-auto pt-4">
        {/* Search Bar Section */}
        <div className="mb-12">
          <div className="relative max-w-2xl group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest rounded-full border-none shadow-sm ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary/50 transition-all text-sm placeholder:text-outline-variant outline-none" 
              placeholder="Search across all historical activities..." 
              type="text"
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <MetricsPulse />

        {/* Activities Table */}
        <ActivitiesTable />
      </div>
    </DashboardLayoutNew>
  );
}
