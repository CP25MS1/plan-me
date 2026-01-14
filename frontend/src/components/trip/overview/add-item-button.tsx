'use client';

import React, { forwardRef } from 'react';
import { Plus } from 'lucide-react';

type AddItemButtonProps = {
  label: string;
} & React.ComponentPropsWithoutRef<'button'>;

const AddItemButton = forwardRef<HTMLButtonElement, AddItemButtonProps>(
  ({ label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'white',
          color: '#27AE60',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Plus size={18} />
        {label}
      </button>
    );
  }
);

AddItemButton.displayName = 'AddItemButton';

export default AddItemButton;
