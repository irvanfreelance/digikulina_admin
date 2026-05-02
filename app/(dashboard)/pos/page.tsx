"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { Store, ShoppingCart, Plus, Minus } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default function POSPage() {
    const { data: products, error, isLoading } = useSWR('/api/products', fetcher);
    const [cart, setCart] = useState<any[]>([]);
    const [orderType, setOrderType] = useState('Dine In');
    const [customerName, setCustomerName] = useState('');

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const checkout = async () => {
        if(cart.length === 0) return alert('Keranjang kosong!');
        const total = cart.reduce((sum, item) => sum + (Number(item.base_price) * item.qty), 0);
        
        try {
            // First create the order
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branch_id: 3, // Hardcoded for this demo
                    order_number: `MP-${Math.floor(100 + Math.random() * 900)}`,
                    order_type: orderType,
                    order_source: 'cashier_pos',
                    customer_name: customerName || 'Tamu',
                    subtotal: total,
                    total_amount: total,
                    payment_status: 'paid',
                    current_status: 'pending'
                })
            });
            
            const newOrder = await orderRes.json();
            
            // Create order items
            for (const item of cart) {
                await fetch('/api/order_items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: newOrder.id,
                        order_created_at: newOrder.created_at || newOrder.createdAt,
                        product_id: item.id,
                        quantity: item.qty,
                        base_price: item.base_price,
                        final_price: item.base_price
                    })
                });
            }

            alert(`Berhasil Checkout! Pesanan ${newOrder.orderNumber} langsung masuk ke Dapur.`);
            setCart([]); setCustomerName('');
        } catch (e) {
            console.error(e);
            alert('Gagal memproses pesanan.');
        }
    };

    if (isLoading) return <div className="p-6 flex items-center justify-center h-full"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div></div>;
    if (error) return <div className="p-6 text-red-500">Failed to load products.</div>;

    return (
        <div className="flex h-full bg-slate-100">
            {/* Left: Product Grid */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
                <h3 className="font-black text-xl text-slate-800 mb-4 flex items-center gap-2"><Store className="text-pink-500"/> Entri Kasir Cepat</h3>
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                    {products?.map((p: any) => (
                        <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 cursor-pointer hover:border-pink-500 hover:shadow-md transition-all group active:scale-95">
                            <div className="h-24 bg-slate-100 rounded-xl mb-3 overflow-hidden">
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => (e.currentTarget.style.display='none')}/>
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm leading-tight mb-1">{p.name}</h4>
                            <p className="text-pink-600 font-black text-sm">{formatRupiah(Number(p.base_price))}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Right: Cart Panel */}
            <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-10 shrink-0">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800 mb-3">Pesanan Baru</h3>
                    <div className="flex gap-2 bg-slate-200 p-1 rounded-lg mb-3">
                        {['Dine In', 'Take Away', 'Delivery'].map(type => (
                            <button key={type} onClick={() => setOrderType(type)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${orderType === type ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                    <input type="text" placeholder="Nama Pelanggan (Opsional)" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 font-medium" />
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <ShoppingCart size={48} className="mb-2"/>
                            <p className="font-medium">Keranjang Kosong</p>
                        </div>
                    ) : cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                <p className="text-xs text-slate-500">{formatRupiah(Number(item.base_price))}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, qty: i.qty-1} : i).filter(i => i.qty > 0))} className="text-slate-400 hover:text-pink-600"><Minus size={14}/></button>
                                <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                <button onClick={() => addToCart(item)} className="text-slate-400 hover:text-pink-600"><Plus size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-500 font-bold">Total Bayar</span>
                        <span className="text-2xl font-black text-pink-600">{formatRupiah(cart.reduce((sum, i) => sum + (Number(i.base_price) * i.qty), 0))}</span>
                    </div>
                    <button onClick={checkout} className="w-full bg-pink-600 text-white font-black py-4 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all text-lg">
                        PROSES PESANAN
                    </button>
                </div>
            </div>
        </div>
    );
}
