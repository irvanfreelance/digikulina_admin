import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  ChevronLeft, 
  Search, 
  Plus, 
  Minus, 
  Store, 
  Bike, 
  ShoppingBasket, 
  User, 
  Phone, 
  Mail, 
  QrCode, 
  Wallet, 
  CheckCircle2,
  MapPin,
  Clock,
  TicketPercent,
  Flame,
  X,
  CreditCard,
  Star,
  CalendarDays
} from 'lucide-react';

// --- MOCK DATA (Sesuai Seeder DB Enterprise - MIE PEDAS JUARA) ---
const RESTO_INFO = {
  name: "Mie Pedas Juara - Tebet",
  tagline: "Jagonya Mie Pedas No.1",
  openHours: "10:00 - 22:00",
  address: "Jl. Tebet Utara Dalam, Jakarta",
  brandColor: "pink",
  taxRate: 0.10, // PB1 10%
  serviceChargeRate: 0.05 // Service 5% (Dine In Only)
};

const RESTO_AREAS = [
  {
    id: 'area_1',
    name: 'Lantai 1 - Indoor',
    tables: [
      { id: 't10', number: 'Table 10', capacity: 4, status: 'available' },
      { id: 't11', number: 'Table 11', capacity: 4, status: 'cleaning' },
    ]
  },
  {
    id: 'area_2',
    name: 'Lantai 2 - Outdoor',
    tables: [
      { id: 'o1', number: 'Outdoor 1', capacity: 4, status: 'available' },
    ]
  }
];

const CATEGORIES = ["Paket Hemat", "Ala Carte Mie", "Dimsum", "Minuman"];

