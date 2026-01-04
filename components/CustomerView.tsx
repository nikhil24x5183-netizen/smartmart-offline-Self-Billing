
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Barcode, ChevronLeft, Trash2, 
  CreditCard, CheckCircle, Ticket, Store, Info,
  Search, X
} from 'lucide-react';
import { DB } from '../db';
import { Product, CartItem, SaleRecord, ExitToken } from '../types';
import Scanner from './Scanner';

interface CustomerViewProps {
  onBack: () => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ onBack }) => {
  const [view, setView] = useState<'BROWSE' | 'CART' | 'CHECKOUT' | 'SUCCESS'>('BROWSE');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);
  const [nextToken, setNextToken] = useState<ExitToken | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const products = useMemo(() => DB.getProducts(), []);

  const addToCart = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (!product) {
      setMessage("Product not found! Check barcode.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (product.stock <= 0) {
      setMessage("Product out of stock!");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.barcode === barcode);
      if (existing) {
        return prev.map(item => item.barcode === barcode ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setMessage(`Added ${product.name}`);
    setTimeout(() => setMessage(null), 2000);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxTotal = cart.reduce((acc, item) => acc + (item.tax * item.quantity), 0);
    return {
      subtotal,
      taxTotal,
      total: subtotal + taxTotal
    };
  }, [cart]);

  const handleCheckout = () => {
    const saleId = 'S' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const tokenId = 'TKN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const sale: SaleRecord = {
      id: saleId,
      timestamp: Date.now(),
      items: [...cart],
      ...totals,
      tokenId
    };

    const token: ExitToken = {
      id: tokenId,
      saleId: saleId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 mins expiry
      status: 'active'
    };

    // Save to local storage
    DB.addSale(sale);
    DB.addToken(token);

    // Update stock (simulation)
    const allProducts = DB.getProducts();
    const updatedProducts = allProducts.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    DB.saveProducts(updatedProducts);

    setLastSale(sale);
    setNextToken(token);
    setView('SUCCESS');
    setCart([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Dynamic Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 shadow-md">
        <button onClick={() => view === 'BROWSE' ? onBack() : setView('BROWSE')} className="p-1 hover:bg-green-700 rounded transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">SmartMart Shopping</h1>
          <p className="text-[10px] text-green-100 flex items-center gap-1">
            <Store className="w-3 h-3" /> Store #8821 • Self-Billing Active
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setView('CART')} className="p-2 hover:bg-green-700 rounded transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Floating Message Overlay */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20">
            {message}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {view === 'BROWSE' && (
          <div className="p-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <Barcode className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800">Scan Your Items</h2>
                <p className="text-sm text-gray-500 mt-1 px-4">Tap the scanner button to start adding products to your virtual cart.</p>
              </div>
              <button 
                onClick={() => setShowScanner(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Barcode className="w-6 h-6" />
                START SCANNING
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4" /> Quick Manual Entry (Demo)
              </h3>
              <div className="flex gap-2">
                <input 
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Barcode number..." 
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm outline-none focus:border-green-500"
                />
                <button 
                  onClick={() => { addToCart(manualBarcode); setManualBarcode(''); }}
                  className="bg-gray-800 text-white px-4 py-3 rounded-xl font-bold text-sm"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {products.slice(0, 3).map(p => (
                  <button 
                    key={p.id}
                    onClick={() => addToCart(p.barcode)}
                    className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-200 transition-all"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Queue-Free Experience</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">No need to wait at the till! Just scan, pay in-app, and show your digital token at the exit.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'CART' && (
          <div className="p-4 space-y-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" /> Your Cart
            </h2>
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400">Cart is currently empty.</p>
                <button onClick={() => setView('BROWSE')} className="mt-4 text-green-600 font-bold underline">Start Scanning</button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center bg-gray-100 rounded-full px-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-500 hover:text-black">-</button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-500 hover:text-black">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-100 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3 mt-6">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Estimated Tax</span>
                    <span>${totals.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-800">Total Payable</span>
                    <span className="text-2xl font-black text-green-600">${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setView('CHECKOUT')}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl mt-4 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-6 h-6" />
                  SECURE CHECKOUT
                </button>
              </>
            )}
          </div>
        )}

        {view === 'CHECKOUT' && (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-black text-gray-800">Payment</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Amount Due</p>
                <p className="text-3xl font-black text-green-700">${totals.total.toFixed(2)}</p>
              </div>

              <div className="space-y-3 pt-4">
                <p className="text-sm font-bold text-gray-400 uppercase px-1">Select Payment Method</p>
                <div className="p-4 border-2 border-green-500 bg-green-50 rounded-2xl flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <img src="https://picsum.photos/seed/card/40/25" alt="visa" className="rounded" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Stored Balance / PWA Pay</p>
                    <p className="text-xs text-gray-500">**** 8291 • Instant Processing</p>
                  </div>
                  <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  By clicking Pay Now, your transaction will be processed locally. No refunds allowed after token generation.
                </p>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
                >
                  PAY NOW
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'SUCCESS' && nextToken && (
          <div className="p-4 space-y-6 flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-gray-800">Payment Successful!</h2>
              <p className="text-sm text-gray-500">Your exit token has been generated.</p>
            </div>

            <div className="w-full bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
              
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Exit Verification Token</p>
                <p className="text-2xl font-mono font-black text-gray-800">{nextToken.id}</p>
              </div>

              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                {/* Simplified QR Placeholder */}
                <div className="w-48 h-48 bg-white p-2 border border-gray-100 rounded-xl flex flex-wrap gap-0.5">
                  {Array.from({length: 256}).map((_, i) => (
                    <div key={i} className={`w-[11px] h-[11px] ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                  ))}
                </div>
              </div>

              <div className="w-full space-y-4 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Issued At</span>
                  <span className="font-bold text-gray-800">{new Date(nextToken.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Expires At</span>
                  <span className="font-bold text-red-500">{new Date(nextToken.expiresAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Token Status</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black text-[10px] uppercase">Active</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center bg-gray-50 w-full py-4 px-6 leading-tight">
                Please present this screen to the security staff at the store exit. This token is non-reusable and will expire automatically.
              </p>
            </div>

            <button 
              onClick={onBack}
              className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              Back to Store Entry
            </button>
          </div>
        )}
      </div>

      {/* Persistent Call-to-Action / Bottom Navigation */}
      {view !== 'SUCCESS' && (
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-8 flex justify-around items-center gap-4 z-40">
          <button 
            onClick={() => setView('BROWSE')}
            className={`flex flex-col items-center gap-1 ${view === 'BROWSE' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <Barcode className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Scanner</span>
          </button>
          <button 
            onClick={() => setShowScanner(true)}
            className="bg-green-600 text-white p-4 rounded-full shadow-lg -translate-y-4 active:scale-90 transition-transform"
          >
            <Barcode className="w-8 h-8" />
          </button>
          <button 
            onClick={() => setView('CART')}
            className={`flex flex-col items-center gap-1 relative ${view === 'CART' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Cart</span>
            {cart.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>}
          </button>
        </div>
      )}

      {showScanner && (
        <Scanner 
          onScan={(barcode) => {
            addToCart(barcode);
            setShowScanner(false);
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default CustomerView;
