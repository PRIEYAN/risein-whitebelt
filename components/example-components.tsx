'use client';

import { useState } from 'react';

export function LoadingSpinner() {
  return (
    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
  );
}

export function BalanceCard({
  balance,
  label,
}: {
  balance: string;
  label: string;
}) {
  return (
    <div className="border border-white p-4">
      <p className="text-white/60 text-sm mb-2">{label}</p>
      <p className="text-3xl font-semibold text-white">{balance}</p>
    </div>
  );
}

export function TransactionItem({
  type,
  amount,
  asset,
  date,
  hash,
  explorerLink,
}: {
  type: string;
  amount?: string;
  asset?: string;
  date: string;
  hash: string;
  explorerLink: string;
}) {
  return (
    <div className="border border-white p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-white font-medium">{type}</p>
          {amount && (
            <p className="text-white/80">
              {amount} {asset || 'XLM'}
            </p>
          )}
        </div>
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline text-sm"
        >
          View
        </a>
      </div>
      <div className="flex justify-between text-xs text-white/50">
        <span>{new Date(date).toLocaleString()}</span>
        <span className="font-mono">{hash.slice(0, 8)}...</span>
      </div>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="text-white underline text-sm">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function Alert({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`border px-4 py-3 flex justify-between items-start gap-3 ${
        type === 'error' ? 'border-white bg-white text-black' : 'border-white text-white'
      }`}
    >
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-sm underline shrink-0">
        Close
      </button>
    </div>
  );
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-white p-5 ${className}`}>
      {title && <h2 className="text-base font-semibold text-white mb-4">{title}</h2>}
      {children}
    </div>
  );
}

export function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-white px-3 py-2.5 text-white placeholder-white/40 focus:outline-none"
      />
      {error && <p className="text-white text-sm mt-1 underline">{error}</p>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const variants = {
    primary: 'bg-white text-black hover:bg-white/90',
    secondary: 'bg-black text-white border border-white hover:bg-white hover:text-black',
    danger: 'bg-black text-white border border-white hover:bg-white hover:text-black',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } font-medium py-2.5 px-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
}: {
  icon?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-10">
      <h3 className="text-white text-base font-medium mb-2">{title}</h3>
      <p className="text-white/60 text-sm">{description}</p>
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-white">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white text-sm underline">
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
