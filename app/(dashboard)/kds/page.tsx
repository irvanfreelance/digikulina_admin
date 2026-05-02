"use client";

import React from 'react';
import useSWR from 'swr';
import { Flame, BellRing, CheckCircle2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function KDSPage() {
    const { data: orders, mutate } = useSWR('/api/orders', fetcher, { refreshInterval: 3000 });
    const { data: orderItems } = useSWR('/api/order_items', fetcher);
    const { data: products } = useSWR('/api/products', fetcher);
    const { data: tables } = useSWR('/api/tables', fetcher);

    const activeOrders = orders?.filter((o: any) => o.currentStatus === 'pending' || o.currentStatus === 'preparing') || [];

    const updateStatus = async (orderId: number, newStatus: string) => {
        // Optimistic update
        mutate(orders.map((o: any) => o.id === orderId ? { ...o, currentStatus: newStatus } : o), false);
        
        await fetch(`/api/orders`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, currentStatus: newStatus })
        });
        mutate();
    };

    return (
        <div className="h-full bg-slate-900 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            <header className="flex justify-between items-center mb-6">
                <h3 className="font-black text-2xl text-white flex items-center gap-3"><Flame className="text-pink-500" size={32}/> Monitor Dapur Utama (Hot Kitchen)</h3>
                <div className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-slate-700">
                    <BellRing size={18} className="text-amber-500 animate-pulse"/> {activeOrders.length} Antrean Aktif
                </div>
            </header>

            {activeOrders.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-slate-600">
                    <CheckCircle2 size={64} className="mb-4 opacity-50"/>
                    <p className="text-xl font-bold">Dapur Bersih. Tidak ada pesanan tertunda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeOrders.map((order: any) => {
                        const items = orderItems?.filter((i: any) => i.orderId === order.id) || [];
                        const isPending = order.currentStatus === 'pending';
                        const table = tables?.find((t: any) => t.id === order.tableId);
                        
                        return (
                            <div key={order.id} className={`bg-slate-800 rounded-2xl border-2 overflow-hidden flex flex-col shadow-2xl ${isPending ? 'border-amber-500' : 'border-blue-500'}`}>
                                <div className={`p-4 flex justify-between items-center text-white ${isPending ? 'bg-amber-500' : 'bg-blue-600'}`}>
                                    <h4 className="font-black text-2xl tracking-wider">{order.orderNumber}</h4>
                                    <span className="font-bold text-sm bg-black/20 px-3 py-1 rounded-lg uppercase">{order.orderType}</span>
                                </div>
                                <div className="px-5 py-3 border-b border-slate-700 flex justify-between text-slate-300 font-medium">
                                    <span>{order.customerName || 'Tamu'}</span>
                                    {table && <span>Meja: {table.tableNumber}</span>}
                                </div>
                                <div className="flex-1 p-5 space-y-4 bg-slate-800/50">
                                    {items.map((item: any) => {
                                        const product = products?.find((p: any) => p.id === item.productId);
                                        return (
                                            <div key={item.id} className="flex gap-4 items-center">
                                                <div className="bg-slate-700 text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0">
                                                    {item.quantity}x
                                                </div>
                                                <span className="text-lg font-bold text-white leading-tight">{product?.name || 'Item'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-4 bg-slate-900 border-t border-slate-700">
                                    {isPending ? (
                                        <button onClick={() => updateStatus(order.id, 'preparing')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-xl shadow-lg transition-colors active:scale-95">
                                            MULAI MASAK
                                        </button>
                                    ) : (
                                        <button onClick={() => updateStatus(order.id, 'completed')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-xl shadow-lg transition-colors active:scale-95">
                                            SIAP DISAJIKAN
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
