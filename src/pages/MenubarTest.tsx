import { 
  Menubar, 
  MenuRoot, 
  MenuTrigger, 
  MenuPortal, 
  MenuPositioner, 
  MenuPopup, 
  MenuItem, 
  MenuSeparator, 
  MenuSubmenuRoot, 
  MenuSubmenuTrigger, 
  MenuGroup, 
  MenuGroupLabel 
} from '../components/Menubar';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export default function GroupLabelMenubarTest() {
  return (
    <div className="p-20 bg-slate-50 min-h-screen flex flex-col gap-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Menubar Light Theme</h2>
      <Menubar variant="light">
        <MenuRoot>
          <MenuTrigger>App</MenuTrigger>
          <MenuPortal>
            <MenuPositioner sideOffset={4}>
              <MenuPopup>
                <MenuGroup>
                  <MenuGroupLabel>General</MenuGroupLabel>
                  <MenuItem icon={<InfoIcon className="!text-[18px]" />}>About</MenuItem>
                  <MenuItem icon={<SettingsIcon className="!text-[18px]" />}>
                    Settings...
                  </MenuItem>
                </MenuGroup>
                <MenuSeparator />
                <MenuSubmenuRoot>
                  <MenuSubmenuTrigger icon={<BuildIcon className="!text-[18px]" />}>
                    Services
                  </MenuSubmenuTrigger>
                  <MenuPortal>
                    <MenuPositioner>
                      <MenuPopup>
                        <MenuGroup>
                          <MenuGroupLabel>Development</MenuGroupLabel>
                          <MenuItem icon={<MonitorHeartIcon className="!text-[18px]" />}>
                            Activity Monitor
                          </MenuItem>
                          <MenuItem icon={<TimelineIcon className="!text-[18px]" />}>
                            System Trace
                          </MenuItem>
                          <MenuItem icon={<InsertDriveFileIcon className="!text-[18px]" />}>
                            File Activity
                          </MenuItem>
                        </MenuGroup>
                        <MenuSeparator />
                        <MenuGroup>
                          <MenuGroupLabel>Shortcuts</MenuGroupLabel>
                          <MenuItem icon={<ToggleOnIcon className="!text-[18px]" />}>
                            Toggle Gate
                          </MenuItem>
                          <MenuItem icon={<TuneIcon className="!text-[18px]" />}>
                            Services Settings...
                          </MenuItem>
                        </MenuGroup>
                      </MenuPopup>
                    </MenuPositioner>
                  </MenuPortal>
                </MenuSubmenuRoot>
                <MenuSeparator />
                <MenuGroup>
                  <MenuGroupLabel>Window</MenuGroupLabel>
                  <MenuItem icon={<VisibilityOffIcon className="!text-[18px]" />}>
                    Hide App
                  </MenuItem>
                  <MenuItem icon={<VisibilityOffIcon className="!text-[18px]" />}>
                    Hide Others
                  </MenuItem>
                  <MenuItem icon={<VisibilityIcon className="!text-[18px]" />}>
                    Show All
                  </MenuItem>
                </MenuGroup>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>

        <MenuRoot>
          <MenuTrigger>Edit</MenuTrigger>
          <MenuPortal>
            <MenuPositioner sideOffset={4}>
              <MenuPopup>
                <MenuGroup>
                  <MenuGroupLabel>History</MenuGroupLabel>
                  <MenuItem icon={<UndoIcon className="!text-[18px]" />}>Undo</MenuItem>
                  <MenuItem icon={<RedoIcon className="!text-[18px]" />}>Redo</MenuItem>
                </MenuGroup>
                <MenuSeparator />
                <MenuGroup>
                  <MenuGroupLabel>Clipboard</MenuGroupLabel>
                  <MenuItem icon={<ContentCutIcon className="!text-[18px]" />}>Cut</MenuItem>
                  <MenuItem icon={<ContentCopyIcon className="!text-[18px]" />}>Copy</MenuItem>
                  <MenuItem icon={<ContentPasteIcon className="!text-[18px]" />}>
                    Paste
                  </MenuItem>
                </MenuGroup>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>
      </Menubar>

      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Menubar Dark Theme</h2>
      <Menubar variant="dark">
        <MenuRoot>
          <MenuTrigger className="text-white hover:bg-white/10">System</MenuTrigger>
          <MenuPortal>
            <MenuPositioner sideOffset={4}>
              <MenuPopup>
                <MenuGroup>
                  <MenuGroupLabel>Security</MenuGroupLabel>
                  <MenuItem icon={<InfoIcon className="!text-[18px]" />}>Security Stats</MenuItem>
                  <MenuItem icon={<SettingsIcon className="!text-[18px]" />}>
                    Vault Config...
                  </MenuItem>
                </MenuGroup>
                <MenuSeparator />
                <MenuSubmenuRoot>
                  <MenuSubmenuTrigger icon={<BuildIcon className="!text-[18px]" />}>
                    Advanced
                  </MenuSubmenuTrigger>
                  <MenuPortal>
                    <MenuPositioner>
                      <MenuPopup>
                         <MenuItem>Debug Console</MenuItem>
                         <MenuItem>Network Logs</MenuItem>
                      </MenuPopup>
                    </MenuPositioner>
                  </MenuPortal>
                </MenuSubmenuRoot>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>
      </Menubar>
    </div>
  );
}
