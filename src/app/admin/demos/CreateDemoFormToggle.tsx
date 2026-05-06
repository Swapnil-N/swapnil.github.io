'use client';

import { useState } from 'react';
import Button from '@/components/admin/ui/Button';
import CreateDemoForm from './CreateDemoForm';

export default function CreateDemoFormToggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New demo</Button>
      <CreateDemoForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
