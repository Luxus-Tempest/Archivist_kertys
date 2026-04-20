import * as React from 'react';
import { Tooltip, Box, Typography, styled, type TooltipProps } from '@mui/material';
import i18next from 'i18next'

// Styled version for a more premium look consistent with the Archivist design system
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: i18next.t('rgba255255255095', 'rgba(255, 255, 255, 0.95)'),
    color: '#1e293b',
    boxShadow: i18next.t('010px25px5pxRgba0000108px10px6pxRgba00001', '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'),
    border: i18next.t('1pxSolidRgba2262322401', '1px solid rgba(226, 232, 240, 1)'),
    borderRadius: '12px',
    padding: '8px',
    backdropFilter: 'blur(8px)',
  },
  [`& .MuiTooltip-arrow`]: {
    color: i18next.t('rgba255255255095', 'rgba(255, 255, 255, 0.95)'),
    '&::before': {
      border: i18next.t('1pxSolidRgba2262322401', '1px solid rgba(226, 232, 240, 1)'),
    },
  },
}));

interface InfoTooltipProps extends Omit<TooltipProps, 'title'> {
  title?: string; // Optional simple title
  header?: string; // Structured header
  items?: (string | React.ReactNode)[]; // Structured list items
  footer?: string | React.ReactNode; // Structured footer
  children: React.ReactElement;
}

/**
 * A reusable, premium tooltip component for the Archivist design system.
 * Supports both simple string titles and structured "info" content.
 */
export function InfoTooltip({ 
  title, 
  header, 
  items, 
  footer, 
  children, 
  ...props 
}: InfoTooltipProps) {
  
  // If structured data is provided, build the complex content box
  const hasStructuredContent = header || items || footer;
  
  const content = hasStructuredContent ? (
    <Box sx={{ p: 0.5, maxWidth: 280 }}>
      {header && (
        <Typography 
          variant="caption" 
          component="div" 
          sx={{ 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: 'primary.main', 
            mb: 0.75,
            fontSize: '10px'
          }}
        >
          {header}
        </Typography>
      )}
      
      {items?.map((item, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>•</Typography>
          <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
            {item}
          </Typography>
        </Box>
      ))}
      
      {footer && (
        <Box 
          sx={{ 
            borderTop: '1px solid', 
            borderColor: 'divider',
            pt: 0.75, 
            mt: 0.75,
            opacity: 0.9
          }}
        >
          <Typography 
            variant="caption" 
            component="div" 
            sx={{ 
              fontStyle: 'italic',
              color: '#64748b',
              lineHeight: 1.4,
              fontSize: '10.5px'
            }}
          >
            {footer}
          </Typography>
        </Box>
      )}
    </Box>
  ) : title;

  return (
    <StyledTooltip 
      title={content || ''} 
      arrow 
      enterDelay={400} 
      leaveDelay={200}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
}
