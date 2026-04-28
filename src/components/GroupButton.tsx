import React, { useRef, useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

interface GroupButtonOption {
  label: string;
  value: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface GroupButtonProps {
  options: GroupButtonOption[];
  defaultIndex?: number;
  onMainClick?: (option: GroupButtonOption) => void;
  variant?: 'solid' | 'outline' | 'ghost' | 'lightSolid';
  className?: string;
}

export function GroupButton({
  options,
  defaultIndex = 0,
  onMainClick,
  variant = 'solid',
  className = '',
}: GroupButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const anchorRef = useRef<HTMLDivElement>(null);

  const baseStyles =
    'py-2 cursor-pointer px-4 h-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed';

  const variants = {
    solid:
      'bg-linear-to-r from-primary to-primary-dim text-on-primary hover:shadow-lg hover:shadow-primary/20',
    lightSolid:
      'bg-surface-container-highest text-on-surface font-bold text-sm hover:bg-surface-container-high',
    outline:
      'bg-transparent border border-outline-variant/30 text-on-surface hover:bg-surface-container-low',
    ghost:
      'bg-transparent text-primary hover:underline text-xs font-medium',
  };

  const sharedStyle = `${baseStyles} ${variants[variant]}`;

  const handleClick = () => {
    const selected = options[selectedIndex];
    if (onMainClick) {
      onMainClick(selected);
    } else {
      selected?.onClick?.();
    }
  };

  const handleMenuItemClick = (index: number) => {
    setSelectedIndex(index);
    setOpen(false);
    options[index]?.onClick?.();
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <div
        ref={anchorRef}
        className={`relative inline-flex rounded-xl overflow-hidden ${className}`}
      >
        <button
          onClick={handleClick}
          className={`${sharedStyle} rounded-l-xl text-sm`}
        >
          {options[selectedIndex]?.label}
        </button>

        <button
          onClick={handleToggle}
          className={`${sharedStyle} px-2 rounded-r-xl border-l border-white/20`}
        >
          <ArrowDropDownIcon fontSize="small" />
        </button>
      </div>

      <Popper
        // sx={{ zIndex: 50 }}
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        className='z-50 w-inherit'
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom'
                  ? 'center top'
                  : 'center bottom',
            }}
          >
            <Paper className="rounded-xl shadow-xl">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList className='text-sm' autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.value}
                      disabled={option.disabled}
                      selected={index === selectedIndex}
                      onClick={() => handleMenuItemClick(index)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}