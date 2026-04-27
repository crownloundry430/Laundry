// src/app/components/Dashboard.tsx
import { useMemo } from "react";
import { useAuthStore } from "../store";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Box, Clock, CheckCircle2, DollarSign, Truck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Button } from "./ui/button";

interface ChartData {
  name: string;
  orders: number;
}

export function Dashboard() {
  const { orders, isDarkMode, language } = useAuthStore(); // Ambil language di sini
  const navigate = useNavigate();

  // 1. STATISTIK
  const totalOrders = orders.length;
  const processing = orders.filter(o => ["Pending", "Diproses", "Dicuci", "Disetrika"].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === "Diantar").length;
  const completed = orders.filter(o => o.status === "Selesai").length;
  const revenue = orders.reduce((acc, curr) => acc + (parseInt(curr.price.replace(/[^0-9]/g, "")) || 0), 0);

  // 2. LOGIKA LINE CHART (Nama Hari Diterjemahkan)
  const lineData = useMemo(() => {
    const daysIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const selectedDays = language === 'Indonesia' ? daysIndo : daysEng;

    const result: ChartData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(new Date().getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID');
      const count = orders.filter(o => o.date === dateStr || (o.date && o.date.includes(dateStr))).length;
      result.push({ name: selectedDays[d.getDay()], orders: count });
    }
    return result;
  }, [orders, language]);

  // 3. LOGIKA PIE CHART
  const pieData = useMemo(() => {
    const counts = orders.reduce((acc: any, curr) => {
      acc[curr.service] = (acc[curr.service] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [orders]);

  const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b'];

  // Helper Translate Status
  const translateStatus = (status: string) => {
    if (language === 'English') {
      const map: Record<string, string> = {
        Pending: "Pending",
        Diproses: "Processing",
        Dicuci: "Washing",
        Disetrika: "Ironing",
        Diantar: "Delivered",
        Selesai: "Completed"
      };
      return map[status] || status;
    }
    return status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Diproses: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Dicuci: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      Disetrika: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      Diantar: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      Selesai: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'Indonesia' ? 'Dasbor' : 'Dashboard'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'Indonesia' 
            ? 'Ringkasan operasional LaundryHotel Cloud.' 
            : 'Operational summary of LaundryHotel Cloud.'}
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Box/>} label="Total" value={totalOrders} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={<Clock/>} label={language === 'Indonesia' ? 'Proses' : 'Processing'} value={processing} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" />
        <StatCard icon={<Truck/>} label={language === 'Indonesia' ? 'Kirim' : 'Delivered'} value={delivered} color="text-teal-500" bg="bg-teal-50 dark:bg-teal-900/20" />
        <StatCard icon={<CheckCircle2/>} label={language === 'Indonesia' ? 'Selesai' : 'Completed'} value={completed} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
        <div className="col-span-2 lg:col-span-1">
          <StatCard icon={<DollarSign/>} label={language === 'Indonesia' ? 'Pendapatan' : 'Income'} value={`Rp ${revenue.toLocaleString()}`} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LINE CHART */}
        <Card className="lg:col-span-2 p-6 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 uppercase text-xs tracking-widest">
            {language === 'Indonesia' ? 'Aktivitas 7 Hari Terakhir' : 'Activity Last 7 Days'}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* PIE CHART */}
        <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-center uppercase text-xs tracking-widest">
            {language === 'Indonesia' ? 'Layanan Favorit' : 'Favorite Services'}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* RECENT ORDERS TABLE */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-black text-slate-800 dark:text-white uppercase text-[10px] tracking-[0.2em]">
            {language === 'Indonesia' ? 'Pesanan Terbaru' : 'Recent Orders'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/orders")} className="text-blue-600 font-bold hover:bg-blue-50">
            {language === 'Indonesia' ? 'Lihat Semua' : 'View All'}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black border-b dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">{language === 'Indonesia' ? 'Tamu' : 'Guest'}</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">{language === 'Indonesia' ? 'Harga' : 'Price'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-black text-blue-600">{o.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">{o.guest}</td>
                  <td className="py-4 px-6 text-center">
                    <Badge className={`border-none shadow-none px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${getStatusColor(o.status)}`}>
                      {translateStatus(o.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right font-black text-slate-900 dark:text-white">{o.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({icon, label, value, color, bg}: any) {
  return (
    <Card className="p-4 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl active:scale-95">
      <div className={`p-2.5 w-fit ${bg} ${color} rounded-xl mb-3 shadow-sm`}>{icon}</div>
      <div>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{label}</p>
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{value}</h2>
      </div>
    </Card>
  );
}