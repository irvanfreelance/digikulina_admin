"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Store, Box, ShoppingCart,
  Settings, UtensilsCrossed, MonitorPlay, ChefHat, Flame
} from 'lucide-react';

const MODULES = [
  { id: 'summary', title: 'Ringkasan & Statistik', icon: LayoutDashboard, path: '/admin' },
  { id: 'pos', title: 'Kasir (POS)', icon: MonitorPlay, path: '/pos' },
  { id: 'kds', title: 'Monitor Dapur (KDS)', icon: ChefHat, path: '/kds' },
  { id: 'katalog', title: 'Katalog & Menu', icon: UtensilsCrossed, path: '/admin/katalog' },
  { id: 'inventory', title: 'Inventaris Stok', icon: Box, path: '/admin/inventory' },
  { id: 'sales', title: 'Transaksi & Penjualan', icon: ShoppingCart, path: '/admin/sales' },
  { id: 'hr_crm', title: 'HR & Pelanggan', icon: Users, path: '/admin/hr_crm' },
  { id: 'settings', title: 'Pengaturan Sistem', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl z-20 shrink-0 h-screen sticky top-0`}>
      <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-pink-500" />
            <span className="font-bold text-base text-white tracking-wide">Digikulina <span className="text-pink-500">POS</span></span>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <LayoutDashboard size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <ul className="space-y-1">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            const isActive = mod.path === '/admin' ? pathname === '/admin' : pathname.startsWith(mod.path);
            return (
              <li key={mod.id}>
                <Link
                  href={mod.path}
                  className={`w-full flex items-center px-5 py-3.5 transition-colors ${isActive ? 'bg-pink-500/10 text-pink-400 border-r-2 border-pink-500' : 'hover:bg-slate-800 hover:text-slate-100'}`}
                  title={mod.title}
                >
                  <Icon size={20} className={`${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                  {isOpen && <span className="ml-3 font-semibold text-[13px] tracking-wide">{mod.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
