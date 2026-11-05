export interface Voucher {
  voucherId: string;
  customer: string;
  amountINR: number;
  amountUSDC: string;
  timestamp: number;
  expiry: number;
  cardUID: string;
  worldNullifier: string;
  sig: string;
  itemLabel?: string;
}

export interface VerificationResult {
  isValid: boolean;
  signerAddress?: string;
  error?: string;
  isDoubleSpend?: boolean;
  isExpired?: boolean;
  verifiedAt?: number;
}

export interface SettlementBatch {
  batchId: string;
  vouchers: Voucher[];
  totalINR: number;
  totalUSDC: string;
  txHash?: string;
  timestamp: number;
  status: 'pending' | 'submitting' | 'settled' | 'failed';
  blockNumber?: number;
}

export interface CardScanResult {
  cardUID: string;
  cardModel: string;
  timestamp: number;
}