const MENU_ITEMS = [
  {
    id: 3,
    name: "Paket Combat A",
    description: "2 Porsi Mie, 2 Porsi Dimsum, 2 Minuman. Puas dan hemat!",
    price: 54000,
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=400&h=300",
    category: "Paket Hemat",
    customizable: true,
    trackStock: false, 
    modifierGroups: [
      {
        id: 'mie', name: 'Pilihan Mie (Maks 2)', isRequired: true, type: 'multiple',
        options: [
          { id: 'm_lvl1', name: 'Mie Level 1', price: 0, isDefault: true },
          { id: 'm_lvl3', name: 'Mie Level 3', price: 0, isDefault: false },
          { id: 'm_lvl5', name: 'Mie Level 5', price: 0, isDefault: false }
        ]
      },
      {
        id: 'dimsum', name: 'Pilihan Dimsum', isRequired: true, type: 'single',
        options: [
          { id: 'd_rambutan', name: 'Udang Rambutan', price: 0, isDefault: true },
          { id: 'd_keju', name: 'Udang Keju', price: 0, isDefault: false }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Mie Spesial",
    description: "Mie kenyal dengan bumbu pedas rahasia dan taburan ayam cincang.",
    price: 11000,
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=400&h=300",
    category: "Ala Carte Mie",
    customizable: true,
    trackStock: false,
    modifierGroups: [
      {
        id: 'level', name: 'Level Pedas', isRequired: true, type: 'single',
        options: [
          { id: 'lvl0', name: 'Level 0 (Original)', price: 0, isDefault: true },
          { id: 'lvl1', name: 'Level 1', price: 0, isDefault: false },
          { id: 'lvl3', name: 'Level 3', price: 0, isDefault: false }
        ]
      },
      {
        id: 'topping', name: 'Tambahan Topping', isRequired: false, type: 'multiple',
        options: [
          { id: 't_ayam', name: 'Ekstra Ayam Cincang', price: 4000, isDefault: false },
          { id: 't_pangsit', name: 'Pangsit Goreng (2pcs)', price: 3000, isDefault: false }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Udang Keju",
    description: "Dimsum ayam udang goreng dengan isian keju lumer di dalam.",
    price: 10000,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400&h=300",
    category: "Dimsum",
    customizable: false,
    trackStock: true,
    stockQty: 50 
  },
  {
    id: 8,
    name: "Udang Rambutan",
    description: "Bola daging udang goreng berbalut kulit pangsit renyah berbentuk rambutan.",
    price: 10000,
    image: "https://images.unsplash.com/photo-1626200419109-382a5c9a75ba?auto=format&fit=crop&q=80&w=400&h=300",
    category: "Dimsum",
    customizable: false,
    trackStock: true,
    stockQty: 8 
  },
  {
    id: 9,
    name: "Es Teh Manis Juara",
    description: "Es teh manis segar ukuran jumbo untuk meredakan pedas.",
    price: 6000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400&h=300",
    category: "Minuman",
    customizable: false,
    trackStock: false
  }
];

// --- UTILS ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// --- MAIN COMPONENT ---
export default function App() {
  // State: Navigation & UI Toggles
  const [currentView, setCurrentView] = useState('home'); // home, item_detail, cart, payment, success, reservation
  const [activeCategory, setActiveCategory] = useState("Paket Hemat");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State: Reservation (Enterprise Table Booking & DP)
  const [isReservationMode, setIsReservationMode] = useState(false);
  const [reservationInfo, setReservationInfo] = useState({ date: '', time: '', guests: 2, notes: '', table: null, areaName: '' });

  // State: Order Context
  const [orderType, setOrderType] = useState('dine_in'); // dine_in, pickup, delivery
  const [tableNumber, setTableNumber] = useState('Table 10');
  
  // State: Cart & Coupon
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  
  // State: Form (Payment & CRM)
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', address: '' });
  const [isMember, setIsMember] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('qris');

  // State: Success View
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Inject Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Computed Financials 
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minPurchase) {
      if (appliedCoupon.type === 'percentage') {
          discountAmount = Math.min(cartSubtotal * (appliedCoupon.value / 100), appliedCoupon.maxDiscount);
      } else if (appliedCoupon.type === 'nominal') {
          discountAmount = appliedCoupon.value;
      }
  }
  
  const afterDiscount = cartSubtotal - discountAmount;
  const pb1Tax = Math.round(afterDiscount * RESTO_INFO.taxRate);
  const serviceCharge = orderType === 'dine_in' ? Math.round(afterDiscount * RESTO_INFO.serviceChargeRate) : 0;
  const cartTotal = afterDiscount + pb1Tax + serviceCharge;
  const dpAmount = isReservationMode ? cartTotal * 0.5 : cartTotal;

  // Filter Items
  const filteredItems = useMemo(() => {
      let items = MENU_ITEMS;
      if (searchQuery.trim()) {
          items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      } else {
          items = items.filter(item => item.category === activeCategory);
      }
      return items;
  }, [activeCategory, searchQuery]);

  // Actions
  const addToCart = (item, quantity, finalPrice, selections = {}, selectionText = '', notes = '') => {
    const existingIndex = cart.findIndex(c => 
      c.id === item.id && JSON.stringify(c.selections) === JSON.stringify(selections)
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, quantity, finalPrice, selections, selectionText, notes }]);
    }
    setCurrentView('home');
  };

  const updateCartQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index) => {
     const newCart = [...cart];
     newCart.splice(index, 1);
     setCart(newCart);
     if(newCart.length === 0) setCurrentView('home');
  }

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if(type === 'dine_in' && !tableNumber) {
        setTableNumber('Table 10'); 
    }
  };

  const applyCoupon = () => {
      if (couponInput.toUpperCase() === 'POTONGAN10K') {
          setAppliedCoupon({
              code: 'POTONGAN10K',
              type: 'nominal',
              value: 10000,
              maxDiscount: null,
              minPurchase: 50000
          });
          setIsCouponModalOpen(false);
      } else {
          alert('Kode kupon tidak valid atau kuota habis.');
      }
  };

  const checkMember = () => {
      if (customerInfo.phone === '08199999999') {
          setIsMember(true);
          setCustomerInfo(prev => ({...prev, name: 'Fajar (Member)'}));
      } else {
          setIsMember(false);
          alert('Nomor belum terdaftar sebagai Member.');
      }
  };

  // --- SUB-COMPONENTS ---

  const renderHeader = (title, showBack = false, onBack = null) => (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={onBack || (() => setCurrentView('home'))} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-800 tracking-wide">{title}</h1>
          </div>
          {!showBack && (
            <div className="flex gap-2">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-100'}`}><Search size={20} /></button>
            </div>
          )}
      </div>
      {/* Search Bar Dropdown */}
      {isSearchOpen && !showBack && (
          <div className="mt-3 relative animate-in fade-in slide-in-from-top-2">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Cari menu (Paket, Mie...)" 
                 className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm font-medium"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={16}/>
                  </button>
              )}
          </div>
      )}
    </div>
  );

  const ReservationView = () => {
    const [activeArea, setActiveArea] = useState(RESTO_AREAS[0].id);

    return (
      <div className="min-h-screen bg-gray-50 pb-32 relative z-[60]">
        {renderHeader('Reservasi Meja', true)}
        <div className="p-4 space-y-4 animate-in fade-in">
          <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-pink-800 mb-2">Pesan Meja & Makanan (Pre-Order)</h3>
              <p className="text-sm text-pink-700/90 leading-relaxed">Amankan mejamu tanpa antre. Cukup selesaikan <b>Down Payment (DP) 50%</b> dari total pesanan makanan di akhir sesi ini.</p>
          </div>
          
          {/* Detail Reservasi */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
             <h4 className="font-bold text-gray-800 border-b pb-2">1. Waktu Kedatangan</h4>
             <div>
               <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Tanggal*</label>
               <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-pink-500" 
                      value={reservationInfo.date} onChange={e => setReservationInfo({...reservationInfo, date: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Jam*</label>
                   <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-pink-500" 
                          value={reservationInfo.time} onChange={e => setReservationInfo({...reservationInfo, time: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Jml Tamu*</label>
                   <input type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-pink-500" 
                          value={reservationInfo.guests} onChange={e => setReservationInfo({...reservationInfo, guests: parseInt(e.target.value)})} />
                 </div>
             </div>
          </div>

          {/* Area & Table Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h4 className="font-bold text-gray-800 border-b pb-2">2. Pilih Area & Meja</h4>
              
              {/* Area Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {RESTO_AREAS.map(area => (
                      <button 
                          key={area.id}
                          onClick={() => setActiveArea(area.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeArea === area.id ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                          {area.name}
                      </button>
                  ))}
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                  {RESTO_AREAS.find(a => a.id === activeArea).tables.map(table => {
                      const isSelected = reservationInfo.table?.id === table.id;
                      const isAvailable = table.status === 'available';
                      return (
                          <button 
                              key={table.id}
                              disabled={!isAvailable}
                              onClick={() => setReservationInfo({...reservationInfo, table: table, areaName: RESTO_AREAS.find(a => a.id === activeArea).name})}
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${!isAvailable ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' : isSelected ? 'bg-pink-50 border-pink-500 ring-1 ring-pink-500' : 'bg-white border-gray-200 hover:border-pink-300'}`}
                          >
                              <Store size={20} className={`mb-1 ${isSelected ? 'text-pink-600' : isAvailable ? 'text-gray-700' : 'text-gray-400'}`} />
                              <span className={`font-bold text-sm ${isSelected ? 'text-pink-800' : isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{table.number}</span>
                              <span className="text-[10px] text-gray-500 mt-0.5">{table.capacity} Kursi</span>
                              {!isAvailable && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded mt-1 font-bold">Penuh</span>}
                          </button>
                      );
                  })}
              </div>
              {reservationInfo.table && (
                  <div className="mt-3 p-3 bg-pink-50 border border-pink-100 rounded-xl text-sm">
                      Meja Terpilih: <span className="font-bold text-pink-800">{reservationInfo.table.number} ({reservationInfo.areaName})</span>
                  </div>
              )}
          </div>

          {/* Notes */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">3. Catatan Khusus (Opsional)</label>
             <textarea placeholder="Contoh: Minta kursi dekat jendela / High chair bayi..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-pink-500 h-24 resize-none"
                       value={reservationInfo.notes} onChange={e => setReservationInfo({...reservationInfo, notes: e.target.value})}></textarea>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] w-full max-w-md mx-auto">
          <button 
            onClick={() => {
              if(!reservationInfo.date || !reservationInfo.time) {
                  alert("Mohon lengkapi Tanggal dan Jam Kedatangan.");
                  return;
              }
              if(!reservationInfo.table) {
                  alert("Mohon pilih Meja yang tersedia.");
                  return;
              }
              setIsReservationMode(true);
              setOrderType('dine_in'); // Pastikan order_type-nya Dine In
              setCurrentView('home');
            }}
            className="w-full bg-pink-500 text-white font-black py-4 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors active:scale-95"
          >
            Lanjut Pilih Menu (Pre-Order)
          </button>
        </div>
      </div>
    );
  }

  const HomeView = () => (
    <div className="pb-28 relative">
      {/* Jika Sedang Mode Reservasi, Tampilkan Banner Notifikasi */}
      {isReservationMode && (
          <div className="bg-pink-100 text-pink-800 text-xs font-bold px-4 py-2.5 flex items-center justify-between z-30 relative shadow-sm">
              <div className="flex items-center gap-2">
                  <CalendarDays size={14} /> Reservasi: {reservationInfo.date} • {reservationInfo.time} ({reservationInfo.table?.number})
              </div>
              <button onClick={() => { setIsReservationMode(false); setCurrentView('reservation'); }} className="underline decoration-pink-400">Ubah</button>
          </div>
      )}

      {/* Resto Banner & Info (Pink/Mie Pedas Theme) */}
      <div className="bg-gradient-to-br from-pink-600 to-pink-800 text-white p-6 pb-10 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
           <div>
             <h1 className="text-3xl font-bold mb-1 tracking-tight">{RESTO_INFO.name.split('-')[0]}</h1>
             <p className="text-sm text-pink-100 font-medium">{RESTO_INFO.tagline}</p>
           </div>
           <div className="flex gap-2">
             <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="bg-white/10 p-2 rounded-full backdrop-blur-md hover:bg-white/20 transition-all"><Search size={18} /></button>
           </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute -bottom-8 -right-8 opacity-10 transform -rotate-12 pointer-events-none">
            <Flame size={160} />
        </div>
      </div>
      
      {/* Search Bar inside Banner Area (Alternative Placement) */}
      {isSearchOpen && (
          <div className="px-4 -mt-4 relative z-20 mb-6">
              <div className="relative shadow-lg rounded-xl">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                     type="text" 
                     placeholder="Cari pesananmu..." 
                     className="w-full bg-white border border-gray-100 rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-semibold text-gray-700"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     autoFocus
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded-full text-gray-500 hover:bg-gray-200">
                          <X size={14}/>
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* Info Card (Floating) */}
      <div className={`px-4 relative z-20 ${isSearchOpen ? '' : '-mt-8'}`}>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
             <div>
                <h2 className="font-bold text-gray-800 text-lg">{RESTO_INFO.name}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock size={12}/> Buka hari ini, {RESTO_INFO.openHours}
                </p>
             </div>
          </div>
          
          {/* Order Type Selector (GRID 4 Columns Termasuk Reservasi) */}
          <div className={`grid grid-cols-4 gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100 relative ${isReservationMode ? 'opacity-50 pointer-events-none' : ''}`}>
            <button 
              onClick={() => handleOrderTypeChange('dine_in')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all z-10 ${orderType === 'dine_in' ? 'bg-white shadow-sm text-pink-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Store size={18} /> Dine In
            </button>
            <button 
              onClick={() => handleOrderTypeChange('pickup')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all z-10 ${orderType === 'pickup' ? 'bg-white shadow-sm text-pink-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ShoppingBasket size={18} /> Pick Up
            </button>
            <button 
              onClick={() => handleOrderTypeChange('delivery')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all z-10 ${orderType === 'delivery' ? 'bg-white shadow-sm text-pink-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Bike size={18} /> Delivery
            </button>
            {/* Tombol Reservasi di Home */}
            <button 
              onClick={() => setCurrentView('reservation')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all z-10 text-gray-400 hover:text-gray-600`}
            >
              <CalendarDays size={18} /> Reservasi
            </button>
          </div>

          {/* Dine In Specifics */}
          {orderType === 'dine_in' && !isReservationMode && (
            <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center bg-pink-50/50 p-3 rounded-xl">
               <span className="text-sm text-pink-900 font-semibold">Nomor Meja:</span>
               <div className="flex items-center gap-3">
                 <span className="font-black text-pink-700 text-xl">{tableNumber}</span>
                 <button className="text-xs bg-pink-100 hover:bg-pink-200 text-pink-800 px-3 py-1.5 rounded-lg font-bold transition-colors">Ubah</button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories Tabs (Hide if searching) */}
      {!searchQuery && (
          <div className="mt-6 px-4 overflow-x-auto flex gap-6 border-b border-gray-200 whitespace-nowrap scrollbar-hide">
            {CATEGORIES.map((cat, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveCategory(cat)}
                className={`pb-3 text-sm font-bold tracking-wide transition-colors relative ${activeCategory === cat ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {cat}
                {activeCategory === cat && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
      )}

      {/* Menu List */}
      <div className="p-4 space-y-6">
        <div>
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 uppercase">
            {searchQuery ? `Hasil Pencarian: ${searchQuery}` : activeCategory}
          </h3>
          
          {/* Menu Rendering */}
          {(activeCategory === 'Paket Hemat' && !searchQuery) ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer"
                       onClick={() => {
                         if(item.customizable) {
                           setSelectedItem(item);
                           setCurrentView('item_detail');
                         } else {
                           addToCart(item, 1, item.price);
                         }
                       }}>
                    <div className="relative h-36 bg-gray-100 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        onError={(e) => { e.target.src = `https://placehold.co/400x300/fbcfe8/be185d?text=${encodeURIComponent(item.name)}` }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      {item.trackStock && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                              Sisa {item.stockQty}
                          </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h4 className="font-bold text-gray-800 text-sm mb-1 leading-tight">{item.name}</h4>
                      <p className="text-pink-600 font-black text-sm mb-3">{formatRupiah(item.price)}</p>
                      <div className="mt-auto">
                        <button className="w-full py-2 bg-pink-500 text-white rounded-xl text-xs font-black hover:bg-pink-600 shadow-sm transition-colors flex justify-center items-center gap-1 active:scale-95">
                          PESAN
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
             <div className="space-y-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-pink-200 transition-colors"
                       onClick={() => {
                            if(item.customizable) {
                              setSelectedItem(item);
                              setCurrentView('item_detail');
                            } else {
                              addToCart(item, 1, item.price);
                            }
                          }}
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        onError={(e) => { e.target.src = `https://placehold.co/400x300/fbcfe8/be185d?text=${encodeURIComponent(item.name)}` }}
                        className="w-full h-full object-cover" 
                      />
                      {item.trackStock && (
                          <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-[10px] text-center font-bold py-0.5">
                              Sisa {item.stockQty}
                          </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <h4 className="font-bold text-gray-800 leading-tight">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <span className="font-black text-gray-800">{formatRupiah(item.price)}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(item.customizable) {
                              setSelectedItem(item);
                              setCurrentView('item_detail');
                            } else {
                              addToCart(item, 1, item.price);
                            }
                          }}
                          className="px-5 py-2 bg-pink-500 text-white text-xs font-black rounded-xl shadow-sm shadow-pink-200 hover:bg-pink-600 transition-transform active:scale-95 tracking-wide"
                        >
                          PESAN
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-gray-400 font-medium">Belum ada menu di kategori ini</div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );

  const ItemDetailView = () => {
    const [qty, setQty] = useState(1);
    const [selections, setSelections] = useState({});

    // Initialize default selections dynamically
    useEffect(() => {
      if (selectedItem && selectedItem.modifierGroups) {
        const initialSelections = {};
        selectedItem.modifierGroups.forEach(group => {
          if (group.type === 'single') {
            const defaultOpt = group.options.find(opt => opt.isDefault) || group.options[0];
            initialSelections[group.id] = defaultOpt.id;
          } else if (group.type === 'multiple') {
            initialSelections[group.id] = [];
          }
        });
        setSelections(initialSelections);
      }
    }, [selectedItem]);

    if (!selectedItem) return null;

    // Calculate dynamic price
    let extraPrice = 0;
    let selectionTexts = [];

    if (selectedItem.modifierGroups && Object.keys(selections).length > 0) {
      selectedItem.modifierGroups.forEach(group => {
        if (group.type === 'single') {
          const selectedOptId = selections[group.id];
          const opt = group.options.find(o => o.id === selectedOptId);
          if (opt) {
            extraPrice += opt.price;
            if(!opt.isDefault) selectionTexts.push(opt.name);
          }
        } else if (group.type === 'multiple') {
          const selectedOptIds = selections[group.id] || [];
          selectedOptIds.forEach(optId => {
            const opt = group.options.find(o => o.id === optId);
            if (opt) {
              extraPrice += opt.price;
              selectionTexts.push(opt.name);
            }
          });
        }
      });
    }

    const currentFinalPrice = selectedItem.price + extraPrice;
    const currentSelectionText = selectionTexts.length > 0 ? selectionTexts.join(', ') : '';

    const handleSingleSelect = (groupId, optionId) => {
      setSelections(prev => ({ ...prev, [groupId]: optionId }));
    };

    const handleMultipleSelect = (groupId, optionId) => {
      setSelections(prev => {
        const currentSelected = prev[groupId] || [];
        if (currentSelected.includes(optionId)) {
          return { ...prev, [groupId]: currentSelected.filter(id => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...currentSelected, optionId] };
        }
      });
    };

    return (
      <div className="pb-32 bg-gray-50 min-h-screen relative z-[60]">
        <div className="relative bg-white">
          <button 
            onClick={() => setCurrentView('home')}
            className="absolute top-4 left-4 z-10 bg-white/90 p-2 rounded-full shadow-md backdrop-blur-md text-gray-700 hover:bg-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-full h-72 bg-gray-200">
             <img 
               src={selectedItem.image} 
               alt={selectedItem.name} 
               onError={(e) => { e.target.src = `https://placehold.co/400x300/fbcfe8/be185d?text=${encodeURIComponent(selectedItem.name)}` }}
               className="w-full h-full object-cover" 
             />
          </div>
          <div className="p-5 relative -mt-4 bg-white rounded-t-3xl border-t border-gray-100">
            <h2 className="text-2xl font-black text-gray-800 leading-tight">{selectedItem.name}</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{selectedItem.description}</p>
            <p className="text-xl font-black text-pink-600 mt-3">{formatRupiah(selectedItem.price)}</p>
          </div>
        </div>

        {/* Dynamic Customization Sections */}
        {selectedItem.customizable && selectedItem.modifierGroups && (
          <div className="mt-2 space-y-2">
            {selectedItem.modifierGroups.map(group => (
              <div key={group.id} className="p-5 bg-white border-y border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{group.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {group.type === 'single' ? 'Pilih salah satu' : 'Pilih sesuai selera (opsional)'}
                    </p>
                  </div>
                  {group.isRequired && (
                    <span className="bg-pink-100 text-pink-700 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide">Wajib</span>
                  )}
                </div>
                
                <div className="space-y-0">
                  {group.options.map((opt, idx) => (
                    <div key={opt.id} className={`flex justify-between items-center py-3 ${idx !== group.options.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{opt.name}</span>
                        {opt.price > 0 && <span className="text-xs font-bold text-pink-600">+{formatRupiah(opt.price)}</span>}
                      </div>
                      
                      {group.type === 'single' ? (
                        <input 
                          type="radio" 
                          name={`group_${group.id}`}
                          checked={selections[group.id] === opt.id}
                          onChange={() => handleSingleSelect(group.id, opt.id)}
                          className="w-5 h-5 accent-pink-500 bg-gray-100 border-gray-300" 
                        />
                      ) : (
                        <input 
                          type="checkbox" 
                          checked={(selections[group.id] || []).includes(opt.id)}
                          onChange={() => handleMultipleSelect(group.id, opt.id)}
                          className="w-5 h-5 accent-pink-500 rounded bg-gray-100 border-gray-300" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] w-full">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 font-semibold text-sm">Kuantitas</span>
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-pink-600 transition-colors"><Minus size={20} /></button>
              <span className="font-black w-6 text-center text-gray-800">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-gray-500 hover:text-pink-600 transition-colors"><Plus size={20} /></button>
            </div>
          </div>
          <button 
            onClick={() => addToCart(selectedItem, qty, currentFinalPrice, selections, currentSelectionText)}
            className="w-full bg-pink-500 text-white font-black py-4 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors flex justify-between px-6 active:scale-95"
          >
            <span>Tambah ke Keranjang</span>
            <span>{formatRupiah(currentFinalPrice * qty)}</span>
          </button>
        </div>
      </div>
    );
  };

  const CartView = () => (
    <div className="min-h-screen bg-gray-50 pb-40 relative z-[60]">
      {renderHeader('Keranjang Pesanan', true, () => setCurrentView('home'))}
      
      {/* Order Type Badge */}
      <div className="p-4 bg-white">
        <div className="bg-pink-50 border border-pink-100 p-3 rounded-xl flex justify-between items-center">
          <span className="text-pink-800 text-sm font-medium">Tipe Pesanan</span>
          <span className="font-black text-pink-600 flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-pink-100">
            {orderType === 'dine_in' ? (isReservationMode ? 'Reservasi & Dine In' : 'Dine In') : orderType === 'pickup' ? 'Pick Up' : 'Delivery'} 
            <CheckCircle2 size={16} className="text-pink-500"/>
          </span>
        </div>
      </div>

      <div className="px-4 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-lg text-gray-800">Daftar Item ({totalItems})</h2>
          <button onClick={() => setCurrentView('home')} className="text-pink-600 text-sm font-bold bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
             <Plus size={16}/> Tambah
          </button>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {cart.length === 0 ? (
             <div className="p-8 text-center text-gray-400">Keranjang masih kosong</div>
          ) : cart.map((item, index) => (
            <div key={index} className={`p-4 ${index !== cart.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                <button onClick={() => removeFromCart(index)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-1 rounded-md">
                    <X size={16}/>
                </button>
              </div>
              
              {item.selectionText && (
                <p className="text-xs text-gray-500 mb-2 leading-relaxed pr-8">
                  {item.selectionText}
                </p>
              )}
              
              <div className="flex justify-between items-center mt-3">
                <span className="font-black text-gray-800">{formatRupiah(item.finalPrice * item.quantity)}</span>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                  <button onClick={() => updateCartQuantity(index, -1)} className="text-gray-500 hover:text-pink-600"><Minus size={16} /></button>
                  <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(index, 1)} className="text-gray-500 hover:text-pink-600"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Payment Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
             <TicketPercent size={18} className="text-gray-400"/> Rincian Biaya
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Subtotal ({totalItems} item)</span>
              <span className="font-semibold">{formatRupiah(cartSubtotal)}</span>
            </div>
            
            {/* Discount Row */}
            {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-semibold bg-green-50 p-2 rounded-lg -mx-2">
                  <span>Diskon Promo ({appliedCoupon.code})</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
            )}
            
            {/* Taxes & Services from Schema */}
            <div className="flex justify-between text-gray-500 text-xs">
              <span>PB1 (Pajak Resto 10%)</span>
              <span>{formatRupiah(pb1Tax)}</span>
            </div>
            {orderType === 'dine_in' && (
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Service Charge (5%)</span>
                  <span>{formatRupiah(serviceCharge)}</span>
                </div>
            )}
            
            <div className="flex justify-between font-black text-lg pt-4 border-t border-gray-100 mt-2">
              <span className="text-gray-800">Total</span>
              <span className="text-pink-600">{formatRupiah(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {cart.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] w-full flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">Total Tagihan</p>
            <p className="font-black text-xl text-gray-800 leading-none">{formatRupiah(cartTotal)}</p>
          </div>
          <button 
            onClick={() => setCurrentView('payment')}
            className="bg-pink-500 text-white font-black py-3.5 px-8 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors active:scale-95"
          >
            Pilih Pembayaran
          </button>
        </div>
      )}
    </div>
  );

  const PaymentView = () => (
    <div className="min-h-screen bg-gray-50 pb-40 relative z-[60]">
      {renderHeader('Pembayaran', true, () => setCurrentView('cart'))}
      
      <div className="p-4 space-y-6">
        {/* Customer Info Form (CRM Integration) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-black text-gray-800">Data Pemesan</h2>
             {isMember && <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">Member</span>}
          </div>
          <div className="space-y-4">
            
            {/* Phone input with CRM Check */}
            <div>
                 <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">No. WhatsApp (Member)</label>
                 <div className="flex gap-2">
                     <div className="relative flex-1">
                       <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="tel" 
                         placeholder="08199999999" 
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-medium text-sm"
                         value={customerInfo.phone}
                         onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                       />
                     </div>
                     <button onClick={checkMember} className="bg-gray-800 text-white px-4 rounded-xl text-xs font-bold hover:bg-black transition-colors">Cek</button>
                 </div>
                 <p className="text-[10px] text-gray-400 mt-1">Coba ketik "08199999999" untuk simulasi Member CRM (Fajar)</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Nama Lengkap*</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Masukkan nama" 
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-pink-500 transition-all font-medium ${isMember ? 'bg-pink-50 border-pink-200 text-pink-900 font-bold' : 'focus:bg-white'}`}
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  readOnly={isMember}
                />
              </div>
            </div>

            {orderType === 'dine_in' && !isReservationMode && (
              <div className="pt-2">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Nomor Meja / Table*</label>
                <div className="relative">
                  <Store size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-600" />
                  <input 
                    type="text" 
                    value={tableNumber}
                    readOnly
                    className="w-full bg-pink-50 border border-pink-100 text-pink-900 rounded-xl pl-10 pr-4 py-3 font-black text-lg"
                  />
                </div>
              </div>
            )}

            {isReservationMode && (
              <div className="pt-2">
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Nomor Meja (Reservasi)*</label>
                <div className="relative">
                  <Store size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-600" />
                  <input 
                    type="text" 
                    value={reservationInfo.table ? `${reservationInfo.table.number} (${reservationInfo.areaName})` : 'Belum dipilih'}
                    readOnly
                    className="w-full bg-pink-50 border border-pink-100 text-pink-900 rounded-xl pl-10 pr-4 py-3 font-black text-sm"
                  />
                </div>
              </div>
            )}
            
            {orderType === 'delivery' && (
               <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                 <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Alamat Pengiriman*</label>
                 <div className="relative">
                   <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                   <textarea 
                     placeholder="Detail alamat lengkap patokan dll..." 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-medium h-24 resize-none"
                     value={customerInfo.address}
                     onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                   ></textarea>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Promo Code Button */}
        <div onClick={() => setIsCouponModalOpen(true)} className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-pink-100 transition-colors shadow-sm">
          <div className="flex items-center gap-3 text-pink-700 font-bold">
            <TicketPercent size={22} /> 
            {appliedCoupon ? (
                <div className="flex flex-col">
                   <span className="text-xs font-medium text-pink-600 uppercase tracking-wider">Kupon Digunakan</span>
                   <span>{appliedCoupon.code} (-{formatRupiah(discountAmount)})</span>
                </div>
            ) : (
                <span>Gunakan Promo / Kupon</span>
            )}
          </div>
          <ChevronLeft size={20} className="text-pink-500 rotate-180" />
        </div>

        {/* Payment Method Selector */}
        <div>
          <h2 className="font-black text-gray-800 mb-3 ml-1">Metode Pembayaran</h2>
          <div className="flex gap-3 mb-4">
            <button 
              onClick={() => setPaymentMethod('qris')} // Default online
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all font-bold ${paymentMethod !== 'cashier' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-transparent bg-white shadow-sm text-gray-500 hover:text-gray-700'}`}
            >
              <CreditCard size={20} className={paymentMethod !== 'cashier' ? 'text-pink-500' : ''} /> Bayar Online
            </button>
            <button 
              onClick={() => setPaymentMethod('cashier')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all font-bold ${paymentMethod === 'cashier' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-transparent bg-white shadow-sm text-gray-500 hover:text-gray-700'}`}
            >
              <Store size={20} className={paymentMethod === 'cashier' ? 'text-pink-500' : ''} /> Kasir (Tunai/EDC)
            </button>
          </div>

          {paymentMethod !== 'cashier' && (
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-pink-500 bg-pink-50/50' : 'border-transparent bg-white shadow-sm hover:border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100"><QrCode size={24} className="text-blue-600" /></div>
                  <span className="font-bold text-gray-800">QRIS (Semua Bank/E-Wallet)</span>
                </div>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'qris'} 
                  onChange={() => setPaymentMethod('qris')} 
                  className="w-5 h-5 accent-pink-500" 
                />
              </label>
              
              <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'ewallet' ? 'border-pink-500 bg-pink-50/50' : 'border-transparent bg-white shadow-sm hover:border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-2.5 rounded-lg border border-green-100"><Wallet size={24} className="text-green-600" /></div>
                  <span className="font-bold text-gray-800">GoPay / OVO / Dana</span>
                </div>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'ewallet'} 
                  onChange={() => setPaymentMethod('ewallet')} 
                  className="w-5 h-5 accent-pink-500" 
                />
              </label>
            </div>
          )}
        </div>

      </div>

      {/* Coupon Modal Overlay */}
      {isCouponModalOpen && (
          <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95">
                 <button onClick={() => setIsCouponModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20}/></button>
                 <h3 className="font-black text-xl mb-2 text-gray-800">Gunakan Kupon</h3>
                 <p className="text-xs text-gray-500 mb-4">Punya kode promo? Masukkan di bawah ini.</p>
                 <div className="flex gap-2 mb-4">
                     <input 
                         type="text" 
                         className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 font-bold uppercase text-gray-800 focus:outline-none focus:border-pink-500" 
                         placeholder="KODE PROMO"
                         value={couponInput}
                         onChange={(e) => setCouponInput(e.target.value)}
                     />
                     <button onClick={applyCoupon} className="bg-gray-800 text-white font-bold px-6 rounded-xl hover:bg-black transition-colors">Terapkan</button>
                 </div>
                 <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 cursor-pointer hover:bg-pink-100 transition-colors" onClick={() => setCouponInput('POTONGAN10K')}>
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-pink-700">POTONGAN10K</span>
                        <span className="text-[10px] bg-pink-200 text-pink-800 font-bold px-2 py-0.5 rounded">Tersedia</span>
                     </div>
                     <p className="text-xs text-pink-800/70">Diskon Nominal Rp 10.000 (Min. Belanja 50K)</p>
                 </div>
             </div>
          </div>
      )}

      {/* Floating Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] w-full flex items-center justify-between">
        <div className="flex flex-col cursor-pointer">
          {isReservationMode && (
              <>
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wide">Tagihan {formatRupiah(cartTotal)}</span>
                <div className="flex flex-col">
                    <span className="font-black text-2xl text-pink-600 leading-none mt-0.5">{formatRupiah(dpAmount)}</span>
                    <span className="text-[10px] text-pink-700 mt-1">Wajib Bayar DP (50%)</span>
                </div>
              </>
          )}
          {!isReservationMode && (
              <>
                 <span className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wide">Total Bayar <ChevronLeft size={14} className="rotate-90 text-gray-400"/></span>
                 <span className="font-black text-2xl text-pink-600 leading-none mt-0.5">{formatRupiah(cartTotal)}</span>
              </>
          )}
        </div>
        <button 
          onClick={() => {
            if(!customerInfo.name) {
              alert("Mohon isi Nama Lengkap terlebih dahulu.");
              return;
            }
            if(orderType === 'delivery' && !customerInfo.address) {
                alert("Mohon isi Alamat Pengiriman untuk Delivery.");
                return;
            }
            setCurrentView('success');
          }}
          className="bg-pink-500 text-white font-black py-3.5 px-6 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors active:scale-95"
        >
          {isReservationMode ? 'BAYAR DP SEKARANG' : 'BAYAR SEKARANG'}
        </button>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative z-[60]">
      <div className="w-24 h-24 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-xl shadow-green-100/50 relative">
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
        <CheckCircle2 size={48} />
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">
          {isReservationMode ? 'Reservasi & Pre-Order Berhasil!' : 'Pesanan Berhasil!'}
      </h1>
      <p className="text-gray-500 mb-8 max-w-xs leading-relaxed text-sm">
        {paymentMethod === 'cashier' 
          ? `Tunjukkan layar ini ke kasir untuk menyelesaikan pembayaran. ID Pesanan Anda:`
          : 'Pembayaran terkonfirmasi via Webhook. Staf kami sedang menyiapkan pesanan terbaik untuk Anda.'}
      </p>

      {paymentMethod === 'cashier' && (
         <div className="text-3xl font-black tracking-widest text-pink-600 mb-8 bg-pink-50 px-6 py-2 rounded-xl border border-pink-100">
           #{Math.floor(100 + Math.random() * 900)}
         </div>
      )}
      
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 w-full max-w-sm text-left mb-8 shadow-sm">
        <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
          <span className="text-gray-500 font-medium">Tipe Pesanan</span>
          <span className="font-black text-gray-800 bg-white px-2 py-0.5 rounded shadow-sm text-xs uppercase tracking-wide border border-gray-100">
              {orderType === 'dine_in' ? (isReservationMode ? 'RESERVASI' : 'DINE IN') : orderType.replace('_', ' ')}
          </span>
        </div>
        {isReservationMode && (
          <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
            <span className="text-gray-500 font-medium">Waktu Kedatangan</span>
            <span className="font-black text-gray-800 text-sm text-right">{reservationInfo.date}<br/>{reservationInfo.time} WIB</span>
          </div>
        )}
        {orderType === 'dine_in' && !isReservationMode && (
          <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
            <span className="text-gray-500 font-medium">Nomor Meja</span>
            <span className="font-black text-gray-800 text-lg">{tableNumber}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Total Terbayar {isReservationMode ? '(DP)' : ''}</span>
          <span className="font-black text-green-600 text-xl">{formatRupiah(isReservationMode ? dpAmount : cartTotal)}</span>
        </div>
      </div>

      {/* Enterprise Feature: Verified Reviews (With Textarea) */}
      {!reviewSubmitted ? (
          <div className="w-full max-w-sm bg-pink-50 border border-pink-100 rounded-2xl p-5 mb-8 animate-in fade-in">
              <h3 className="font-bold text-pink-900 mb-1">Bagaimana pesanan Anda?</h3>
              <p className="text-xs text-pink-700/80 mb-3">Bantu kami jadi lebih baik (Verified Review)</p>
              <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform active:scale-90">
                          <Star size={32} className={star <= reviewRating ? "fill-pink-400 text-pink-400" : "text-pink-200"} />
                      </button>
                  ))}
              </div>
              <textarea 
                  placeholder="Ceritakan pengalamanmu di sini (opsional)..." 
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-pink-500 mb-3 h-20 resize-none font-medium text-gray-700"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
              />
              <button 
                onClick={() => setReviewSubmitted(true)}
                disabled={reviewRating === 0}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm ${reviewRating > 0 ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200' : 'bg-pink-200 text-pink-50 cursor-not-allowed'}`}
              >
                  Kirim Penilaian
              </button>
          </div>
      ) : (
          <div className="w-full max-w-sm bg-green-50 border border-green-100 rounded-2xl p-4 mb-8 text-green-700 font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 size={20}/> Terima kasih atas ulasan Anda!
          </div>
      )}

      <button 
        onClick={() => {
          setCart([]);
          setCustomerInfo({ name: '', phone: '', email: '', address: '' });
          setAppliedCoupon(null);
          setIsMember(false);
          setReviewRating(0);
          setReviewText('');
          setReviewSubmitted(false);
          setIsReservationMode(false);
          setReservationInfo({ date: '', time: '', guests: 2, notes: '', table: null, areaName: '' });
          setCurrentView('home');
        }}
        className="w-full max-w-sm bg-gray-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-black transition-colors"
      >
        Selesai & Kembali ke Menu
      </button>
    </div>
  );

  // --- APP RENDER ---
  return (
    <div className="bg-gray-200 min-h-screen font-sans flex justify-center items-start" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      {/* Mobile Constraint Container: Menggunakan w-full dan max-w-md agar komponen absolute tetap di dalam batas HP */}
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-x-hidden overflow-y-auto">
        
        {/* View Router */}
        {currentView === 'home' && <HomeView />}
        {currentView === 'item_detail' && <ItemDetailView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'payment' && <PaymentView />}
        {currentView === 'success' && <SuccessView />}
        {currentView === 'reservation' && <ReservationView />}

        {/* Global Floating Cart Button (shows only on Home if cart has items) */}
        {currentView === 'home' && cart.length > 0 && (
          <div className="absolute bottom-6 left-4 right-4 z-40">
            <button 
              onClick={() => setCurrentView('cart')}
              className="w-full bg-pink-500 text-white p-4 rounded-2xl shadow-xl shadow-pink-300/50 flex items-center justify-between hover:bg-pink-600 transition-transform active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="relative bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <ShoppingBag size={24} />
                  <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                    {totalItems}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1">{formatRupiah(cartSubtotal)}</p>
                  <p className="text-[10px] text-pink-50 font-medium tracking-wide uppercase">Belum termasuk pajak</p>
                </div>
              </div>
              <span className="font-black text-sm bg-white text-pink-600 px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm">
                CHECK OUT <ChevronLeft size={16} className="rotate-180" />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}