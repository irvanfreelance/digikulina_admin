"use client";

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, UploadCloud, ImageIcon, Eye, Store, Edit2, Database, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TABLE_CONFIGS: any = {
  products: { name: 'Daftar Menu', cols: [{ key: 'image_url', label: 'Gambar', type: 'image' }, { key: 'name', label: 'Nama Menu', type: 'text' }, { key: 'category_id', label: 'Kategori', type: 'relation', refTable: 'categories', refLabel: 'name' }, { key: 'base_price', label: 'Harga Dasar', type: 'currency' }] },
  categories: { name: 'Kategori', cols: [{ key: 'name', label: 'Nama Kategori', type: 'text' }, { key: 'sort_order', label: 'Urutan', type: 'number' }] },
  modifier_groups: { name: 'Grup Varian', cols: [{ key: 'product_id', label: 'Menu Terkait', type: 'relation', refTable: 'products', refLabel: 'name' }, { key: 'name', label: 'Nama Grup', type: 'text' }, { key: 'is_required', label: 'Wajib?', type: 'boolean' }] },
  modifier_options: { name: 'Opsi Varian', cols: [{ key: 'modifier_group_id', label: 'Grup Terkait', type: 'relation', refTable: 'modifier_groups', refLabel: 'name' }, { key: 'name', label: 'Pilihan', type: 'text' }, { key: 'extra_price', label: 'Tambahan Harga', type: 'currency' }] },
  branch_products: { name: 'Ketersediaan Menu', cols: [{ key: 'product_id', label: 'Menu', type: 'relation', refTable: 'products', refLabel: 'name' }, { key: 'is_available', label: 'Tersedia?', type: 'boolean' }, { key: 'stock_quantity', label: 'Sisa Stok Fisik', type: 'number' }] },
  branch_modifier_options: { name: 'Ketersediaan Varian', cols: [{ key: 'modifier_option_id', label: 'Varian', type: 'relation', refTable: 'modifier_options', refLabel: 'name' }, { key: 'is_available', label: 'Tersedia?', type: 'boolean' }, { key: 'stock_quantity', label: 'Sisa Stok', type: 'number' }] },
  stock_ledgers: { name: 'Riwayat Audit Stok', cols: [{ key: 'user_id', label: 'Oleh', type: 'relation', refTable: 'users', refLabel: 'name' }, { key: 'movement_type', label: 'Tipe', type: 'text' }, { key: 'quantity', label: 'Perubahan', type: 'number' }, { key: 'reference_id', label: 'Referensi', type: 'text' }] },
  orders: { name: 'Riwayat Transaksi', cols: [{ key: 'order_number', label: 'No. Struk', type: 'text' }, { key: 'order_type', label: 'Tipe', type: 'text' }, { key: 'total_amount', label: 'Total', type: 'currency' }, { key: 'current_status', label: 'Status', type: 'badge' }, { key: 'vendor_payment_id', label: 'Vendor Payment ID', type: 'text' }] },
  order_items: { name: 'Item Terjual', cols: [{ key: 'order_id', label: 'Struk', type: 'relation', refTable: 'orders', refLabel: 'order_number' }, { key: 'product_id', label: 'Menu', type: 'relation', refTable: 'products', refLabel: 'name' }, { key: 'quantity', label: 'Qty', type: 'number' }] },
  reservations: { name: 'Reservasi', cols: [{ key: 'customer_name', label: 'Atas Nama', type: 'text' }, { key: 'customer_phone', label: 'No. HP', type: 'text' }, { key: 'table_id', label: 'Meja', type: 'relation', refTable: 'tables', refLabel: 'table_number' }, { key: 'reservation_time', label: 'Waktu Kedatangan', type: 'datetime' }, { key: 'guest_count', label: 'Tamu', type: 'number' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'special_request', label: 'Catatan', type: 'text' }] },
  order_reviews: { name: 'Testimoni', cols: [{ key: 'customer_id', label: 'Pelanggan', type: 'relation', refTable: 'customers', refLabel: 'name' }, { key: 'rating', label: 'Rating', type: 'number' }, { key: 'review_text', label: 'Ulasan', type: 'text' }] },
  users: { name: 'Karyawan', cols: [{ key: 'name', label: 'Nama Staf', type: 'text' }, { key: 'role', label: 'Jabatan', type: 'text' }, { key: 'pin_code', label: 'PIN Kasir', type: 'text' }] },
  cashier_shifts: { name: 'Shift Kasir', cols: [{ key: 'user_id', label: 'Kasir', type: 'relation', refTable: 'users', refLabel: 'name' }, { key: 'opening_balance', label: 'Modal Awal', type: 'currency' }, { key: 'status', label: 'Status', type: 'badge' }] },
  customers: { name: 'Data Pelanggan', cols: [{ key: 'name', label: 'Nama', type: 'text' }, { key: 'phone', label: 'No. HP', type: 'text' }, { key: 'total_orders', label: 'Kunjungan', type: 'number' }] },
  coupons: { name: 'Kupon & Promo', cols: [{ key: 'code', label: 'Kode', type: 'text' }, { key: 'discount_value', label: 'Potongan', type: 'number' }, { key: 'min_purchase_amount', label: 'Min. Belanja', type: 'currency' }] },
  branches: { name: 'Cabang', cols: [{ key: 'name', label: 'Nama Outlet', type: 'text' }, { key: 'is_active', label: 'Aktif', type: 'boolean' }] },
  table_areas: { name: 'Area Lantai', cols: [{ key: 'name', label: 'Nama Ruangan', type: 'text' }] },
  tables: { name: 'Daftar Meja', cols: [{ key: 'area_id', label: 'Area', type: 'relation', refTable: 'table_areas', refLabel: 'name' }, { key: 'table_number', label: 'No. Meja', type: 'text' }, { key: 'capacity', label: 'Kapasitas', type: 'number' }] },
  tax_configs: { name: 'Pajak & Layanan', cols: [{ key: 'name', label: 'Pajak', type: 'text' }, { key: 'percentage', label: 'Persen (%)', type: 'number' }] },
  kds_stations: { name: 'Stasiun KDS', cols: [{ key: 'name', label: 'Nama KDS', type: 'text' }] },
  payment_logs: { name: 'Logs Pembayaran', cols: [{ key: 'order_id', label: 'Order ID', type: 'text' }, { key: 'status', label: 'Status', type: 'text' }] },
  notif_logs: { name: 'Logs Notifikasi', cols: [{ key: 'destination', label: 'Tujuan', type: 'text' }, { key: 'status', label: 'Status', type: 'text' }] }
};

