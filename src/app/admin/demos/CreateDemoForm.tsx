'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Alert from '@/components/admin/ui/Alert';
import Modal from '@/components/admin/ui/Modal';
import { createDemo } from './actions';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateDemoForm({ open, onClose }: Props) {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scaffoldCmd, setScaffoldCmd] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClose() {
    setSlug('');
    setName('');
    setError(null);
    setScaffoldCmd(null);
    onClose();
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createDemo({ slug: slug.trim().toLowerCase(), business_name: name.trim() });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setScaffoldCmd(`npm run new-demo -- --slug=${slug.trim().toLowerCase()} --name="${name.trim()}"`);
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New demo"
      footer={
        scaffoldCmd ? (
          <Button onClick={handleClose}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={pending}>Cancel</Button>
            <Button onClick={submit} disabled={pending || !slug.trim() || !name.trim()}>
              {pending ? 'Creating…' : 'Create'}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        {scaffoldCmd ? (
          <div className="space-y-3">
            <Alert tone="success">Demo record created.</Alert>
            <p className="text-sm text-muted">Run this command to scaffold the code folder:</p>
            <code className="block bg-card border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground break-all">
              {scaffoldCmd}
            </code>
            <p className="text-xs text-muted">
              Then invite the client from <strong>Invitations</strong> → role <em>Client</em> → demo <em>{slug.trim().toLowerCase()}</em>.
            </p>
          </div>
        ) : (
          <>
            <Input
              label="Slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="acme-bakery"
              hint="Lowercase letters, numbers, hyphens. Used in the URL: /demo/acme-bakery"
            />
            <Input
              label="Business name"
              name="business_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Bakery"
            />
          </>
        )}
      </div>
    </Modal>
  );
}
