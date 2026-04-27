// src/app/components/OrderDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Edit, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShoppingBag, 
  Info,
  Building2
} from "lucide-react";

// Import UI Components
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// --- IMPORT DARI STORE ---
import { useAuthStore } from "../store";

const STATUS_STEPS = ["Pending", "Diproses", "Dicuci", "Disetrika", "Diantar", "Selesai"];

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { orders, updateOrderStatus, language } = useAuthStore();
  
  const isEditMode = location.pathname.endsWith("/edit");
  const [order, setOrder] = useState<any>(null);

  // Data Kategori Hotel untuk Label
  const hotelCategories = [
    { id: "country", name: "Hotel Country" },
    { id: "sky", name: "Hotel SKY" },
    { id: "aries", name: "Hotel Aries" },
    { id: "lumba-lumba", name: "Hotel Lumba-Lumba" },
    { id: "premier", name: "Hotel Premier" },
  ];

  useEffect(() => {
    const data = orders.find(o => o.id === id);
    if (data) {
      setOrder({ ...data });
    }
  }, [id, orders]);

  const handleSaveStatus = () => {
    if (!order) return;
    updateOrderStatus(order.id, order.status);
    alert(language === 'Indonesia' ? `Status Berhasil diperbarui!` : "Status successfully updated!");
    navigate("/orders");
  };

  if (!order) return (
    <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest">
      {language === 'Indonesia' ? "Memuat data pesanan..." : "Loading order data..."}
    </div>
  );

  const currentStatusIndex = STATUS_STEPS.indexOf(order.status);
  const hotelName = hotelCategories.find(h => h.id === order.hotelId)?.name || "Hotel";

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-left font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4 text-left">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="rounded-full hover:bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {isEditMode 
                ? (language === 'Indonesia' ? "Edit Status Pesanan" : "Edit Order Status") 
                : (language === 'Indonesia' ? "Detail Pesanan" : "Order Detail")} 
              <span className="text-blue-600 ml-2">#{order.id}</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">
              {hotelName} • Management Console
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isEditMode && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${id}/edit`)} className="rounded-xl font-bold border-none shadow-sm bg-white">
              <Edit className="w-4 h-4 mr-2 text-orange-500" /> {language === 'Indonesia' ? "Edit Data" : "Edit"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-white rounded-xl font-bold border-none shadow-sm">
            <Printer className="w-4 h-4 mr-2 text-blue-500" /> {language === 'Indonesia' ? "Cetak Struk" : "Print"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* INFO PELANGGAN */}
          <Card className="p-6 border-none shadow-sm text-left rounded-[2rem] bg-white">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="p-4 bg-blue-50 rounded-[1.5rem] text-blue-600 h-fit shadow-sm shadow-blue-100"><User size={24}/></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Nama Tamu</p>
                  <p className="font-black text-xl text-gray-900 mt-1">{order.guest}</p>
                  <Badge variant="secondary" className="mt-2 bg-blue-600 text-white border-none font-black px-3 py-1 rounded-lg">
                    {language === 'Indonesia' ? "KAMAR" : "ROOM"} {order.room}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-4 bg-green-50 rounded-[1.5rem] text-green-600 h-fit shadow-sm shadow-green-100"><Phone size={24}/></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Kontak Telepon</p>
                  <p className="font-black text-xl text-gray-900 mt-1">{order.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="printable-area space-y-6">
            {/* DETAIL LAYANAN DENGAN INFO HOTEL */}
            <Card className="p-8 border-none shadow-sm text-left rounded-[2rem] bg-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 rounded-lg"><Building2 className="w-5 h-5 text-slate-500" /></div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Detail Layanan Laundry</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-y-6 text-sm">
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Unit Hotel</span>
                <span className="font-black text-right text-blue-600 uppercase tracking-tighter text-lg">{hotelName}</span>
                
                <div className="col-span-2 h-px bg-slate-50" />

                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Jenis Layanan</span>
                <span className="font-black text-right text-gray-800 uppercase tracking-tighter">{order.service}</span>
                
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Total Berat / Qty</span>
                <span className="font-black text-right text-gray-800 uppercase tracking-tighter">{order.weight}</span>
                
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Waktu Penjemputan</span>
                <span className="font-black text-right text-gray-800 tracking-tighter">{order.date} • {order.time || 'Waktu Belum Diset'}</span>
                
                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider">Status Sekarang</span>
                <Badge className="ml-auto bg-orange-100 text-orange-600 border-none px-4 py-1 font-black uppercase text-[10px] rounded-lg">
                  {order.status}
                </Badge>
              </div>
            </Card>

            {/* RINCIAN TAGIHAN */}
            <Card className="p-8 border-none shadow-sm text-left rounded-[2rem] bg-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 rounded-lg"><ShoppingBag className="w-5 h-5 text-slate-500" /></div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Rincian Tagihan</h3>
              </div>
              <div className="space-y-5">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase">{item.qty} {order.weight.split(' ')[1] || 'Unit'}</p>
                    </div>
                    <p className="font-black text-slate-900">Rp {item.price.toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-6 bg-blue-50/30 p-6 rounded-3xl mt-4">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Tagihan Akhir</p>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase italic">*Sudah termasuk pajak & layanan</p>
                  </div>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter">{order.price}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6 no-print text-left">
          {/* TIMELINE PROSES */}
          <Card className="p-8 border-none shadow-sm rounded-[2rem] bg-white">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10 text-center">Status Tracking</h3>
            <div className="space-y-8 relative ml-4">
              <div className="absolute left-[15px] top-2 bottom-2 w-1 bg-slate-50 rounded-full"></div>
              {STATUS_STEPS.map((step, index) => {
                const isDone = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={step} className={`relative pl-12 flex flex-col items-start transition-all duration-500 ${isDone ? 'opacity-100' : 'opacity-20'}`}>
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-white z-10 flex items-center justify-center shadow-sm
                      ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-wider ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>{step}</p>
                      <p className="text-[9px] text-blue-500 font-black uppercase mt-0.5">
                        {isCurrent ? "Current Process" : isDone ? "Task Completed" : "Waiting"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* EDIT STATUS BOX */}
          {isEditMode ? (
            <Card className="p-6 space-y-4 border-none bg-blue-600 shadow-2xl shadow-blue-200 rounded-[2rem] text-left">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest text-center mb-4">Pilih Status Baru</p>
                <Select value={order.status} onValueChange={(val) => setOrder({...order, status: val})}>
                  <SelectTrigger className="w-full bg-white h-14 border-none rounded-2xl font-black text-slate-800">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    {STATUS_STEPS.map(s => <SelectItem key={s} value={s} className="font-bold py-3 uppercase text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-white text-blue-600 hover:bg-slate-50 h-14 rounded-2xl text-sm font-black transition-all shadow-lg uppercase tracking-widest" 
                onClick={handleSaveStatus}
              >
                Konfirmasi Update
              </Button>
            </Card>
          ) : (
            <div className="space-y-4 text-left">
               <Button variant="outline" className="w-full h-16 rounded-[1.5rem] font-black border-none bg-white shadow-sm text-xs uppercase tracking-widest" onClick={() => window.open(`https://wa.me/${order.phone.replace(/\D/g,'')}`)}>
                  <MessageSquare className="w-5 h-5 mr-3 text-green-500" /> WhatsApp Guest
               </Button>
               <Card className="p-6 bg-white border-dashed border-2 border-slate-100 shadow-none rounded-[1.5rem]">
                  <div className="flex gap-4 items-start">
                    <Info className="w-5 h-5 text-blue-200 mt-1 flex-shrink-0" />
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
                      Gunakan tombol <b className="text-slate-600">Edit Data</b> di bagian atas untuk memperbarui status laundry tamu secara real-time.
                    </p>
                  </div>
               </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}