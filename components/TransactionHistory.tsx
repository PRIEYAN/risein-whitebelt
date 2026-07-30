'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { Card, EmptyState } from './example-components';

interface Transaction {
  id: string;
  type: string;
  amount?: string;
  asset?: string;
  from?: string;
  to?: string;
  createdAt: string;
  hash: string;
}

interface TransactionHistoryProps {
  publicKey: string;
}

export default function TransactionHistory({ publicKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit] = useState(10);

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const txs = await stellar.getRecentTransactions(publicKey, limit);
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatAddress = (address?: string): string => {
    if (!address) return 'N/A';
    return stellar.formatAddress(address, 4, 4);
  };

  const isOutgoing = (tx: Transaction): boolean => tx.from === publicKey;

  if (loading) {
    return (
      <Card title="Transaction History" className="h-full">
        <p className="text-white/50 text-sm">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-base font-semibold text-white">Transaction History</h2>
        <button
          onClick={fetchTransactions}
          disabled={refreshing}
          className="text-white text-sm underline disabled:opacity-40"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions"
            description="History appears after you send or receive XLM."
          />
        ) : (
          <div className="space-y-3 pr-1">
            {transactions.map((tx) => {
              const outgoing = isOutgoing(tx);

              return (
                <div key={tx.id} className="border border-white p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {outgoing ? 'Sent' : 'Received'}
                      </p>
                      {tx.amount && (
                        <p className="text-white text-base">
                          {outgoing ? '-' : '+'}
                          {parseFloat(tx.amount).toFixed(2)} {tx.asset || 'XLM'}
                        </p>
                      )}
                    </div>
                    <a
                      href={stellar.getExplorerLink(tx.hash, 'tx')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-sm underline"
                    >
                      Details
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white/40 text-xs mb-1">From</p>
                      <p className="text-white/80 font-mono text-xs">{formatAddress(tx.from)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">To</p>
                      <p className="text-white/80 font-mono text-xs">{formatAddress(tx.to)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/30">
                    <p className="text-white/40 text-xs">{formatDate(tx.createdAt)}</p>
                    <p className="text-white/30 text-xs font-mono">{tx.hash.slice(0, 12)}...</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
