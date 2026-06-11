import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

type ClassItem = {
  id: number | string;
  name: string;
  technicalName: string;
  totalRecords: number;
};

type CollectionsProps = {
  rootParam: string;
  classParam: string;
  classes: { data: ClassItem[]; isLoading: boolean };
  isDeptCollapsed: boolean;
  onToggleDeptCollapsed: () => void;
  onNavigate: (id: string) => void;
};

export function Collections({
  rootParam,
  classParam,
  classes,
  isDeptCollapsed,
  onToggleDeptCollapsed,
  onNavigate,
}: CollectionsProps) {
  const navItemClass = (id: string) =>
    `flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] cursor-pointer transition-colors select-none ${
      rootParam === id
        ? 'bg-blue-thin text-blue-dark font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
    }`;

  const subItemClass = (id: string) =>
    `flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors select-none ${
      classParam === id
        ? 'text-blue-dark font-semibold'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`;

  return (
    <aside className="w-[240px] min-w-[240px] border-r border-slate-200 flex flex-col bg-slate-50 overflow-y-auto [scrollbar-width:thin]">
      <div className="p-2">
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-2 py-2">
          Documents
        </div>
        <div onClick={() => onNavigate('all')} className={navItemClass('all')}>
          <GridViewRoundedIcon sx={{ fontSize: 16 }} /> All
        </div>
        <div onClick={() => onNavigate('my')} className={navItemClass('my')}>
          <FolderRoundedIcon sx={{ fontSize: 16 }} /> My Files
        </div>
      </div>

      <div className="h-px bg-slate-200 mx-2 my-1" />

      <div className="p-2">
        <div
          className="flex items-center justify-between px-2 py-2 cursor-pointer select-none group"
          onClick={onToggleDeptCollapsed}
        >
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
            By Class
          </span>
          <KeyboardArrowRightRoundedIcon
            sx={{ fontSize: 14 }}
            className={`text-slate-400 transition-transform duration-200 ${!isDeptCollapsed ? 'rotate-90' : ''}`}
          />
        </div>
        <div
          className={`pl-2 border-l-2 border-slate-200 ml-5 mr-2 overflow-hidden transition-all duration-200 ${
            isDeptCollapsed ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100'
          }`}
        >
          {classes.isLoading ? (
            <div className="text-xs text-slate-400 p-2">Chargement...</div>
          ) : (
            classes.data.map((cls) => (
              <div
                key={cls.id}
                onClick={() => onNavigate(cls.technicalName)}
                className={subItemClass(cls.technicalName)}
              >
                <FolderRoundedIcon className="text-blue-500" sx={{ fontSize: 14 }} />
                <span className="truncate">{cls.name}</span>
                <span className="ml-auto bg-blue-thin text-blue-dark text-[9px] px-1.5 rounded font-bold leading-none py-0.5">
                  {cls.totalRecords}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
