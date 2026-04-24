import Menu from '@mui/material/Menu';
import type { ReactNode } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next'

export interface MUIMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface MUIMenuProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  items: MUIMenuItem[];
  header?: string;
  variant?: 'light' | 'dark';
  align?: 'left' | 'right';
  width?: number | string;
}

/**
 * A professional, high-performance menu component built on Material UI.
 * Standardized for the Archivist design system with custom premium look.
 */
export function MUIMenu({
  anchorEl,
  isOpen,
  onClose,
  items,
  header,
  variant = 'light',
  align = 'left',
  width = 240,
}: MUIMenuProps) {
  const { t } = useTranslation()
  const isDark = variant === 'dark';

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      // TransitionComponent={Fade}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: align === 'left' ? 'left' : 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: align === 'left' ? 'left' : 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: width,
            borderRadius: '12px',
            backgroundColor: isDark ? t('rgba152342095', 'rgba(15, 23, 42, 0.95)') : '#ffffff',
            backdropFilter: isDark ? 'blur(12px)' : 'none',
            border: t('1pxSolidVal', '1px solid {{val}}', { val: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 1)' }),
            boxShadow: t('010px25px5pxRgba0000108px10px6pxRgba00001', '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'),
            padding: '4px 0',
            '& .MuiList-root': {
              padding: 0,
            },
          },
        },
      }}
      className='w-[250px] flex flex-col justify-start space-y-2'

    >
      {header && (
        <Box  sx={{ px: 2, py: 1.5, borderBottom: t('1pxSolidVal', '1px solid {{val}}', { val: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }), mb: 0.5 }}>
          <Typography
            sx={{
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: isDark ? t('rgba25525525504', 'rgba(255, 255, 255, 0.4)') : '#94a3b8',
            }}
          >
            {header}
          </Typography>
        </Box>
      )}

      {items.map((item, index) => (
        <MenuItem
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          sx={{
            py: 1.25,
            px: 2,
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            transition: t('all02sCubicbezier0161031', 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'),
            mx: 0.5,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: isDark ? t('rgba255255255008', 'rgba(255, 255, 255, 0.08)') : t('rgba2412452491', 'rgba(241, 245, 249, 1)'),
              transform: 'translateX(2px)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
        >
          {item.icon && (
            <Box
              component="span"
              className="flex items-center justify-center"
              sx={{
                fontSize: '18px',
                color: item.variant === 'danger' ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.4)' : '#64748b'),
                transition: 'color 0.2s',
                '& .MuiSvgIcon-root': {
                  fontSize: '18px',
                },
                '.MuiMenuItem-root:hover &': {
                  color: item.variant === 'danger' ? '#ef4444' : (isDark ? '#fff' : '#1e293b'),
                },
              }}
            >
              {item.icon}
            </Box>
          )}
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: item.variant === 'danger' ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.85)' : '#334155'),
              '.MuiMenuItem-root:hover &': {
                color: item.variant === 'danger' ? '#ef4444' : (isDark ? '#fff' : '#0f172a'),
              },
            }}
          >
            {item.label}
          </Typography>
        </MenuItem>
      ))}
    </Menu>
  );
}
