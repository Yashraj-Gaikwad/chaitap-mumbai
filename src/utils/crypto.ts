import { ethers } from 'ethers';
import { Voucher, VerificationResult } from '../types';

// EIP-712 Domain for ChaiTap Base Sepolia Escrow Contract
export const EIP712_DOMAIN = {
  name: 'ChaiTap Offline Escrow',
  version: '1',
  chainId: 84532, // Base Sepolia Testnet
  verifyingContract: '0x389E8b62a5A29f27F11883F8C51e2Bc62E84c982',
} as const;

// EIP-712 Typed Data Schema
export const VOUCHER_TYPES = {
  ChaiVoucher: [
    { name: 'voucherId', type: 'string' },
    { name: 'customer', type: 'address' },
    { name: 'amountINR', type: 'uint256' },
    { name: 'amountUSDC', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'cardUID', type: 'string' },
    { name: 'worldNullifier', type: 'string' },
  ],
};

const STORAGE_KEY_WALLET_KEY = 'chaitap_customer_private_key';
const STORAGE_KEY_WORLD_ID = 'chaitap_world_id_nullifier';
const WORLD_ID_NULLIFIER_DEFAULT = '0x7a31b641f39c2de524e941b089c1f6d892a019483c65e8a93cb077d8a90141b0';

/**
 * Gets or initializes a persistent customer wallet for cryptographic signing.
 * Uses localStorage to maintain identity across sessions.
 */
export function getOrCreateCustomerWallet(): ethers.HDNodeWallet | ethers.Wallet {
  let privateKey = localStorage.getItem(STORAGE_KEY_WALLET_KEY);
  if (!privateKey) {
    const randomWallet = ethers.Wallet.createRandom();
    privateKey = randomWallet.privateKey;
    localStorage.setItem(STORAGE_KEY_WALLET_KEY, privateKey);
    return randomWallet;
  }
  return new ethers.Wallet(privateKey);
}

/**
 * World ID human nullifier (Sybil-resistance proof identifier)
 */
export function getWorldIDNullifier(): string {
  const stored = localStorage.getItem(STORAGE_KEY_WORLD_ID);
  return stored || WORLD_ID_NULLIFIER_DEFAULT;
}

/**
 * Persists updated World ID human nullifier
 */
export function setWorldIDNullifier(nullifier: string): void {
  localStorage.setItem(STORAGE_KEY_WORLD_ID, nullifier);
}

/**
 * Calculates USDC equivalent from INR (Fixed exchange rate for hackathon ~ ₹83.33 / USDC)
 */
export function inrToUSDC(amountINR: number): string {
  const rate = 83.3333;
  return (amountINR / rate).toFixed(2);
}

/**
 * Signs an EIP-712 structured micro-voucher payload using ECDSA secp256k1
 */
export async function signVoucherPayload(params: {
  amountINR: number;
  cardUID: string;
  itemLabel?: string;
  customExpirySeconds?: number;
}): Promise<Voucher> {
  const wallet = getOrCreateCustomerWallet();
  const customerAddress = await wallet.getAddress();
  
  const timestamp = Math.floor(Date.now() / 1000);
  const expiry = timestamp + (params.customExpirySeconds || 300); // 5 minutes default
  const amountUSDC = inrToUSDC(params.amountINR);
  
  // Deterministic unique voucher ID derived from customer address, timestamp, and card UID
  const entropy = `${customerAddress}-${timestamp}-${params.cardUID}-${Math.random()}`;
  const voucherId = ethers.keccak256(ethers.toUtf8Bytes(entropy)).substring(0, 18); // short hex identifier

  const value = {
    voucherId,
    customer: customerAddress,
    amountINR: BigInt(params.amountINR),
    amountUSDC,
    timestamp: BigInt(timestamp),
    expiry: BigInt(expiry),
    cardUID: params.cardUID,
    worldNullifier: getWorldIDNullifier(),
  };

  // Sign EIP-712 Typed Data
  const signature = await wallet.signTypedData(EIP712_DOMAIN, VOUCHER_TYPES, value);

  return {
    voucherId,
    customer: customerAddress,
    amountINR: params.amountINR,
    amountUSDC,
    timestamp,
    expiry,
    cardUID: params.cardUID,
    worldNullifier: getWorldIDNullifier(),
    sig: signature,
    itemLabel: params.itemLabel,
  };
}

/**
 * Verifies an incoming voucher completely offline:
 * 1. Checks payload signature against customer address
 * 2. Checks expiry timestamp
 * 3. Validates hardware card UID presence
 * 4. Checks against double-spending in local store
 */
export function verifyVoucherOffline(
  voucher: Voucher,
  spentVoucherIds: Set<string>
): VerificationResult {
  try {
    if (!voucher || !voucher.sig || !voucher.customer || !voucher.voucherId) {
      return { isValid: false, error: 'Malformed voucher payload: missing required cryptographic fields' };
    }

    // 1. Check double spending
    if (spentVoucherIds.has(voucher.voucherId)) {
      return {
        isValid: false,
        isDoubleSpend: true,
        error: `Double-spend detected! Voucher #${voucher.voucherId} was already redeemed on this device.`,
      };
    }

    // 2. Check Expiry
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > voucher.expiry) {
      const expiredAgoSeconds = currentTimestamp - voucher.expiry;
      return {
        isValid: false,
        isExpired: true,
        error: `Voucher expired ${expiredAgoSeconds}s ago (5-minute optical window elapsed)`,
      };
    }

    // 3. Check Physical Card UID and World ID nullifier format
    if (!voucher.cardUID || voucher.cardUID.length < 8) {
      return {
        isValid: false,
        error: 'Missing or invalid Born.Live hardware card UID attestation',
      };
    }

    if (!voucher.worldNullifier || !voucher.worldNullifier.startsWith('0x')) {
      return {
        isValid: false,
        error: 'Invalid World ID nullifier ZK-proof',
      };
    }

    // 4. Recover EIP-712 Signer
    const value = {
      voucherId: voucher.voucherId,
      customer: voucher.customer,
      amountINR: BigInt(voucher.amountINR),
      amountUSDC: voucher.amountUSDC,
      timestamp: BigInt(voucher.timestamp),
      expiry: BigInt(voucher.expiry),
      cardUID: voucher.cardUID,
      worldNullifier: voucher.worldNullifier,
    };

    const recoveredAddress = ethers.verifyTypedData(
      EIP712_DOMAIN,
      VOUCHER_TYPES,
      value,
      voucher.sig
    );

    if (recoveredAddress.toLowerCase() !== voucher.customer.toLowerCase()) {
      return {
        isValid: false,
        error: `Signature mismatch! Recovered address ${recoveredAddress} does not match customer ${voucher.customer}`,
      };
    }

    return {
      isValid: true,
      signerAddress: recoveredAddress,
      verifiedAt: Date.now(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown cryptographic validation error';
    return {
      isValid: false,
      error: `Cryptographic verification failed: ${message}`,
    };
  }
}

/**
 * Truncates an address or hash for UI display
 */
export function truncateHash(hash: string, left = 6, right = 4): string {
  if (!hash) return '';
  if (hash.length <= left + right) return hash;
  return `${hash.slice(0, left)}...${hash.slice(-right)}`;
}
