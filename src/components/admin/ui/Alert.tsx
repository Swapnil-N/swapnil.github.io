import type { ReactNode } from 'react';

type Tone = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  tone: Tone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  info: 'border-primary/30 bg-primary/10 text-primary',
};

export default function Alert({ tone, children, className = '' }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]} ${className}`}>
      {children}
    </div>
  );
}
