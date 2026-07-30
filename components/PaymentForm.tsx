'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { Card, Input, Alert } from './example-components';

interface PaymentFormProps {
  publicKey: string;
  onSuccess?: () => void;
}

export default function PaymentForm({ publicKey, onSuccess }: PaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txHash, setTxHash] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (recipient.length !== 56 || !recipient.startsWith('G')) {
      newErrors.recipient = 'Invalid Stellar address (must start with G and be 56 characters)';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (numAmount < 0.0000001) {
        newErrors.amount = 'Amount is too small (minimum: 0.0000001 XLM)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      setTxHash('');

      const result = await stellar.sendPayment({
        from: publicKey,
        to: recipient,
        amount: amount,
        memo: memo || undefined,
      });

      if (result.success) {
        setTxHash(result.hash);
        setAlert({
          type: 'success',
          message: result.fundedAccount
            ? 'Account funded successfully.'
            : 'Payment sent successfully.',
        });

        setRecipient('');
        setAmount('');
        setMemo('');
        setErrors({});

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const raw = error instanceof Error ? error.message : String(error);
      let errorMessage = 'Failed to send payment. ';

      if (raw.includes('insufficient')) {
        errorMessage += 'Insufficient balance.';
      } else if (raw.includes('destination')) {
        errorMessage += 'Invalid destination account.';
      } else {
        errorMessage += raw || 'Please try again.';
      }

      setAlert({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-base font-semibold text-white mb-4">Send Payment</h2>

      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {txHash && (
        <div className="mb-4 border border-white p-3">
          <p className="text-white text-sm mb-2">Transaction confirmed</p>
          <p className="text-white/50 text-xs mb-1">Hash</p>
          <p className="text-white text-xs font-mono break-all mb-3">{txHash}</p>
          <a
            href={stellar.getExplorerLink(txHash, 'tx')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-sm underline"
          >
            View on Stellar Expert
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Destination"
          placeholder="G..."
          value={recipient}
          onChange={setRecipient}
          error={errors.recipient}
        />

        <Input
          label="Amount (XLM)"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={setAmount}
          error={errors.amount}
        />

        <Input
          label="Memo (optional)"
          placeholder="Optional memo"
          value={memo}
          onChange={setMemo}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-medium py-3 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Confirming...' : 'Send Transaction'}
        </button>
      </form>

      <p className="mt-4 text-white/40 text-xs">
        Double-check the destination. Transactions are irreversible.
      </p>
    </Card>
  );
}
