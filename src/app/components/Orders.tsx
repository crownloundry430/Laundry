// src/app/components/Orders.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import {
  Search, Download, Plus, Eye, Edit, Trash2, MoreVertical, RefreshCcw, X, Building2
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuthStore } from "../store";

export function Orders() {
  const navigate = useNavigate();
  const { orders, deleteOrder, fetchInitialData, language } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("all"); 
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const hotelCategories = [
    { id: "all", name: language === 'Indonesia' ? "Semua Hotel" : "All Hotels" },
    { id: "country", name: "Hotel Country" },
    { id: "sky", name: "Hotel SKY" },
    { id: "aries", name: "Hotel Aries" },
    { id: "lumba-lumba", name: "Hotel Lumba-Lumba" },
    { id: "premier", name: "Hotel Premier" },
  ];

  const handleRefresh = () => {
    fetchInitialData();
    setSearchQuery("");
    setStatusFilter("all");
    setHotelFilter("all");
    setOpenMenuId(null);
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) return alert(language === 'Indonesia' ? "Tidak ada data" : "No data available");
    const headers = ["No", "ID", "Hotel", "Tamu", "Kamar", "Status", "Harga"];
    const csvRows = filteredOrders.map((o, index) => [
        index + 1,
        o.id, 
        hotelCategories.find(h => h.id === o.hotelId)?.name || 'Unknown',
        `"${o.guest}"`, 
        o.room, 
        o.status, 
        `"${o.price}"`
    ].join(","));
    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laundry_report.csv`;
    link.click();
  };

  const translateStatus = (status: string) => {
    if (language === 'English') {
      const map: Record<string, string> = {
        Pending: "Pending", Diproses: "Processing", Dicuci: "Washing",
        Disetrika: "Ironing", Diantar: "Delivering", Selesai: "Completed"
      };
      return map[status] || status;
    }
    return status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Diproses: "bg-blue-100 text-blue-700",
      Dicuci: "bg-purple-100 text-purple-700",
      Disetrika: "bg-orange-100 text-orange-700",
      Selesai: "bg-green-100 text-green-700",
      Pending: "bg-gray-100 text-gray-700",
      Diantar: "bg-teal-100 text-teal-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.guest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesHotel = hotelFilter === "all" || order.hotelId === hotelFilter;
    return matchesSearch && matchesStatus && matchesHotel;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left pb-24 min-h-screen bg-slate-50 transition-colors relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{language === 'Indonesia' ? 'Daftar Pesanan' : 'Orders List'}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-Hotel Management</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-12 rounded-2xl shadow-lg shadow-blue-500/20" onClick={() => navigate("/orders/new")}>
          <Plus className="w-5 h-5 mr-2" /> {language === 'Indonesia' ? 'Pesanan Baru' : 'New Order'}
        </Button>
      </div>

      {/* FILTER TABS HOTEL */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {hotelCategories.map((hotel) => (
          <button
            key={hotel.id}
            onClick={() => setHotelFilter(hotel.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
              hotelFilter === hotel.id 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105" 
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            <Building2 size={14} />
            {hotel.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* SEARCH & STATUS FILTER */}
      <Card className="p-4 border-none shadow-sm bg-white rounded-3xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder={language === 'Indonesia' ? "Cari Nama Tamu..." : "Search Guest Name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 w-full bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="flex gap-2 h-12">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 sm:w-44 bg-slate-50 border-none rounded-2xl font-black text-slate-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'Indonesia' ? 'Semua Status' : 'All Status'}</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} variant="ghost" className="bg-slate-50 rounded-2xl px-4"><RefreshCcw size={20}/></Button>
            <Button onClick={handleExport} variant="outline" className="border-slate-200 rounded-2xl px-4"><Download size={20}/></Button>
          </div>
        </div>
      </Card>

      {/* DATA TABLE */}
      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b">
              <tr>
                <th className="py-5 px-6 w-16">No.</th> {/* KOLOM NO */}
                <th className="py-5 px-6">ID & Hotel</th>
                <th className="py-5 px-6">{language === 'Indonesia' ? 'Tamu / Kamar' : 'Guest / Room'}</th>
                <th className="py-5 px-6 text-center">Status</th>
                <th className="py-5 px-6 text-right">{language === 'Indonesia' ? 'Harga' : 'Price'}</th>
                <th className="py-5 px-6 text-center">{language === 'Indonesia' ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-5 px-6 font-bold text-slate-400 text-xs">
                    {index + 1} {/* NOMOR URUT */}
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-black text-blue-600 text-xs tracking-tighter">{order.id}</p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase mt-1">
                      <Building2 size={10} />
                      {hotelCategories.find(h => h.id === order.hotelId)?.name || 'Hotel'}
                    </p>
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-900 text-sm leading-tight">{order.guest}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Kamar {order.room}</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <Badge className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md border-none ${getStatusColor(order.status)}`}>
                      {translateStatus(order.status)}
                    </Badge>
                  </td>
                  <td className="py-5 px-6 text-right font-black text-slate-900 text-sm">{order.price}</td>
                  <td className="py-5 px-6 text-center">
                    <button 
                      onClick={() => setOpenMenuId(order.id)}
                      className="w-10 h-10 inline-flex items-center justify-center hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL AKSI */}
      {openMenuId && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpenMenuId(null)} />
          <Card className="w-full max-w-sm bg-white rounded-[2rem] p-6 z-[10000] shadow-2xl relative border-none">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Opsi Pesanan</h3>
                <button onClick={() => setOpenMenuId(null)} className="p-2 bg-slate-100 rounded-full"><X size={18}/></button>
             </div>
             <div className="space-y-3">
                <ActionButton icon={<Eye className="text-blue-500" />} label="Lihat Detail" onClick={() => navigate(`/orders/${openMenuId}`)} />
                <ActionButton icon={<Edit className="text-orange-500" />} label="Update Status" onClick={() => navigate(`/orders/${openMenuId}/edit`)} />
                <div className="h-px bg-slate-100 my-2" />
                <button 
                  onClick={() => { 
                    if(window.confirm("Hapus pesanan ini?")) deleteOrder(openMenuId!); 
                    setOpenMenuId(null); 
                  }}
                  className="w-full flex items-center p-5 rounded-2xl bg-rose-50 hover:bg-rose-100 font-bold text-rose-600"
                >
                  <Trash2 className="mr-4 text-rose-500" size={20} /> Hapus Pesanan
                </button>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ActionButton({icon, label, onClick}: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 font-bold text-slate-700 transition-colors"
    >
      <span className="mr-4">{icon}</span> {label}
    </button>
  );
}