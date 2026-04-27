// src/app/components/Reports.tsx
import { useState, useMemo } from "react";
import {
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuthStore } from "../store";

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

interface ServiceData {
  name: string;
  value: number;
  count: number;
  color: string;
}

export function Reports() {
  const { orders, language } = useAuthStore(); // Ambil language dari store
  const [reportPeriod, setReportPeriod] = useState("month");

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, "")) || 0;
  };

  // --- LOGIKA STATISTIK (Diterjemahkan) ---
  const reportStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, curr) => acc + parsePrice(curr.price), 0);
    const avgRevenue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueGuests = new Set(orders.map((o) => o.guest)).size;

    return [
      { 
        label: language === 'Indonesia' ? "Total Pendapatan" : "Total Revenue", 
        value: `Rp ${totalRevenue.toLocaleString()}`, 
        icon: DollarSign, color: "green", change: "+12.5%" 
      },
      { 
        label: language === 'Indonesia' ? "Total Pesanan" : "Total Orders", 
        value: totalOrders.toString(), 
        icon: Package, color: "blue", change: "+8.2%" 
      },
      { 
        label: language === 'Indonesia' ? "Rata-rata Order" : "Average Order", 
        value: `Rp ${Math.round(avgRevenue).toLocaleString()}`, 
        icon: TrendingUp, color: "purple", change: "+2.1%" 
      },
      { 
        label: language === 'Indonesia' ? "Total Pelanggan" : "Total Customers", 
        value: uniqueGuests.toString(), 
        icon: Users, color: "orange", change: "+5.4%" 
      },
    ];
  }, [orders, language]); // Tambahkan language ke dependency

  // --- LOGIKA GRAFIK BULANAN (Nama Bulan Diterjemahkan) ---
  const monthlyData = useMemo(() => {
    const months = language === 'Indonesia' 
      ? ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const now = new Date();
    const result: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
      });

      const revenue = monthOrders.reduce((acc, curr) => acc + parsePrice(curr.price), 0);
      result.push({ month: mName, revenue, orders: monthOrders.length });
    }
    return result;
  }, [orders, language]);

  // --- LOGIKA DISTRIBUSI LAYANAN ---
  const serviceDistribution = useMemo(() => {
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
    if (orders.length === 0) return [];

    const counts = orders.reduce((acc: any, curr) => {
      acc[curr.service] = (acc[curr.service] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map((key, index) => ({
      name: key,
      value: Math.round((counts[key] / orders.length) * 100),
      count: counts[key],
      color: colors[index % colors.length]
    }));
  }, [orders]);

  // --- LOGIKA TAMU TERBAIK ---
  const topGuests = useMemo(() => {
    const guestMap = orders.reduce((acc: any, curr) => {
      if (!acc[curr.guest]) {
        acc[curr.guest] = { name: curr.guest, orders: 0, revenue: 0, room: curr.room };
      }
      acc[curr.guest].orders += 1;
      acc[curr.guest].revenue += parsePrice(curr.price);
      return acc;
    }, {});

    return Object.values(guestMap)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="p-6 space-y-6 text-left bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {language === 'Indonesia' ? 'Laporan Real-time' : 'Real-time Reports'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {language === 'Indonesia' ? 'Analisis cerdas berdasarkan' : 'Smart analysis based on'} {orders.length} {language === 'Indonesia' ? 'pesanan.' : 'orders.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40 bg-white border-none shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{language === 'Indonesia' ? 'Bulan Ini' : 'This Month'}</SelectItem>
              <SelectItem value="year">{language === 'Indonesia' ? 'Tahun Ini' : 'This Year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 rounded-xl">
            <Download className="w-4 h-4" /> {language === 'Indonesia' ? 'Cetak PDF' : 'Print PDF'}
          </Button>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-sm bg-white rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${
                  stat.color === 'green' ? 'bg-green-50 text-green-600' : 
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                  stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                <stat.icon size={22} />
              </div>
              <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-black">{stat.change}</Badge>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Grafik Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl">
          <h3 className="font-bold text-gray-800 mb-6">
            {language === 'Indonesia' ? 'Pertumbuhan Pendapatan' : 'Revenue Growth'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} tickFormatter={(v) => `Rp ${v/1000}k`} />
              <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl">
          <h3 className="font-bold text-gray-800 mb-6 text-left">
            {language === 'Indonesia' ? 'Volume Pesanan' : 'Order Volume'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Distribution & Top Guests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl">
          <h3 className="font-bold text-gray-800 mb-4">
            {language === 'Indonesia' ? 'Layanan Terpopuler' : 'Popular Services'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={serviceDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {serviceDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {serviceDistribution.map((s, i) => (
              <div key={i} className="flex justify-between text-xs font-bold items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-500">{s.name}</span>
                </div>
                <span className="text-gray-900 font-black">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-6 text-left">
            {language === 'Indonesia' ? 'Top 5 Pelanggan Kontributor' : 'Top 5 Customer Contributors'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                  <th className="pb-4">{language === 'Indonesia' ? 'Peringkat' : 'Rank'}</th>
                  <th className="pb-4">{language === 'Indonesia' ? 'Nama Pelanggan' : 'Customer Name'}</th>
                  <th className="pb-4 text-center">{language === 'Indonesia' ? 'No Kamar' : 'Room No'}</th>
                  <th className="pb-4 text-center">{language === 'Indonesia' ? 'Order' : 'Orders'}</th>
                  <th className="pb-4 text-right">{language === 'Indonesia' ? 'Total Transaksi' : 'Total Transaction'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topGuests.map((guest: any, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-black text-blue-600">#{index + 1}</td>
                    <td className="py-4 font-bold text-gray-900">{guest.name}</td>
                    <td className="py-4 text-center">
                      <Badge variant="outline" className="bg-gray-50 border-none font-bold text-gray-400">{guest.room}</Badge>
                    </td>
                    <td className="py-4 text-center font-medium text-gray-600">{guest.orders}x</td>
                    <td className="py-4 text-right font-black text-blue-600">Rp {guest.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}