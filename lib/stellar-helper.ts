/**
 * Stellar Helper - Blockchain logic for Freighter + Horizon testnet.
 * Wallet connect, balances, payments, and transaction history.
 */

import freighterApi from '@stellar/freighter-api';
import {
  Networks,
  Horizon,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  Transaction,
} from '@stellar/stellar-sdk';

const { isConnected, requestAccess, signTransaction, getPublicKey } = freighterApi;

export class StellarHelper {
  private server: Horizon.Server;
  private networkPassphrase: string;
  private publicKey: string | null = null;
  private networkLabel: 'TESTNET' | 'PUBLIC';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.server = new Horizon.Server(
      network === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
    this.networkPassphrase =
      network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
    this.networkLabel = network === 'testnet' ? 'TESTNET' : 'PUBLIC';
  }

  async isFreighterInstalled(): Promise<boolean> {
    try {
      return await isConnected();
    } catch {
      return false;
    }
  }

  async connectWallet(): Promise<string> {
    try {
      const hasFreighter = await isConnected();
      if (!hasFreighter) {
        throw new Error(
          'Freighter wallet extension not found. Install it from https://freighter.app'
        );
      }

      // Active access handshake — forces an explicit wallet popup
      const address = await requestAccess();
      if (!address) {
        // Fallback for older Freighter versions
        const cached = await getPublicKey();
        if (!cached) {
          throw new Error('User denied account access or wallet is locked.');
        }
        this.publicKey = cached;
        return cached;
      }

      this.publicKey = address;
      return address;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Wallet connection error:', error);
      throw new Error(`Wallet connection failed: ${message}`);
    }
  }

  async getBalance(publicKey: string): Promise<{
    xlm: string;
    assets: Array<{ code: string; issuer: string; balance: string }>;
  }> {
    try {
      const account = await this.server.loadAccount(publicKey);

      const xlmBalance = account.balances.find((b) => b.asset_type === 'native');

      const assets = account.balances
        .filter((b) => b.asset_type !== 'native')
        .map((b) => {
          if (b.asset_type === 'credit_alphanum4' || b.asset_type === 'credit_alphanum12') {
            return {
              code: b.asset_code,
              issuer: b.asset_issuer,
              balance: b.balance,
            };
          }
          return {
            code: 'UNKNOWN',
            issuer: '',
            balance: 'balance' in b ? b.balance : '0',
          };
        });

      return {
        xlm: xlmBalance && 'balance' in xlmBalance ? xlmBalance.balance : '0',
        assets,
      };
    } catch {
      // Unfunded / nonexistent account on testnet
      return { xlm: '0', assets: [] };
    }
  }

  async sendPayment(params: {
    from: string;
    to: string;
    amount: string;
    memo?: string;
  }): Promise<{ hash: string; success: boolean; fundedAccount?: boolean }> {
    const sourceAccount = await this.server.loadAccount(params.from);

    // Reactive dynamic fee estimation from recent network mode
    const feeStats = await this.server.feeStats();
    const dynamicFee = feeStats.fee_charged?.mode?.toString() || '100';

    // Intelligent operation splitting — createAccount if destination is unfunded
    let destinationExists = true;
    try {
      await this.server.loadAccount(params.to);
    } catch (err: unknown) {
      const response =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response
          : undefined;
      if (response?.status === 404) {
        destinationExists = false;
      } else {
        throw err;
      }
    }

    const transferOperation = destinationExists
      ? Operation.payment({
          destination: params.to,
          asset: Asset.native(),
          amount: params.amount,
        })
      : Operation.createAccount({
          destination: params.to,
          startingBalance: params.amount,
        });

    const transactionBuilder = new TransactionBuilder(sourceAccount, {
      fee: dynamicFee,
      networkPassphrase: this.networkPassphrase,
    }).addOperation(transferOperation);

    if (params.memo) {
      transactionBuilder.addMemo(Memo.text(params.memo));
    }

    const transaction = transactionBuilder.setTimeout(300).build();
    const xdr = transaction.toXDR();

    const signedXdr = await signTransaction(xdr, {
      network: this.networkLabel,
      networkPassphrase: this.networkPassphrase,
    });

    const submittedTx = TransactionBuilder.fromXDR(
      signedXdr,
      this.networkPassphrase
    ) as Transaction;

    const result = await this.server.submitTransaction(submittedTx);

    return {
      hash: result.hash,
      success: result.successful,
      fundedAccount: !destinationExists,
    };
  }

  async getRecentTransactions(
    publicKey: string,
    limit: number = 10
  ): Promise<
    Array<{
      id: string;
      type: string;
      amount?: string;
      asset?: string;
      from?: string;
      to?: string;
      createdAt: string;
      hash: string;
    }>
  > {
    try {
      const payments = await this.server
        .payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();

      return payments.records.map((payment) => {
        const record = payment as Horizon.ServerApi.PaymentOperationRecord & {
          amount?: string;
          asset_type?: string;
          asset_code?: string;
          from?: string;
          to?: string;
          transaction_hash: string;
          created_at: string;
          id: string;
          type: string;
        };

        return {
          id: record.id,
          type: record.type,
          amount: record.amount,
          asset:
            record.asset_type === 'native'
              ? 'XLM'
              : record.asset_code,
          from: record.from,
          to: record.to,
          createdAt: record.created_at,
          hash: record.transaction_hash,
        };
      });
    } catch {
      return [];
    }
  }

  getExplorerLink(hash: string, type: 'tx' | 'account' = 'tx'): string {
    const network =
      this.networkPassphrase === Networks.TESTNET ? 'testnet' : 'public';
    return `https://stellar.expert/explorer/${network}/${type}/${hash}`;
  }

  formatAddress(
    address: string,
    startChars: number = 4,
    endChars: number = 4
  ): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  disconnect() {
    this.publicKey = null;
    return true;
  }
}

export const stellar = new StellarHelper('testnet');
