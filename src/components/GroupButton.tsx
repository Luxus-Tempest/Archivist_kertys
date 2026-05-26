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
    'py-2 cursor-pointer px-4 h-10 font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed';

  const variants = {
    solid:
      'bg-blue-medium hover:bg-blue-dark text-white',
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
  open={open}
  anchorEl={anchorRef.current}
  transition
  disablePortal
  className='z-50'
  // ↓ on récupère la largeur du parent pour l'appliquer au menu
  style={{ minWidth: anchorRef.current?.offsetWidth }}
>
  {({ TransitionProps, placement }) => (
    <Grow
      {...TransitionProps}
      style={{
        transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
      }}
    >
<Paper 
  className="shadow-card! border! px-1.5! border-outline-variant/40! rounded-md! mt-1!" 
  style={{ minWidth: '100%' }}
  // sx={{
  //   // borderRadius: '12px',
  //   // border: '1px solid #e2e6ea',
  //   // boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
  //   py: 0,
  //   mt: 0.5,
  // }}
>        <ClickAwayListener onClickAway={handleClose}>
          <MenuList className='text-sm' autoFocusItem>
  {options.map((option, index) => (
        <React.Fragment key={option.value}>
      <MenuItem
        disabled={option.disabled}
        selected={index === selectedIndex}
        onClick={() => handleMenuItemClick(index)}
        className='text-start! rounded-sm! px-2! py-2!'
        sx={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#1e2a32',
          borderRadius: '8px',
          mx: 0.5,
          my: 0.25,
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: '#f0f4f8',
            color: '#1e2a32',
          },
          '&.Mui-selected': {
            backgroundColor: '#e8edf2',
            fontWeight: 700,
            '&:hover': { backgroundColor: '#dde4eb' },
          },
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        {option.label}
      </MenuItem>

      {/* Séparateur entre chaque item sauf le dernier */}
      {index < options.length - 1 && (
        <div
        className=' mx-2 h-[0.5px]  my-0.5 bg-outline-variant/40'   
          // style={{
          //   height: '1px',
          //   backgroundColor: 'rgba(169, 180, 185, 0.18)',
          //   // mx: 1,
          // }}
        />
      )}
    </React.Fragment>

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