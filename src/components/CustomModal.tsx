import React, { type ReactNode } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string | number;
  maxWidth?: string | number;
  className?: string;
}

export function CustomModal({
  open,
  onClose,
  title,
  children,
  footer,
  width = '50%',
  maxWidth = '1100px',
  className = '',
}: CustomModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          className: 'bg-black/40 backdrop-blur-[2px]',
        },
      }}
    >
      <Fade in={open}>
        <Box
          className={`absolute top-1/2 left-1/2 max-h-[90vh] -translate-x-1/2 -translate-y-1/2 outline-none ${className}`}
          sx={{
            width,
            maxWidth,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{title}</h4>

              <IconButton
                onClick={onClose}
                className=" hover:bg-surface-container-highest! h-8 w-8 rounded-md!"
              >
                <CloseIcon fontSize='small' />
              </IconButton>
            </div>

            {/* Body */}
            <div className="px-8 py-6 overflow-y-auto max-h-[65vh]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}