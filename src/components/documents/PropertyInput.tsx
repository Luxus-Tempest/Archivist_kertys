import React from 'react';
import { MFDataType } from '../../types/documents';

interface PropertyInputProps {
  dataType: MFDataType;
  value: any;
  onChange: (newValue: any) => void;
  className?: string;
}

export function PropertyInput({ dataType, value, onChange, className = "" }: PropertyInputProps) {
  const baseClass = "w-full bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-xs outline-none focus:border-primary/50 transition-all " + className;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    onChange(newVal);
  };

  switch (dataType) {
    case MFDataType.Date:
      return (
        <input 
          type="date" 
          value={value ? new Date(value).toISOString().split('T')[0] : ''} 
          onChange={handleChange}
          className={baseClass}
        />
      );
    case MFDataType.Boolean:
      return (
        <div className="flex items-center h-6">
          <input 
            type="checkbox" 
            checked={value === true || String(value).toLowerCase() === 'true'} 
            onChange={handleChange}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
        </div>
      );
    case MFDataType.MultiLineText:
      return (
        <textarea 
          value={String(value || '')} 
          onChange={handleChange}
          rows={3}
          className={baseClass + " resize-none"}
        />
      );
    case MFDataType.Integer:
    case MFDataType.Integer64:
    case MFDataType.Floating:
      return (
        <input 
          type="number" 
          value={String(value || '')} 
          onChange={handleChange}
          className={baseClass}
        />
      );
    default:
      return (
        <input 
          type="text" 
          value={String(value || '')} 
          onChange={handleChange}
          className={baseClass}
        />
      );
  }
}
