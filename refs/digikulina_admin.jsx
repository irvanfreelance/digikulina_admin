import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Store, Box, ShoppingCart, 
  Settings, FileText, ChevronLeft, ChevronRight, 
  Search, Plus, Minus, Edit2, Trash2, X, Database, ListFilter,
  CheckCircle2, XCircle, Flame, ImageIcon, TicketPercent, 
  CalendarDays, Star, Wallet, UtensilsCrossed, MonitorPlay,
  ChefHat, BellRing
} from 'lucide-react';

// ============================================================================
// 1. MOCK DATABASE (Mie Pedas Juara) + Transaksi Pending untuk KDS
// ============================================================================
const initialDB = {
  brands: [{ id: 2, name: 'Mie Pedas Juara', tagline: 'Jagonya Mie Pedas No.1', brand_color: 'pink' }],
  branches: [{ id: 3, brand_id: 2, name: 'Tebet', address: 'Jl. Tebet Utara Dalam', is_active: true }],
  users: [
    { id: 5, branch_id: 3, role: 'Cashier', name: 'Putri', pin_code: '2222' },
    { id: 6, branch_id: 3, role: 'Kitchen', name: 'Chef Juna', pin_code: '3333' }
  ],
  customers: [{ id: 2, brand_id: 2, name: 'Fajar', phone: '08199999999', total_orders: 2, total_spent: 107800 }],
  table_areas: [
    { id: 3, branch_id: 3, name: 'Lantai 1 - Indoor', sort_order: 1 },
    { id: 4, branch_id: 3, name: 'Lantai 2 - Outdoor', sort_order: 2 }
  ],
  tables: [
    { id: 4, branch_id: 3, area_id: 3, table_number: 'Table 10', capacity: 4, status: 'available' },
    { id: 5, branch_id: 3, area_id: 3, table_number: 'Table 11', capacity: 4, status: 'occupied' }
  ],
  reservations: [{ id: 2, branch_id: 3, customer_id: null, table_id: 4, customer_name: 'Ibu Rina', reservation_time: '2026-04-18 20:00', status: 'pending' }],
  categories: [
    { id: 3, brand_id: 2, name: 'Paket Hemat', sort_order: 1 },
    { id: 4, brand_id: 2, name: 'Ala Carte Mie', sort_order: 2 },
    { id: 5, brand_id: 2, name: 'Dimsum', sort_order: 3 },
    { id: 6, brand_id: 2, name: 'Minuman', sort_order: 4 }
  ],
  products: [
    { id: 3, brand_id: 2, category_id: 3, name: 'Paket Combat A', base_price: 54000, image_url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=400&h=300', is_customizable: true },
    { id: 4, brand_id: 2, category_id: 4, name: 'Mie Spesial', base_price: 11000, image_url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=400&h=300', is_customizable: true },
    { id: 5, brand_id: 2, category_id: 5, name: 'Udang Keju', base_price: 10000, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400&h=300', is_customizable: false },
    { id: 9, brand_id: 2, category_id: 6, name: 'Es Teh Manis', base_price: 6000, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400&h=300', is_customizable: false }
  ],
  branch_products: [
    { id: 1, branch_id: 3, product_id: 3, is_available: true, price_override: null, track_stock: false, stock_quantity: 0 },
    { id: 2, branch_id: 3, product_id: 4, is_available: true, price_override: null, track_stock: false, stock_quantity: 0 },
    { id: 3, branch_id: 3, product_id: 5, is_available: true, price_override: null, track_stock: true, stock_quantity: 100 }
  ],
  modifier_groups: [{ id: 3, product_id: 3, name: 'Pilihan Mie (Maks 2)', is_required: true, selection_type: 'multiple' }],
  modifier_options: [{ id: 5, modifier_group_id: 3, name: 'Mie Level 1', extra_price: 0, is_default: false }],
  branch_modifier_options: [{ id: 1, branch_id: 3, modifier_option_id: 8, is_available: true, track_stock: true, stock_quantity: 200 }],
  stock_ledgers: [{ id: 1, branch_id: 3, user_id: 6, product_id: null, modifier_option_id: 8, movement_type: 'sale', quantity: -1, reference_id: 'MP-0426-099' }],
  coupons: [{ id: 2, brand_id: 2, code: 'POTONGAN10K', discount_type: 'Nominal', discount_value: 10000, min_purchase_amount: 50000 }],
  payment_methods: [{ id: 2, brand_id: 2, code: 'CASH', vendor: 'Internal', type: 'Cashier', is_active: true }],
  cashier_shifts: [{ id: 1, branch_id: 3, user_id: 5, opening_time: '10:00', opening_balance: 150000, status: 'Open' }],
  
  // Terdapat 2 transaksi pending agar KDS terlihat hidup saat pertama kali dibuka
  orders: [
    { id: 1, branch_id: 3, order_number: 'MP-001', order_type: 'Dine In', table_id: 5, customer_name: 'Bpk. Budi', total_amount: 65000, payment_status: 'Paid', current_status: 'Pending' },
    { id: 2, branch_id: 3, order_number: 'MP-002', order_type: 'Take Away', table_id: null, customer_name: 'Siska', total_amount: 22000, payment_status: 'Paid', current_status: 'Preparing' }
  ],
  order_items: [
    { id: 1, order_id: 1, product_id: 3, quantity: 1, final_price: 54000 },
    { id: 2, order_id: 1, product_id: 4, quantity: 1, final_price: 11000 },
    { id: 3, order_id: 2, product_id: 4, quantity: 2, final_price: 22000 }
  ],
  order_item_modifiers: [],
  order_reviews: [{ id: 1, order_id: 2, branch_id: 3, customer_id: 2, rating: 4, review_text: 'Pedasnya nampol, kurir juga ramah.' }],
  order_status_histories: [{ id: 1, order_id: 2, status: 'Preparing', changed_by: 'Chef Juna' }],
  tax_configs: [{ id: 1, branch_id: 3, name: 'Pajak Resto (PB1)', percentage: 10, apply_to: 'Dine In, Take Away, Delivery' }],
  kds_stations: [{ id: 1, branch_id: 3, name: 'Hot Kitchen' }],
  product_kds_routes: [{ id: 1, product_id: 3, kds_station_id: 1 }],
  payment_logs: [], notif_logs: [], payment_instructions: [], notif_templates: []
};

// ============================================================================
// 2. CONFIGURATION & GROUPING (Multi-Tab Concept)
// ============================================================================
const TABLE_CONFIGS = {
  products: { name: 'Daftar Menu', cols: [{ key: 'image_url', label: 'Gambar', type: 'image' }, { key: 'name', label: 'Nama Menu', type: 'text' }, { key: 'category_id', label: 'Kategori', type: 'relation', refTable: 'categories', refLabel: 'name' }, { key: 'base_price', label: 'Harga Dasar', type: 'currency' }] },
  categories: { name: 'Kategori', cols: [{ key: 'name', label: 'Nama Kategori', type: 'text' }, { key: 'sort_order', label: 'Urutan', type: 'number' }] },
  modifier_groups: { name: 'Grup Varian', cols: [{ key: 'product_id', label: 'Menu Terkait', type: 'relation', refTable: 'products', refLabel: 'name' }, { key: 'name', label: 'Nama Grup', type: 'text' }, { key: 'is_required', label: 'Wajib?', type: 'boolean' }] },
  modifier_options: { name: 'Opsi Varian', cols: [{ key: 'modifier_group_id', label: 'Grup Terkait', type: 'relation', refTable: 'modifier_groups', refLabel: 'name' }, { key: 'name', label: 'Pilihan', type: 'text' }, { key: 'extra_price', label: 'Tambahan Harga', type: 'currency' }] },
  
  branch_products: { name: 'Ketersediaan Menu', cols: [{ key: 'product_id', label: 'Menu', type: 'relation', refTable: 'products', refLabel: 'name' }, { key: 'is_available', label: 'Tersedia?', type: 'boolean' }, { key: 'stock_quantity', label: 'Sisa Stok Fisik', type: 'number' }] },
  branch_modifier_options: { name: 'Ketersediaan Varian', cols: [{ key: 'modifier_option_id', label: 'Varian', type: 'relation', refTable: 'modifier_options', refLabel: 'name' }, { key: 'is_available', label: 'Tersedia?', type: 'boolean' }, { key: 'stock_quantity', label: 'Sisa Stok', type: 'number' }] },
  stock_ledgers: { name: 'Riwayat Audit Stok', cols: [{ key: 'user_id', label: 'Oleh', type: 'relation', refTable: 'users', refLabel: 'name' }, { key: 'movement_type', label: 'Tipe', type: 'text' }, { key: 'quantity', label: 'Perubahan', type: 'number' }, { key: 'reference_id', label: 'Referensi', type: 'text' }] },

  orders: { name: 'Riwayat Transaksi', cols: [{ key: 'order_number', label: 'No. Struk', type: 'text' }, { key: 'order_type', label: 'Tipe', type: 'text' }, { key: 'total_amount', label: 'Total', type: 'currency' }, { key: 'current_status', label: 'Status', type: 'badge' }] },
  order_items: { name: 'Item Terjual', cols: [{ key: 'order_id', label: 'Struk', type: 'relation', refTable: 'orders', refLabel: 'order_number' }, { key: 'product_id', label: 'Menu', type: 'relation', refTable: 'products', refLabel: 'name' }, { key: 'quantity', label: 'Qty', type: 'number' }] },
  reservations: { name: 'Reservasi', cols: [{ key: 'customer_name', label: 'Atas Nama', type: 'text' }, { key: 'reservation_time', label: 'Waktu', type: 'text' }, { key: 'status', label: 'Status', type: 'badge' }] },
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

// Sidebar Navigation Structure
const MODULES = [
  { id: 'pos', title: 'Kasir (POS)', icon: MonitorPlay, type: 'app' },
  { id: 'kds', title: 'Monitor Dapur (KDS)', icon: ChefHat, type: 'app' },
  { id: 'katalog', title: 'Katalog & Menu', icon: UtensilsCrossed, type: 'tabs', tables: ['products', 'categories', 'modifier_groups', 'modifier_options'] },
  { id: 'inventory', title: 'Inventaris Stok', icon: Box, type: 'tabs', tables: ['branch_products', 'branch_modifier_options', 'stock_ledgers'] },
  { id: 'sales', title: 'Transaksi & Penjualan', icon: ShoppingCart, type: 'tabs', tables: ['orders', 'order_items', 'reservations', 'order_reviews'] },
  { id: 'hr_crm', title: 'HR & Pelanggan', icon: Users, type: 'tabs', tables: ['customers', 'coupons', 'users', 'cashier_shifts'] },
  { id: 'settings', title: 'Pengaturan Sistem', icon: Settings, type: 'tabs', tables: ['branches', 'table_areas', 'tables', 'tax_configs', 'kds_stations', 'payment_logs', 'notif_logs'] },
];

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// ============================================================================
// 3. MAIN COMPONENT: ADMIN PANEL
// ============================================================================
export default function App() {
  const [db, setDb] = useState(initialDB);
  const [activeModule, setActiveModule] = useState(MODULES[0]);
  const [activeTable, setActiveTable] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // Switch Module Handler
  const handleModuleClick = (mod) => {
      setActiveModule(mod);
      if (mod.type === 'tabs') setActiveTable(mod.tables[0]);
  };

  // Helper: Get Relational Display Name
  const getRelationDisplay = (refTable, refLabel, idValue) => {
      if (!idValue) return '-';
      const targetRow = db[refTable]?.find(r => r.id === idValue);
      return targetRow ? targetRow[refLabel] : `(ID: ${idValue})`;
  };

  // Compute Active Data based on Search
  const activeData = useMemo(() => {
    let data = db[activeTable] || [];
    const cols = TABLE_CONFIGS[activeTable]?.cols || [];
    if (globalSearch) {
      const lowerSearch = globalSearch.toLowerCase();
      data = data.filter(row => cols.some(col => {
              let valToSearch = row[col.key];
              if (col.type === 'relation') valToSearch = getRelationDisplay(col.refTable, col.refLabel, valToSearch);
              return String(valToSearch).toLowerCase().includes(lowerSearch);
      }));
    }
    return data;
  }, [db, activeTable, globalSearch]);

  const totalPages = Math.ceil(activeData.length / itemsPerPage);
  const paginatedData = activeData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setGlobalSearch('');
  }, [activeTable, activeModule]);

  // --- CRUD HANDLERS ---
  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newRecord = {};
    TABLE_CONFIGS[activeTable].cols.forEach(col => {
        let val = formData.get(col.key);
        if (col.type === 'boolean') val = val === 'true';
        if (col.type === 'number' || col.type === 'currency' || col.type === 'relation') val = val ? Number(val) : null;
        if (col.type === 'text' || col.type === 'image' || col.type === 'badge') val = val === '' ? null : val;
        newRecord[col.key] = val;
    });

    if (editingData?.id) {
        newRecord.id = editingData.id;
        setDb(prev => ({ ...prev, [activeTable]: prev[activeTable].map(row => row.id === editingData.id ? newRecord : row) }));
    } else {
        newRecord.id = Math.max(0, ...db[activeTable].map(r => r.id || 0)) + 1;
        setDb(prev => ({ ...prev, [activeTable]: [...prev[activeTable], newRecord] }));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
      if(window.confirm('Hapus data ini secara permanen?')) {
          setDb(prev => ({ ...prev, [activeTable]: prev[activeTable].filter(row => row.id !== id) }));
      }
  };

  const renderCell = (val, colConfig) => {
      if (colConfig.type === 'boolean') return val ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-slate-300" />;
      if (colConfig.type === 'currency') return <span className="font-semibold text-slate-800">{formatRupiah(val)}</span>;
      if (colConfig.type === 'relation') return <span className="font-medium text-pink-700 bg-pink-50 px-2 py-1 rounded-md text-xs">{getRelationDisplay(colConfig.refTable, colConfig.refLabel, val)}</span>;
      if (colConfig.type === 'image') {
          if (!val) return <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><ImageIcon size={16} className="text-slate-400"/></div>;
          return <img src={val} alt="preview" className="w-12 h-12 object-cover rounded-lg shadow-sm border border-slate-200" onError={(e) => e.target.style.display='none'} />;
      }
      if (colConfig.type === 'badge') {
          const color = val === 'Pending' || val === 'pending' ? 'bg-amber-500' : val === 'Preparing' ? 'bg-blue-500' : 'bg-emerald-500';
          return <span className={`uppercase text-[10px] tracking-wider font-bold text-white px-2 py-1 rounded ${color}`}>{val}</span>;
      }
      if (val === null || val === undefined) return <span className="text-slate-400 italic">-</span>;
      return <span className="text-slate-700">{String(val)}</span>;
  };

  // ==========================================================================
  // VIEW: KASIR (POS) ENTRY FORM
  // ==========================================================================
  const POSView = () => {
      const [cart, setCart] = useState([]);
      const [orderType, setOrderType] = useState('Dine In');
      const [customerName, setCustomerName] = useState('');

      const addToCart = (product) => {
          setCart(prev => {
              const existing = prev.find(i => i.id === product.id);
              if (existing) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
              return [...prev, { ...product, qty: 1 }];
          });
      };

      const checkout = () => {
          if(cart.length === 0) return alert('Keranjang kosong!');
          const total = cart.reduce((sum, item) => sum + (item.base_price * item.qty), 0);
          const newOrder = {
              id: Date.now(), branch_id: 3, order_number: `MP-${Math.floor(100 + Math.random() * 900)}`, 
              order_type: orderType, customer_name: customerName || 'Tamu',
              total_amount: total, payment_status: 'Paid', current_status: 'Pending'
          };
          const newOrderItems = cart.map(i => ({ id: Date.now() + Math.random(), order_id: newOrder.id, product_id: i.id, quantity: i.qty, final_price: i.base_price }));
          
          setDb(prev => ({
              ...prev,
              orders: [newOrder, ...prev.orders],
              order_items: [...newOrderItems, ...prev.order_items]
          }));
          
          alert(`Berhasil Checkout! Pesanan ${newOrder.order_number} langsung masuk ke Dapur.`);
          setCart([]); setCustomerName('');
      };

      return (
          <div className="flex h-full bg-slate-100">
              {/* Left: Product Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                  <h3 className="font-black text-xl text-slate-800 mb-4 flex items-center gap-2"><Store className="text-pink-500"/> Entri Kasir Cepat</h3>
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                      {db.products.map(p => (
                          <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 cursor-pointer hover:border-pink-500 hover:shadow-md transition-all group active:scale-95">
                              <div className="h-24 bg-slate-100 rounded-xl mb-3 overflow-hidden">
                                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => e.target.style.display='none'}/>
                              </div>
                              <h4 className="font-bold text-slate-700 text-sm leading-tight mb-1">{p.name}</h4>
                              <p className="text-pink-600 font-black text-sm">{formatRupiah(p.base_price)}</p>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Right: Cart Panel */}
              <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col z-10">
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
                  
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                      {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                              <ShoppingCart size={48} className="mb-2"/>
                              <p className="font-medium">Keranjang Kosong</p>
                          </div>
                      ) : cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                  <p className="text-xs text-slate-500">{formatRupiah(item.base_price)}</p>
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
                          <span className="text-2xl font-black text-pink-600">{formatRupiah(cart.reduce((sum, i) => sum + (i.base_price * i.qty), 0))}</span>
                      </div>
                      <button onClick={checkout} className="w-full bg-pink-600 text-white font-black py-4 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all text-lg">
                          PROSES PESANAN
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  // ==========================================================================
  // VIEW: KITCHEN DISPLAY SYSTEM (KDS)
  // ==========================================================================
  const KDSView = () => {
      // Hanya tampilkan pesanan yang Pending atau Preparing
      const activeOrders = db.orders.filter(o => o.current_status === 'Pending' || o.current_status === 'Preparing');

      const updateStatus = (orderId, newStatus) => {
          setDb(prev => ({
              ...prev,
              orders: prev.orders.map(o => o.id === orderId ? { ...o, current_status: newStatus } : o)
          }));
      };

      return (
          <div className="h-full bg-slate-900 p-6 overflow-y-auto">
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
                      {activeOrders.map(order => {
                          const items = db.order_items.filter(i => i.order_id === order.id);
                          const isPending = order.current_status === 'Pending';
                          return (
                              <div key={order.id} className={`bg-slate-800 rounded-2xl border-2 overflow-hidden flex flex-col shadow-2xl ${isPending ? 'border-amber-500' : 'border-blue-500'}`}>
                                  <div className={`p-4 flex justify-between items-center text-white ${isPending ? 'bg-amber-500' : 'bg-blue-600'}`}>
                                      <h4 className="font-black text-2xl tracking-wider">{order.order_number}</h4>
                                      <span className="font-bold text-sm bg-black/20 px-3 py-1 rounded-lg uppercase">{order.order_type}</span>
                                  </div>
                                  <div className="px-5 py-3 border-b border-slate-700 flex justify-between text-slate-300 font-medium">
                                      <span>{order.customer_name || 'Tamu'}</span>
                                      {order.table_id && <span>Meja: {db.tables.find(t => t.id === order.table_id)?.table_number}</span>}
                                  </div>
                                  <div className="flex-1 p-5 space-y-4 bg-slate-800/50">
                                      {items.map(item => {
                                          const product = db.products.find(p => p.id === item.product_id);
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
                                          <button onClick={() => updateStatus(order.id, 'Preparing')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-xl shadow-lg transition-colors active:scale-95">
                                              MULAI MASAK
                                          </button>
                                      ) : (
                                          <button onClick={() => updateStatus(order.id, 'Completed')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-xl shadow-lg transition-colors active:scale-95">
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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-sm font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl z-20 shrink-0 h-screen sticky top-0`}>
        <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800">
          {isSidebarOpen && (
              <div className="flex items-center gap-2">
                  <Flame size={20} className="text-pink-500" />
                  <span className="font-bold text-base text-white tracking-wide">Enterprise <span className="text-pink-500">POS</span></span>
              </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <LayoutDashboard size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
            <ul className="space-y-1">
              {MODULES.map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule.id === mod.id;
                return (
                  <li key={mod.id}>
                    <button 
                      onClick={() => handleModuleClick(mod)}
                      className={`w-full flex items-center px-5 py-3.5 transition-colors ${isActive ? 'bg-pink-500/10 text-pink-400 border-r-2 border-pink-500' : 'hover:bg-slate-800 hover:text-slate-100'}`}
                      title={mod.title}
                    >
                      <Icon size={20} className={`${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                      {isSidebarOpen && <span className="ml-3 font-semibold text-[13px] tracking-wide">{mod.title}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        
        {/* RENDER CUSTOM APPS (POS & KDS) */}
        {activeModule.type === 'app' ? (
            activeModule.id === 'pos' ? <POSView /> : <KDSView />
        ) : (
            // RENDER GENERIC TABLE TABS
            <>
                <header className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm flex flex-col">
                  {/* Top Bar */}
                  <div className="h-16 px-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="font-bold text-slate-800 text-xl tracking-tight flex items-center gap-2">
                            <activeModule.icon size={24} className="text-pink-500" /> {activeModule.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg border border-pink-200 font-bold text-xs shadow-sm">
                          <Store size={14}/> HQ Mie Pedas Juara
                      </div>
                  </div>
                  {/* Tabs */}
                  <div className="flex px-6 gap-6 overflow-x-auto scrollbar-hide border-t border-slate-100">
                      {activeModule.tables.map(tableName => (
                          <button 
                              key={tableName} onClick={() => setActiveTable(tableName)}
                              className={`py-3 text-xs font-bold uppercase tracking-wider relative whitespace-nowrap transition-colors ${activeTable === tableName ? 'text-pink-600' : 'text-slate-400 hover:text-slate-700'}`}
                          >
                              {TABLE_CONFIGS[tableName].name}
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
                            type="text" placeholder={`Cari di tabel ${TABLE_CONFIGS[activeTable].name}...`}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow shadow-sm font-medium"
                            value={globalSearch} onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
                         />
                         {globalSearch && <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14}/></button>}
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
                                      {TABLE_CONFIGS[activeTable].cols.map(col => (
                                          <th key={col.key} className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">{col.label}</th>
                                      ))}
                                      <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right sticky right-0 bg-slate-50">Aksi</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {paginatedData.length === 0 ? (
                                      <tr><td colSpan={TABLE_CONFIGS[activeTable].cols.length + 1} className="px-4 py-16 text-center text-slate-400"><Database size={40} className="mx-auto mb-3 opacity-20" /><p className="font-medium">Data Tidak Ditemukan</p></td></tr>
                                  ) : (
                                      paginatedData.map((row, idx) => (
                                          <tr key={row.id || idx} className="hover:bg-pink-50/30 transition-colors group">
                                              {TABLE_CONFIGS[activeTable].cols.map(col => (
                                                  <td key={col.key} className="px-5 py-3 max-w-[250px] truncate align-middle">{renderCell(row[col.key], col)}</td>
                                              ))}
                                              <td className="px-5 py-3 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-pink-50/10">
                                                  <button onClick={() => { setEditingData(row); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-100 rounded-lg transition-colors mr-1"><Edit2 size={16} /></button>
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
            </>
        )}
      </div>

      {/* CRUD MODAL FOR TABLE GROUPS */}
      {isModalOpen && activeModule.type === 'tabs' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                        {editingData ? <Edit2 className="text-pink-500"/> : <Plus className="text-pink-500"/>}
                        {editingData ? 'Ubah Data' : 'Tambah Data Baru'} 
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 bg-white shadow-sm border border-slate-200 p-1.5 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-5">
                    {TABLE_CONFIGS[activeTable].cols.map(col => {
                        const val = editingData ? editingData[col.key] : '';
                        if (col.type === 'relation') {
                            const options = db[col.refTable] || [];
                            return (
                                <div key={col.key}>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                    <select name={col.key} defaultValue={val || ''} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-slate-50/50">
                                        <option value="">-- Pilih {col.label} --</option>
                                        {options.map(opt => <option key={opt.id} value={opt.id}>{opt[col.refLabel]}</option>)}
                                    </select>
                                </div>
                            );
                        }
                        if (col.type === 'boolean') {
                            return (
                                <div key={col.key}>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                    <select name={col.key} defaultValue={val !== '' ? String(val) : 'true'} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-slate-50/50">
                                        <option value="true">Ya (True)</option>
                                        <option value="false">Tidak (False)</option>
                                    </select>
                                </div>
                            );
                        }
                        return (
                            <div key={col.key}>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{col.label}</label>
                                <input 
                                    type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'} 
                                    name={col.key} defaultValue={val} placeholder={`Ketik ${col.label.toLowerCase()}...`}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium bg-slate-50/50"
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

    </div>
  );
}