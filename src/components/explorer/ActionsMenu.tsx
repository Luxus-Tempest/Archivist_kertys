import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

export type ActionMenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger';
  dividerBefore?: boolean;
};

export const DOCUMENT_ACTION_ITEMS: ActionMenuItem[] = [
  { id: 'open', label: 'Open', icon: <LaunchRoundedIcon sx={{ fontSize: 14 }} /> },
  { id: 'rename', label: 'Rename', icon: <EditRoundedIcon sx={{ fontSize: 14 }} /> },
  { id: 'share', label: 'Share', icon: <ShareRoundedIcon sx={{ fontSize: 14 }} /> },
  { id: 'pin', label: 'Pin', icon: <PushPinRoundedIcon sx={{ fontSize: 14 }} /> },
  { id: 'fav', label: 'Add to favorites', icon: <StarRoundedIcon sx={{ fontSize: 14 }} /> },
  { id: 'download', label: 'Download', icon: <DownloadRoundedIcon sx={{ fontSize: 14 }} />, dividerBefore: true },
  { id: 'delete', label: 'Delete', icon: <DeleteRoundedIcon sx={{ fontSize: 14 }} />, dividerBefore: true, variant: 'danger' },
];

type ActionsMenuProps = {
  x: number;
  y: number;
  items?: ActionMenuItem[];
  onAction: (actionId: string) => void;
};

export function ActionsMenu({ x, y, items = DOCUMENT_ACTION_ITEMS, onAction }: ActionsMenuProps) {
  return (
    <div
      className="fixed bg-white border border-slate-200 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[100] min-w-[150px] p-1"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <div key={item.id}>
          {item.dividerBefore && <div className="h-px bg-slate-200 my-1" />}
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[12.5px] cursor-pointer transition-colors ${
              item.variant === 'danger'
                ? 'text-red-500 hover:bg-red-50'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => onAction(item.id)}
          >
            {item.icon}
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function computeMenuPosition(
  clientX: number,
  clientY: number,
  menuWidth = 180,
  menuHeight = 300,
) {
  let x = clientX;
  let y = clientY;

  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 12;
  }
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 12;
  }

  return {
    x: Math.max(12, x),
    y: Math.max(12, y),
  };
}
