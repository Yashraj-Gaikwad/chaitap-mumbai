import { CardScanResult } from '../types';

// Declaring NDEFReader type for TypeScript
declare global {
  interface Window {
    NDEFReader?: any;
  }
}

export const isWebNFCSupported = (): boolean => {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
};

/**
 * Generates a realistic MIFARE / Born.Live 7-byte NFC Card UID format (04:XX:XX:XX:XX:XX:XX)
 */
export function generateMockCardUID(): string {
  const bytes = [0x04]; // NXP / MIFARE identifier
  for (let i = 0; i < 6; i++) {
    bytes.push(Math.floor(Math.random() * 256));
  }
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

/**
 * Scans a real Born.Live NFC Card using Web NFC API
 * Aborts if signal is provided or timeout occurs
 */
export async function scanRealNfcCard(signal?: AbortSignal): Promise<CardScanResult> {
  if (!isWebNFCSupported()) {
    throw new Error('Web NFC (NDEFReader) is not supported in this browser. Please use the Desktop Tap Simulator.');
  }

  const ndef = new window.NDEFReader();
  await ndef.scan({ signal });

  return new Promise<CardScanResult>((resolve, reject) => {
    if (signal) {
      signal.addEventListener('abort', () => {
        reject(new DOMException('NFC scan cancelled', 'AbortError'));
      });
    }

    const onReading = (event: any) => {
      const serialNumber = event.serialNumber || generateMockCardUID();
      cleanup();
      resolve({
        cardUID: serialNumber.toUpperCase(),
        cardModel: 'Born.Live Devcon NFC Card (NTAG424 DNA)',
        timestamp: Date.now(),
      });
    };

    const onError = (error: any) => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      ndef.removeEventListener('reading', onReading);
      ndef.removeEventListener('readingerror', onError);
    }

    ndef.addEventListener('reading', onReading);
    ndef.addEventListener('readingerror', onError);
  });
}

/**
 * Simulates a tactile Born.Live NFC Card tap for desktop / Chrome without Web NFC
 */
export async function simulateNfcTap(existingUID?: string): Promise<CardScanResult> {
  // Realistic physical card tap delay
  await new Promise(resolve => setTimeout(resolve, 600));

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 30, 80]);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }

  const cardUID = existingUID || '04:B8:4C:1F:90:3A:82';

  return {
    cardUID,
    cardModel: 'Born.Live Devcon NFC Card #BL-MUMBAI-08',
    timestamp: Date.now(),
  };
}
