import React, { useState } from 'react';
import { CustomModal } from './CustomModal';
import { Button } from './Button';

export default function ExampleModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Add User & Permissions"
        footer={
          <>
            <Button variant="outline" className="w-auto px-6">
              Draft
            </Button>
            <Button className="w-auto px-6">
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p>User information</p>
          <p>Form fields here...</p>
        </div>
      </CustomModal>
    </>
  );
}