const TABS = ["products","categories","modifier_groups","modifier_options"];

function RelationSelect({ col, val }: { col: any, val: any }) {
    const { data } = useSWR(`/api/${col.refTable}`, fetcher);
    return (
        <select 
            name={col.key} 
            defaultValue={val !== null && val !== undefined ? String(val) : ''} 
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-white text-slate-900"
        >
            <option value="">-- Pilih ${col.label} --</option>
            {data?.map((opt: any) => (
                <option key={opt.id} value={opt.id}>{opt[col.refLabel]} (ID: {opt.id})</option>
            ))}
        </select>
    );
}

function ImageUploadInput({ col, val }: { col: any, val: any }) {
    const [imageUrl, setImageUrl] = useState(val || '');
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setIsUploading(true);
        try {
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });
            const newBlob = await response.json();
            setImageUrl(newBlob.url);
        } catch (error) {
            alert('Upload gagal');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {imageUrl && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="preview" className="object-cover w-full h-full" />
                </div>
            )}
            <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                    <UploadCloud size={16} /> {isUploading ? 'Mengunggah...' : 'Pilih Gambar'}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
                </label>
            </div>
            {/* Hidden input to pass the url to FormData */}
            <input type="hidden" name={col.key} value={imageUrl} />
        </div>
    );
}

function RelationCell({ col, val }: { col: any, val: any }) {
    const { data } = useSWR(`/api/${col.refTable}`, fetcher);
    if (!val && val !== 0) return <span className="text-slate-400 italic">-</span>;
    const opt = data?.find((o: any) => o.id === val);
    return (
        <span className="font-medium text-pink-700 bg-pink-50 px-2 py-1 rounded-md text-xs">
            {opt ? opt[col.refLabel] : `(ID: ${val})`}
        </span>
    );
}

