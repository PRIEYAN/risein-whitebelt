'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { Card } from './example-components';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setPublicKey(key);
      setIsConnected(true);
      onConnect(key);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Connection error:', error);
      alert(`Failed to connect wallet:\n${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    onDisconnect();
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Card title="Connect Wallet">
        <p className="text-white/60 text-sm mb-5">
          Connect Freighter to view your balance and send payments.
        </p>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-white text-black font-medium py-3 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
        </button>
        <p className="mt-4 text-white/50 text-xs">
          Requires Freighter on Testnet.{' '}
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white"
          >
            Get Freighter
          </a>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <span className="text-white text-sm">Connected</span>
        <button
          onClick={handleDisconnect}
          className="text-white text-sm underline"
        >
          Disconnect
        </button>
      </div>

      <div className="border border-white p-3">
        <p className="text-white/50 text-xs mb-2">Address</p>
        <div className="flex items-start justify-between gap-3">
          <p className="text-white font-mono text-xs break-all">{publicKey}</p>
          <button
            onClick={handleCopyAddress}
            className="text-white text-xs underline shrink-0"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <a
        href={stellar.getExplorerLink(publicKey, 'account')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 text-white text-sm underline"
      >
        View on Stellar Expert
      </a>
    </Card>
  );
}
