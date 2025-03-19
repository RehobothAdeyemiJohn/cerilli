
/**
 * This file contains fixes and shims for various issues in the codebase.
 * It should be imported by the main entry point of the application.
 */

// Convert Blob to Uint8Array for PDF handling
export function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

// Add this function to window for global access if needed
if (typeof window !== 'undefined') {
  (window as any).blobToUint8Array = blobToUint8Array;
}