function OrderDetailModal({ orderId, onClose }: { orderId: any, onClose: () => void }) {
    const { data: order, error } = useSWR(`/api/orders/${orderId}`, fetcher);
    
    if (error) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-lg text-red-500">Error loading details. <button onClick={onClose} className="underline text-black ml-4">Tutup</button></div></div>;
    if (!order) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-lg">Loading...</div></div>;
    if (order.error) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-lg text-red-500">Error: {order.error} <button onClick={onClose} className="underline text-black ml-4">Tutup</button></div></div>;
    if (!order.items) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="bg-white p-6 rounded-2xl w-full max-w-lg text-amber-500">Loading items... <button onClick={onClose} className="underline text-black ml-4">Tutup</button></div></div>;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="font-bold text-lg text-slate-800">Detail Pesanan: {order.order_number}</h2>
                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-2">✕</button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-white">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div><span className="text-slate-500 block text-xs">Pelanggan</span><span className="font-bold text-slate-800">{order.customer_name || '-'}</span></div>
                        <div><span className="text-slate-500 block text-xs">Tipe Pesanan</span><span className="font-bold text-slate-800">{order.order_type}</span></div>
                        <div><span className="text-slate-500 block text-xs">Status Pembayaran</span><span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">{order.payment_status}</span></div>
                        <div><span className="text-slate-500 block text-xs">Metode Pembayaran</span><span className="font-bold text-slate-800">{order.payment_method_name || order.payment_method_id}</span></div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Rincian Item</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    <th className="text-left px-3 py-2 rounded-l-lg font-bold">Item</th>
                                    <th className="text-center px-3 py-2 font-bold">Qty</th>
                                    <th className="text-right px-3 py-2 font-bold">Harga Satuan</th>
                                    <th className="text-right px-3 py-2 rounded-r-lg font-bold">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {order.items.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-3 py-3 align-top">
                                            <span className="font-semibold text-slate-800">{item.product_name}</span>
                                            {item.modifiers && item.modifiers.map((m: any, mIdx: number) => (
                                                <div key={mIdx} className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <span className="text-pink-400">+</span>
                                                    <span>{m.modifier_name}</span>
                                                    {Number(m.modifier_price) > 0 && <span className="text-pink-600 font-medium">Rp {Number(m.modifier_price).toLocaleString('id-ID')}</span>}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-3 py-3 text-center align-top">
                                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{item.quantity}</span>
                                        </td>
                                        <td className="px-3 py-3 text-right align-top text-slate-600">
                                            Rp {Number(item.final_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-3 py-3 text-right align-top font-bold text-slate-800">
                                            Rp {Number(item.final_price * item.quantity).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span></div>
                        {Number(order.discount_amount) > 0 && <div className="flex justify-between text-pink-600"><span>Diskon</span><span>-Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span></div>}
                        <div className="flex justify-between text-slate-500"><span>Pajak & Layanan</span><span>Rp {Number(order.tax_fee).toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between font-black text-lg text-slate-800 pt-3 border-t border-dashed border-slate-300"><span>Total Bayar</span><span className="text-pink-600">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span></div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-sm">Tutup</button>
                    <a href={`/api/orders/${order.id}/receipt`} target="_blank" className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 text-sm flex items-center gap-2 shadow-sm">
                        Cetak Kuitansi (PDF)
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function katalogPage() {
    const [activeTable, setActiveTable] = useState(TABS[0]);
    const { data: tableData, mutate } = useSWR(`/api/${activeTable}`, fetcher);
    
    const [globalSearch, setGlobalSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingOrderId, setViewingOrderId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);

    const activeConfig = TABLE_CONFIGS[activeTable]?.cols || [];
    const activeData = useMemo(() => {
        let data = tableData || [];
        const cols = TABLE_CONFIGS[activeTable]?.cols || [];
        if (globalSearch) {
          const lowerSearch = globalSearch.toLowerCase();
          data = data.filter((row: any) => cols.some((col: any) => {
              let valToSearch = row[col.key];
              return String(valToSearch).toLowerCase().includes(lowerSearch);
          }));
        }
        return data;
    }, [tableData, activeTable, globalSearch]);

    const totalPages = Math.ceil(activeData.length / itemsPerPage);
    const paginatedData = activeData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handleSave = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const record: any = {};
        
        TABLE_CONFIGS[activeTable].cols.forEach((col: any) => {
            let val: any = formData.get(col.key);
            if (col.type === 'boolean') val = val === 'true';
            if (col.type === 'number' || col.type === 'currency' || col.type === 'relation') val = val ? Number(val) : null;
            if (col.type === 'text' || col.type === 'image' || col.type === 'badge') val = val === '' ? null : val;
            record[col.key] = val;
        });

        if (editingData?.id) {
            record.id = editingData.id;
            await fetch(`/api/${activeTable}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
        } else {
            if (activeTable !== 'brands') {
               if(Object.keys(tableData?.[0] || {}).includes('brand_id')) record.brand_id = 2;
               if(Object.keys(tableData?.[0] || {}).includes('branch_id')) record.branch_id = 3;
            }
            await fetch(`/api/${activeTable}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
        }
        mutate();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if(window.confirm('Hapus data ini secara permanen?')) {
            await fetch(`/api/${activeTable}?id=${id}`, { method: 'DELETE' });
            mutate();
        }
    };

    const renderCell = (val: any, colConfig: any) => {
        if (colConfig.type === 'boolean') return val ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-slate-300" />;
        if (colConfig.type === 'currency') return <span className="font-semibold text-slate-800">{formatRupiah(Number(val))}</span>;
        if (colConfig.type === 'relation') return <RelationCell col={colConfig} val={val} />;
        if (colConfig.type === 'datetime') {
            if (!val) return <span className="text-slate-400 italic">-</span>;
            return <span className="text-slate-700 text-sm">{new Date(val).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>;
        }
        if (colConfig.type === 'image') {
            if (!val) return <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><ImageIcon size={16} className="text-slate-400"/></div>;
            return <img src={val} alt="preview" className="w-12 h-12 object-cover rounded-lg shadow-sm border border-slate-200" onError={(e) => (e.currentTarget.style.display='none')} />;
        }
        if (colConfig.type === 'badge') {
            const badgeMap: any = { pending: 'bg-amber-500', confirmed: 'bg-blue-500', preparing: 'bg-blue-500', completed: 'bg-emerald-500', cancelled: 'bg-red-500', delivering: 'bg-purple-500' };
            const color = badgeMap[val?.toLowerCase()] || 'bg-slate-400';
            return <span className={`uppercase text-[10px] tracking-wider font-bold text-white px-2 py-1 rounded ${color}`}>{val}</span>;
        }
        if (val === null || val === undefined) return <span className="text-slate-400 italic">-</span>;
        return <span className="text-slate-700">{String(val)}</span>;
    };

    return (
        <>
            <header className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm flex flex-col">
                <div className="h-16 px-6 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 text-xl tracking-tight capitalize">
                        Modul katalog
                    </h2>
                    <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg border border-pink-200 font-bold text-xs shadow-sm">
                        <Store size={14}/> HQ Mie Pedas Juara
                    </div>
                </div>
                <div className="flex px-6 gap-6 overflow-x-auto scrollbar-hide border-t border-slate-100">
                    {TABS.map((tableName: string) => (
                        <button 
                            key={tableName} onClick={() => { setActiveTable(tableName); setCurrentPage(1); setGlobalSearch(''); }}
                            className={`py-3 text-xs font-bold uppercase tracking-wider relative whitespace-nowrap transition-colors ${activeTable === tableName ? 'text-pink-600' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                            {TABLE_CONFIGS[tableName]?.name || tableName}
                            {activeTable === tableName && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-md"></div>}
                        </button>
                    ))}
                </div>
            </header>
            
            <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="flex justify-between items-center mb-4 gap-4">
                     <div className="relative flex-1 max-w-md">
                         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                            type="text" placeholder={`Cari di tabel ${TABLE_CONFIGS[activeTable]?.name}...`}
                            className="w-full pl-9 pr-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow shadow-sm font-medium placeholder:text-slate-400"
                            value={globalSearch} onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
                         />
                     </div>
                     <button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-pink-700 transition-colors font-bold shadow-md shadow-pink-200">
                         <Plus size={18}/> Entri Baru
                     </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200">
                                      {TABLE_CONFIGS[activeTable]?.cols.map((col: any) => (
                                          <th key={col.key} className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">{col.label}</th>
                                      ))}
                                      <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right sticky right-0 bg-slate-50">Aksi</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {paginatedData.length === 0 ? (
                                      <tr><td colSpan={(TABLE_CONFIGS[activeTable]?.cols.length || 0) + 1} className="px-4 py-16 text-center text-slate-400"><Database size={40} className="mx-auto mb-3 opacity-20" /><p className="font-medium">Data Tidak Ditemukan</p></td></tr>
                                  ) : (
                                      paginatedData.map((row: any, idx: number) => (
                                          <tr key={row.id || idx} className="hover:bg-pink-50/30 transition-colors group">
                                              {TABLE_CONFIGS[activeTable]?.cols.map((col: any) => (
                                                  <td key={col.key} className="px-5 py-3 max-w-[250px] truncate align-middle">{renderCell(row[col.key], col)}</td>
                                              ))}
                                              <td className="p-4 flex gap-2 justify-end">
                                                {activeTable === 'orders' && (
                                                    <button onClick={() => setViewingOrderId(row.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Eye size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => { setEditingData(row); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Pencil size={18} /></button>
                                                  <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                              </td>
                                          </tr>
                                      ))
                                  )}
                              </tbody>
                          </table>
                      </div>
                      <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold">Menampilkan {activeData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, activeData.length)} dari total {activeData.length} entri</span>
                          <div className="flex gap-1.5">
                              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-100 shadow-sm"><ChevronLeft size={16} /></button>
                              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-100 shadow-sm"><ChevronRight size={16} /></button>
                          </div>
                      </div>
                  </div>
            </main>

            {viewingOrderId && <OrderDetailModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
                            <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                                {editingData ? <Edit2 className="text-pink-500"/> : <Plus className="text-pink-500"/>}
                                {editingData ? 'Ubah Data' : 'Tambah Data Baru'} 
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white shadow-sm border border-slate-200 p-1.5 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-5">
                            {TABLE_CONFIGS[activeTable]?.cols.map((col: any) => {
                                const val = editingData ? (editingData[col.key] ?? '') : '';
                                if (col.type === 'boolean') {
                                    return (
                                        <div key={col.key}>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                            <select name={col.key} defaultValue={val !== '' ? String(val) : 'true'} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-white text-slate-900">
                                                <option value="true">Ya (True)</option>
                                                <option value="false">Tidak (False)</option>
                                            </select>
                                        </div>
                                    );
                                }
                                if (col.type === 'relation') {
                                    return (
                                        <div key={col.key}>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                            <RelationSelect col={col} val={val} />
                                        </div>
                                    );
                                }
                                if (col.type === 'image') {
                                    return (
                                        <div key={col.key}>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                            <ImageUploadInput col={col} val={val} />
                                        </div>
                                    );
                                }
                                if (col.type === 'datetime') {
                                    // Convert ISO datetime to datetime-local format
                                    const dtVal = val ? new Date(val).toISOString().slice(0, 16) : '';
                                    return (
                                        <div key={col.key}>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                            <input 
                                                type="datetime-local" 
                                                name={col.key} defaultValue={dtVal}
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-white text-slate-900"
                                            />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={col.key}>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                        <input 
                                            type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'} 
                                            name={col.key} defaultValue={val ?? ''} placeholder={`Ketik ${col.label.toLowerCase()}...`}
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-white text-slate-900 placeholder:text-slate-400"
                                        />
                                    </div>
                                );
                            })}
                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                                <button type="submit" className="px-8 py-3 text-sm font-black text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-lg shadow-pink-200 active:scale-95 transition-all">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
