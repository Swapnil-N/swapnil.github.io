'use client';

import { useState, useTransition } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import Textarea from '@/components/admin/ui/Textarea';
import Alert from '@/components/admin/ui/Alert';
import { recordClientAction } from '@/app/demo/actions';

interface Props {
  open: boolean;
  clientId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function RequestChangesModal({ open, clientId, onClose, onSuccess }: Props) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!message.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await recordClientAction({
        client_id: clientId,
        action: 'request_changes',
        message: message.trim(),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage('');
      onSuccess("Feedback received — we'll review and get back to you.");
    });
  }

  function handleClose() {
    setMessage('');
    setError(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request changes"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !message.trim()}>
            {pending ? 'Sending…' : 'Send feedback'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Textarea
          label="What would you like changed?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please update the color scheme, add our logo, and change the tagline to…"
          rows={5}
        />
      </div>
    </Modal>
  );
}
