'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { Card } from './example-components';

interface BalanceDisplayProps {
  publicKey: string;
}

export default function BalanceDisplay({ publicKey }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<string>('0');
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      setRefreshing(true);
      const balanceData = await stellar.getBalance(publicKey);
      setBalance(balanceData.xlm);
      setAssets(balanceData.assets);
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Failed to fetch balance. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  const formatBalance = (value: string): string => {
    const num = parseFloat(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  };

  if (loading) {
    return (
      <Card title="Balance">
        <p className="text-white/50 text-sm">Loading...</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">Balance</h2>
        <button
          onClick={fetchBalance}
          disabled={refreshing}
          className="text-white text-sm underline disabled:opacity-40"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="border border-white p-4 mb-3">
        <p className="text-white/50 text-xs mb-2">Available</p>
        <p className="text-3xl font-semibold text-white">
          {formatBalance(balance)} <span className="text-base font-normal text-white/70">XLM</span>
        </p>
      </div>

      {assets.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/50 text-xs">Other Assets</p>
          {assets.map((asset, index) => (
            <div
              key={index}
              className="border border-white p-3 flex justify-between items-center"
            >
              <div>
                <p className="text-white text-sm">{asset.code}</p>
                <p className="text-white/40 text-xs font-mono truncate max-w-[180px]">
                  {asset.issuer}
                </p>
              </div>
              <p className="text-white text-sm">{formatBalance(asset.balance)}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-white/40 text-xs">
        Keep at least 1 XLM for network reserves.
      </p>
    </Card>
  );
}
