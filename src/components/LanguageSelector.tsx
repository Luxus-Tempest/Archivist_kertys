import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 160,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      fontSize: '13px',
      fontWeight: 500,
      padding: '8px 16px',
      '& .MuiSvgIcon-root': {
        fontSize: 16,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
      '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.main,
        '& .MuiSvgIcon-root': {
          color: theme.palette.primary.main,
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
      },
    },
  },
}));

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  const currentLanguage = i18n.language || 'en';

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    // { code: 'es', label: 'Español' },
  ];

  return (
    <div className="flex items-center">
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="text"
        disableElevation
        onClick={handleClick}
        startIcon={<LanguageIcon sx={{ fontSize: 20 }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ 
          fontSize: 18, 
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s'
        }} />}
        sx={{
          textTransform: 'none',
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '13px',
          padding: '6px 12px',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {languages.find(l => currentLanguage.startsWith(l.code))?.label || 'English'}
      </Button>
      <StyledMenu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
      >
        {languages.map((lng, idx) => (
          <React.Fragment key={lng.code}>
            <MenuItem 
              onClick={() => changeLanguage(lng.code)}
              selected={currentLanguage.startsWith(lng.code)}
              disableRipple
            >
              <div className="flex items-center justify-between w-full">
                <span>{lng.label}</span>
                {currentLanguage.startsWith(lng.code) && (
                  <CheckIcon sx={{ ml: 2, fontSize: 14 }} />
                )}
              </div>
            </MenuItem>
            {idx < languages.length - 1 && <Divider sx={{ my: '4px !important', opacity: 0.6 }} />}
          </React.Fragment>
        ))}
      </StyledMenu>
    </div>
  );
}
