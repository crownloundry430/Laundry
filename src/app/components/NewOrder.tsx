// src/app/components/NewOrder.tsx
import { useState, useMemo, useRef } from "react";
import { ArrowLeft, Plus, Minus, Calendar, Clock, Loader2, User, Home, Building2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useAuthStore } from "../store";

export function NewOrder() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addOrder, addNotification, language } = useAuthStore();

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // --- DATA KATEGORI HOTEL ---
  const hotelCategories = [
    { id: "country", name: "Hotel Country" },
    { id: "sky", name: "Hotel SKY" },
    { id: "aries", name: "Hotel Aries" },
    { id: "lumba-lumba", name: "Hotel Lumba-Lumba" },
    { id: "premier", name: "Hotel Premier" },
  ];

  const getTodayFormatted = () => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const getTimeNowFormatted = () => {
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const [selectedHotel, setSelectedHotel] = useState(""); 
  const [guestName, setGuestName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [selectedService, setSelectedService] = useState("wash-fold");
  const [weight, setWeight] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState(getTodayFormatted()); 
  const [pickupTime, setPickupTime] = useState(getTimeNowFormatted());
  const [instructions, setInstructions] = useState("");

  const services = [
    { id: "wash-fold", name: language === 'Indonesia' ? "Cuci Lipat" : "Wash & Fold", price: 7000, unit: "kg" },
    { id: "dry-clean", name: language === 'Indonesia' ? "Cuci Kering" : "Dry Cleaning", price: 15000, unit: "item" },
    { id: "wash-iron", name: language === 'Indonesia' ? "Cuci Setrika" : "Wash & Iron", price: 10000, unit: "kg" },
    { id: "premium", name: language === 'Indonesia' ? "Perawatan Premium" : "Premium Care", price: 25000, unit: "item" },
  ];

  const addOns = [
    { id: "eco", name: language === 'Indonesia' ? "Deterjen Ramah Lingkungan" : "Eco-Friendly Detergent", price: 2000 },
    { id: "express", name: language === 'Indonesia' ? "Layanan Kilat (24 Jam)" : "Express Service (24h)", price: 5000 },
    { id: "fragrance", name: language === 'Indonesia' ? "Pelembut & Pewangi Ekstra" : "Extra Fragrance", price: 1500 },
  ];

  const totalPrice = useMemo(() => {
    const service = services.find((s) => s.id === selectedService);
    const basePrice = service ? service.price * weight : 0;
    const addOnsPrice = selectedAddOns.reduce((acc, addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      return acc + (addon ? addon.price : 0);
    }, 0);
    return basePrice + addOnsPrice;
  }, [selectedService, weight, selectedAddOns, language]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return language === 'Indonesia' ? "Pilih Tanggal" : "Select Date";
      return date.toLocaleDateString(language === 'Indonesia' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return language === 'Indonesia' ? "Pilih Tanggal" : "Select Date"; }
  };

  const handleOrderSubmit = async () => {
    if (!selectedHotel || !guestName || !roomNumber) {
      alert(language === 'Indonesia' 
        ? "Harap pilih Hotel, Nama Tamu, dan Nomor Kamar!" 
        : "Please select Hotel, Guest Name, and Room Number!");
      return;
    }
    
    setIsSubmitting(true);
    const serviceData = services.find(s => s.id === selectedService);
    const orderId = `LND-${Math.floor(2610 + Math.random() * 1000)}`;

    try {
      await addOrder({
        id: orderId,
        hotelId: selectedHotel,
        guest: guestName,
        room: roomNumber,
        phone: "+628123456789",
        service: serviceData?.name || "",
        weight: `${weight} ${serviceData?.unit}`,
        status: "Pending",
        date: formatDateDisplay(pickupDate),
        time: pickupTime,
        price: formatIDR(totalPrice),
        items: [{ name: serviceData?.name || "", qty: weight, price: totalPrice }]
      });

      addNotification({
        id: Date.now(),
        title: language === 'Indonesia' ? "Pesanan Baru" : "New Order",
        message: language === 'Indonesia' 
          ? `Pesanan ${orderId} di ${hotelCategories.find(h => h.id === selectedHotel)?.name} berhasil.` 
          : `Order ${orderId} at ${hotelCategories.find(h => h.id === selectedHotel)?.name} created.`,
        time: Date.now(),
        isRead: false,
        link: `/orders/${orderId}`
      });

      navigate("/orders"); 
    } catch (error) {
      console.error(error);
      alert(language === 'Indonesia' ? "Gagal menyimpan pesanan." : "Failed to save order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40 text-left font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 text-left">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">
            {language === 'Indonesia' ? 'Tambah Pesanan' : 'Add New Order'}
          </h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8 max-w-4xl mx-auto">
        
        {/* 0. Pilih Hotel (Kategori) */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Pilih Kategori Hotel' : 'Select Hotel Category'}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hotelCategories.map((hotel) => (
              <Card 
                key={hotel.id}
                className={`p-4 cursor-pointer transition-all border-2 flex flex-col items-center justify-center gap-2 text-center ${selectedHotel === hotel.id ? "border-blue-600 bg-blue-50 shadow-sm" : "border-transparent bg-white shadow-sm hover:border-slate-200"}`}
                onClick={() => setSelectedHotel(hotel.id)}
              >
                <Building2 className={`w-6 h-6 ${selectedHotel === hotel.id ? "text-blue-600" : "text-slate-300"}`} />
                <span className={`text-[13px] font-bold ${selectedHotel === hotel.id ? "text-blue-700" : "text-slate-600"}`}>
                  {hotel.name}
                </span>
              </Card>
            ))}
          </div>
        </div>

        {/* 1. Informasi Tamu */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Informasi Tamu' : 'Guest Information'}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative text-left">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
              <Input placeholder={language === 'Indonesia' ? "Nama Tamu" : "Guest Name"} value={guestName} onChange={(e) => setGuestName(e.target.value)} className="pl-10 h-11 bg-white border-gray-100" />
            </div>
            <div className="relative text-left">
              <Home className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
              <Input placeholder={language === 'Indonesia' ? "Nomor Kamar" : "Room Number"} value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="pl-10 h-11 bg-white border-gray-100" />
            </div>
          </div>
        </div>

        {/* 2. Layanan Utama */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Pilih Layanan Utama' : 'Select Main Service'}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className={`p-4 cursor-pointer transition-all border-2 ${selectedService === service.id ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-transparent bg-white shadow-sm"}`} 
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedService === service.id ? "border-blue-600" : "border-slate-300"}`}>
                    {selectedService === service.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-800">{service.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Rp {service.price.toLocaleString()} / {service.unit}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 3. Berat / Jumlah */}
        <div className="space-y-4 text-left">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Berat / Jumlah' : 'Weight / Quantity'}
          </Label>
          <Card className="p-6 bg-white flex items-center justify-center gap-12 border-none shadow-sm">
            <Button variant="outline" size="icon" onClick={() => setWeight(Math.max(1, weight - 1))} className="rounded-full h-11 w-11 border-gray-100"><Minus className="w-5 h-5 text-gray-400" /></Button>
            <div className="text-center">
                <span className="text-4xl font-black text-slate-800 leading-none">{weight}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                    {services.find(s => s.id === selectedService)?.unit}
                </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setWeight(weight + 1)} className="rounded-full h-11 w-11 border-gray-100"><Plus className="w-5 h-5 text-gray-400" /></Button>
          </Card>
        </div>

        {/* 4. Layanan Tambahan */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Layanan Tambahan (Opsional)' : 'Add-ons (Optional)'}
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {addOns.map((addon) => (
              <Card 
                key={addon.id} 
                className={`p-4 bg-white border-none shadow-sm flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 ${selectedAddOns.includes(addon.id) ? "ring-1 ring-blue-500 bg-blue-50/30" : ""}`}
                onClick={() => toggleAddOn(addon.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={addon.id} 
                    checked={selectedAddOns.includes(addon.id)} 
                    onCheckedChange={() => toggleAddOn(addon.id)} 
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label htmlFor={addon.id} className="text-sm font-semibold text-slate-600 cursor-pointer">
                    {addon.name}
                  </label>
                </div>
                <span className="text-xs font-bold text-slate-400">+Rp {addon.price.toLocaleString()}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* 5. Waktu Penjemputan */}
        <div className="space-y-4">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Waktu Penjemputan' : 'Pickup Time'}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 bg-white shadow-sm border-none cursor-pointer hover:bg-blue-50 transition-colors relative" onClick={() => dateInputRef.current?.showPicker()}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'Indonesia' ? 'Tanggal' : 'Date'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 ml-6">{formatDateDisplay(pickupDate)}</p>
              <input ref={dateInputRef} type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </Card>

            <Card className="p-4 bg-white shadow-sm border-none cursor-pointer hover:bg-blue-50 transition-colors relative" onClick={() => timeInputRef.current?.showPicker()}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'Indonesia' ? 'Waktu' : 'Time'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 ml-6">{pickupTime}</p>
              <input ref={timeInputRef} type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </Card>
          </div>
        </div>

        <div className="space-y-4 pb-10">
          <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            {language === 'Indonesia' ? 'Instruksi Khusus (Opsional)' : 'Special Instructions (Optional)'}
          </Label>
          <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={language === 'Indonesia' ? "Contoh: Jangan pakai pewangi menyengat" : "Example: No strong fragrance"} className="bg-white h-12 border-none shadow-sm" />
        </div>
      </div>

      {/* Footer sticky dengan total */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 px-6 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {language === 'Indonesia' ? 'Estimasi Total' : 'Total Estimate'}
            </p>
            <p className="text-2xl font-black text-blue-600 mt-1 leading-none">{formatIDR(totalPrice)}</p>
          </div>
          <Button onClick={handleOrderSubmit} disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 h-14 text-base font-bold rounded-2xl shadow-xl shadow-blue-100 uppercase">
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : (language === 'Indonesia' ? "Buat Pesanan Sekarang" : "Create Order Now")}
          </Button>
        </div>
      </div>
    </div>
  );
}