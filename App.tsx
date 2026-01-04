
import React, { useState } from 'react';
import { ViewState, UserRole } from './types';
import AdminView from './components/AdminView';
import CustomerView from './components/CustomerView';
import { Shield, ShoppingBag, Store, AlertCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234') { // Secure but simplified for demo
      setView('ADMIN_DASHBOARD');
      setError(null);
      setAdminPin('');
    } else {
      setError('Invalid PIN. Access Denied.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl overflow-hidden relative">
      {view === 'LANDING' && (
        <div className="h-screen flex flex-col p-6 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center rotate-3 shadow-inner">
              <Store className="w-12 h-12 text-green-600 -rotate-3" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-800 tracking-tight">SmartMart</h1>
              <p className="text-gray-500 font-medium">Offline Self-Billing System</p>
            </div>
            
            <div className="w-full space-y-4 pt-12">
              <button 
                onClick={() => setView('SHOPPING')}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-6 rounded-3xl flex items-center justify-between shadow-xl active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Customer Portal</p>
                    <p className="text-xs text-green-100 font-medium">Scan & Pay on the go</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setView('ADMIN_LOGIN')}
                className="w-full bg-white border border-gray-200 text-gray-800 p-6 rounded-3xl flex items-center justify-between shadow-sm hover:bg-gray-50 active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-gray-800">Store Manager</p>
                    <p className="text-xs text-gray-500 font-medium">Verify exit & manage inventory</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] py-4">
            v1.0.0 • Verified Secure Offline
          </p>
        </div>
      )}

      {view === 'ADMIN_LOGIN' && (
        <div className="h-screen bg-gray-900 flex flex-col p-6 text-white justify-center items-center space-y-8 animate-in zoom-in duration-300">
          <button 
            onClick={() => setView('LANDING')}
            className="absolute top-6 left-6 p-2 bg-white/10 rounded-full"
          >
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>
          
          <div className="text-center space-y-2">
            <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black">Admin Access</h2>
            <p className="text-gray-400 text-sm">Enter manager PIN to continue</p>
          </div>

          <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
            <input 
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-gray-800 border-2 border-gray-700 text-center text-4xl py-6 rounded-3xl outline-none focus:border-blue-500 tracking-[0.5em] font-mono"
            />
            {error && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-bold">{error}</p>
              </div>
            )}
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black text-lg shadow-lg active:scale-95 transition-all"
            >
              AUTHENTICATE
            </button>
          </form>

          <p className="text-xs text-gray-500 font-medium">Default Demo PIN: 1234</p>
        </div>
      )}

      {view === 'ADMIN_DASHBOARD' && (
        <AdminView onBack={() => setView('LANDING')} />
      )}

      {view === 'SHOPPING' && (
        <CustomerView onBack={() => setView('LANDING')} />
      )}
    </div>
  );
};

export default App;
