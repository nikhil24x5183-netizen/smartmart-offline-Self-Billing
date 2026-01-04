
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, ChevronLeft, Package, 
  TrendingUp, CheckCircle2, QrCode, Search, ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DB } from '../db';
import { Product, SaleRecord, ExitToken, ViewState } from '../types';
import { getSalesSummary } from '../geminiService';

interface AdminViewProps {
  onBack: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [subView, setSubView] = useState<'DASHBOARD' | 'INVENTORY' | 'SALES' | 'VERIFY'>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [tokens, setTokens] = useState<ExitToken[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('Loading insights...');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{status: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const p = DB.getProducts();
    const s = DB.getSales();
    const t = DB.getTokens();
    setProducts(p);
    setSales(s);
    setTokens(t);

    const summary = await getSalesSummary(s);
    setAiSummary(summary || 'No AI summary available.');
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingProduct?.id || Date.now().toString();
    const newProduct: Product = {
      id,
      name: formData.get('name') as string,
      barcode: formData.get('barcode') as string,
      price: parseFloat(formData.get('price') as string),
      tax: parseFloat(formData.get('tax') as string),
      stock: parseInt(formData.get('stock') as string)
    };

    let updated;
    if (editingProduct) {
      updated = products.map(p => p.id === id ? newProduct : p);
    } else {
      updated = [...products, newProduct];
    }
    
    DB.saveProducts(updated);
    setProducts(updated);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      DB.saveProducts(updated);
      setProducts(updated);
    }
  };

  const handleVerifyToken = () => {
    const token = tokens.find(t => t.id === verifyTokenInput);
    if (!token) {
      setVerifyResult({ status: 'error', message: 'Token not found!' });
    } else if (token.status === 'verified') {
      setVerifyResult({ status: 'error', message: 'Token already used!' });
    } else if (token.expiresAt < Date.now()) {
      setVerifyResult({ status: 'error', message: 'Token has expired!' });
    } else {
      DB.updateToken(token.id, { status: 'verified' });
      setVerifyResult({ status: 'success', message: 'Token verified! Allow Exit.' });
      refreshData();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white px-4 py-4 flex items-center gap-3 shadow-md sticky top-0 z-10">
        <button onClick={() => subView === 'DASHBOARD' ? onBack() : setSubView('DASHBOARD')} className="p-1 hover:bg-blue-600 rounded">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">
          {subView === 'DASHBOARD' ? 'Manager Dashboard' : 
           subView === 'INVENTORY' ? 'Product Inventory' : 
           subView === 'SALES' ? 'Sales History' : 'Exit Verification'}
        </h1>
        <ShieldCheck className="w-6 h-6 text-blue-200" />
      </div>

      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {subView === 'DASHBOARD' && (
          <div className="p-4 space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Daily Revenue</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${sales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Sales Count</p>
                <p className="text-2xl font-bold text-green-600">{sales.length}</p>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-indigo-900">AI Market Insights</h3>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed italic">
                "{aiSummary}"
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setSubView('INVENTORY')}
                className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
              >
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Manage Inventory</p>
                  <p className="text-xs text-gray-500">{products.length} products listed</p>
                </div>
              </button>

              <button 
                onClick={() => setSubView('SALES')}
                className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Transaction Logs</p>
                  <p className="text-xs text-gray-500">View recent self-checkouts</p>
                </div>
              </button>

              <button 
                onClick={() => setSubView('VERIFY')}
                className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
              >
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-800">Verify Exit Tokens</p>
                  <p className="text-xs text-gray-500">Scan or enter token to approve exit</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {subView === 'INVENTORY' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Products</h2>
              <button 
                onClick={() => setEditingProduct({ id: '', name: '', barcode: '', price: 0, tax: 0, stock: 0 })}
                className="bg-blue-600 text-white p-2 rounded-full shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {editingProduct && (
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-blue-100 space-y-4">
                <h3 className="font-bold text-blue-800">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSaveProduct} className="space-y-3">
                  <input name="name" defaultValue={editingProduct.name} placeholder="Product Name" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500" required />
                  <input name="barcode" defaultValue={editingProduct.barcode} placeholder="Barcode" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct.price} placeholder="Price ($)" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500" required />
                    <input name="tax" type="number" step="0.01" defaultValue={editingProduct.tax} placeholder="Tax ($)" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500" required />
                  </div>
                  <input name="stock" type="number" defaultValue={editingProduct.stock} placeholder="Initial Stock" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500" required />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold">Save</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">BC: {p.barcode} • Stock: {p.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">${p.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setEditingProduct(p)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subView === 'SALES' && (
          <div className="p-4 space-y-3">
            {sales.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No sales recorded yet.</p>
              </div>
            ) : (
              sales.slice().reverse().map(s => (
                <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">Order #{s.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{new Date(s.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="text-lg font-black text-green-600">${s.total.toFixed(2)}</p>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                    Token: {s.tokenId} • {s.items.length} items
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {subView === 'VERIFY' && (
          <div className="p-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800">Enter Exit Token ID</h3>
              <div className="flex gap-2">
                <input 
                  value={verifyTokenInput}
                  onChange={(e) => setVerifyTokenInput(e.target.value.toUpperCase())}
                  placeholder="E.g. MART-ABCD" 
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 uppercase font-mono"
                />
                <button 
                  onClick={handleVerifyToken}
                  className="bg-blue-600 text-white px-6 rounded-lg font-bold"
                >
                  Verify
                </button>
              </div>
              {verifyResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${verifyResult.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {verifyResult.status === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                  <p className="font-medium">{verifyResult.message}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-500 uppercase px-1">Recent Active Tokens</h4>
              {tokens.filter(t => t.status === 'active').slice().reverse().map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setVerifyTokenInput(t.id)}
                  className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-left"
                >
                  <div>
                    <p className="font-mono font-bold text-gray-800">{t.id}</p>
                    <p className="text-xs text-gray-500">Issued: {new Date(t.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
