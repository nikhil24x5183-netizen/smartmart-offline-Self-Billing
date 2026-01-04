
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, Play, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [active, setActive] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (active) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render((result) => {
        scanner.clear();
        onScan(result);
        setActive(false);
      }, (error) => {
        // console.warn(error);
      });

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [active, onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Scan Product
        </h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div id="reader" className="w-full max-w-sm overflow-hidden rounded-xl bg-gray-900 border-2 border-green-500 shadow-2xl"></div>
        
        {!active && (
          <button 
            onClick={() => setActive(true)}
            className="mt-8 px-6 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Resume Scanner
          </button>
        )}

        <div className="mt-8 text-white/70 text-center px-6">
          <p className="text-sm">Position the product barcode inside the square.</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-[10px] px-2 py-1 bg-white/10 rounded border border-white/20">EAN-13</span>
            <span className="text-[10px] px-2 py-1 bg-white/10 rounded border border-white/20">QR CODE</span>
            <span className="text-[10px] px-2 py-1 bg-white/10 rounded border border-white/20">UPC-A</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
