'use client';

import { useState } from 'react';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
  };

  const handlePaymentSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white">
        <div className="max-w-[1600px] mx-auto px-4 py-5">
          <h1 className="text-lg font-semibold tracking-tight">Stellar Web3 Portal</h1>
          <p className="text-sm text-white/60">Testnet</p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />

          {isConnected && publicKey && (
            <>
              <div key={`balance-${refreshKey}`}>
                <BalanceDisplay publicKey={publicKey} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <PaymentForm publicKey={publicKey} onSuccess={handlePaymentSuccess} />
                <div className="relative min-h-[360px] md:min-h-0">
                  <div className="md:absolute md:inset-0" key={`history-${refreshKey}`}>
                    <TransactionHistory publicKey={publicKey} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
