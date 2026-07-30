'use client';

import { useState } from 'react';
import { Card } from './example-components';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="border border-white px-3 py-2 text-sm text-white hover:bg-white hover:text-black transition-colors"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}

export function AddressQRCode({ address }: { address: string }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowQR(!showQR)}
        className="text-white underline text-sm"
      >
        {showQR ? 'Hide QR' : 'Show QR Code'}
      </button>

      {showQR && (
        <div className="mt-4 border border-white p-4">
          <div className="text-center">
            <p className="text-white/60 text-xs mb-2">Scan to get address</p>
            <div className="w-48 h-48 border border-white flex items-center justify-center mx-auto">
              <p className="text-white/50 text-sm">QR Code</p>
            </div>
            <p className="text-white/60 text-xs mt-2 font-mono break-all">{address}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BalanceChart() {
  return (
    <Card title="Balance History">
      <div className="h-48 border border-white flex items-center justify-center">
        <p className="text-white/50 text-sm">Chart placeholder</p>
      </div>
    </Card>
  );
}

export function TransactionFilter({ onFilter }: { onFilter: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    onFilter(value);
  };

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search transactions..."
      className="w-full bg-black border border-white px-3 py-2 text-white placeholder-white/40 focus:outline-none"
    />
  );
}

export function TransactionConfirmation({
  isOpen,
  onConfirm,
  onCancel,
  recipient,
  amount,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  recipient: string;
  amount: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white max-w-md w-full p-5">
        <h3 className="text-base font-semibold text-white mb-4">Confirm Transaction</h3>

        <div className="space-y-3 mb-6">
          <div className="border border-white p-3">
            <p className="text-white/50 text-xs">Recipient</p>
            <p className="text-white font-mono text-xs break-all">{recipient}</p>
          </div>
          <div className="border border-white p-3">
            <p className="text-white/50 text-xs">Amount</p>
            <p className="text-white text-xl font-semibold">{amount} XLM</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-white text-white py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-white text-black py-2.5 font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddressBook() {
  const [addresses] = useState<Array<{ name: string; address: string }>>([]);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Card title="Address Book">
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="text-white underline text-sm mb-4"
      >
        {showAdd ? 'Close' : 'Add Address'}
      </button>

      {showAdd && (
        <div className="mb-4 border border-white p-3 space-y-2">
          <input
            type="text"
            placeholder="Name"
            className="w-full bg-black border border-white px-3 py-2 text-white placeholder-white/40 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Stellar Address"
            className="w-full bg-black border border-white px-3 py-2 text-white placeholder-white/40 focus:outline-none"
          />
          <button className="w-full bg-white text-black font-medium py-2">
            Save Contact
          </button>
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-white/50 text-sm py-6 text-center">No saved addresses yet</p>
      ) : (
        <div className="space-y-2">
          {addresses.map((contact, index) => (
            <div
              key={index}
              className="border border-white p-3 flex justify-between items-center"
            >
              <div>
                <p className="text-white text-sm">{contact.name}</p>
                <p className="text-white/50 text-xs font-mono">
                  {contact.address.slice(0, 20)}...
                </p>
              </div>
              <button className="text-white text-sm underline">Use</button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function AnimatedCard({
  children,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return <div>{children}</div>;
}
