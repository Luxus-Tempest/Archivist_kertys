import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        'stroke-width'?: string | number;
        class?: string;
        className?: string;
        strokeWidth?: string | number;
        width?: string | number;
        height?: string | number;
        [key: string]: any;
      };
    }
  }
}

