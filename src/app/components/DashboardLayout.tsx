// src/app/components/DashboardLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardCheck,
  FileText,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Calendar,
  Wallet // 1. Tambahkan icon Wallet untuk Gaji
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuthStore } from "../store";

// Import Dropdown untuk Notifikasi
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    user, 
    logout, 
    notifications, 
    fetchInitialData, 
    isDarkMode, 
    language, 
    markAllRead,
    markAsRead 
  } = useAuthStore();
  
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 2. Tambahkan "Kelola Gaji" ke dalam array navigation
  const navigation = [
    { 
      name: language === 'Indonesia' ? "Dasbor" : "Dashboard", 
      href: "/", 
      icon: LayoutDashboard, 
      role: ['admin'] 
    },
    { 
      name: language === 'Indonesia' ? "Pesanan" : "Orders", 
      href: "/orders", 
      icon: Package, 
      role: ['admin'] 
    },
    { 
      name: language === 'Indonesia' ? "Karyawan" : "Employees", 
      href: "/employees", 
      icon: Users, 
      role: ['admin'] 
    },
    { 
      name: language === 'Indonesia' ? "Absensi" : "Attendance", 
      href: "/attendance", 
      icon: ClipboardCheck, 
      role: ['admin', 'karyawan'] 
    },
    { 
      name: language === 'Indonesia' ? "Kelola Gaji" : "Payroll", // ITEM BARU
      href: "/salary", 
      icon: Wallet, 
      role: ['admin'] 
    },
    { 
      name: language === 'Indonesia' ? "Laporan" : "Reports", 
      href: "/reports", 
      icon: FileText, 
      role: ['admin'] 
    },
  ].filter(item => item.role.includes(user?.role || ''));

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??";

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">LaundryHotel</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
              {language === 'Indonesia' ? 'Manajemen' : 'Management'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5 text-gray-400" />
        </Button>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 text-left">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              to={item.href} 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.href ? "bg-blue-600 text-white font-bold shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div 
          onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer group ${location.pathname === "/profile" ? "bg-blue-50 border-blue-200" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:bg-blue-50 shadow-sm"}`}
        >
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md group-hover:scale-110 transition-transform">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-none mb-1">{user?.name}</p>
            <p className="text-[9px] text-gray-400 truncate uppercase font-bold tracking-tighter italic">
              {language === 'Indonesia' ? 'Buka Profil' : 'View Profile'}
            </p>
          </div>
          <ChevronRight className="w-3 h-3 text-gray-300" />
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); handleLogout(); }}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={10} /> 
          {language === 'Indonesia' ? 'Keluar' : 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-full">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent />
        </aside>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 z-40 transition-colors">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden dark:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            {user?.role === 'admin' && !location.pathname.startsWith("/profile") && (
              <div className="relative hidden md:block animate-in fade-in duration-300">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder={language === 'Indonesia' ? 'Cari sesuatu...' : 'Search something...'} 
                  className="pl-10 w-64 lg:w-80 bg-gray-50 dark:bg-slate-800 border-none rounded-xl dark:text-white" 
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 rounded-[2rem] shadow-2xl border-none bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
                      {language === 'Indonesia' ? 'Notifikasi Terbaru' : 'Recent Notifications'}
                    </h3>
                    <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 hover:underline uppercase">
                      {language === 'Indonesia' ? 'Baca Semua' : 'Mark All Read'}
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <DropdownMenuItem 
                          key={n.id} 
                          onClick={() => {
                            if (typeof markAsRead === 'function') markAsRead(n.id);
                            navigate(n.link || "/notifications");
                          }}
                          className={`p-4 cursor-pointer flex flex-col items-start gap-1 focus:bg-blue-50 dark:focus:bg-slate-800 border-none rounded-none border-b border-slate-50 dark:border-slate-800 last:border-0 ${!n.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex justify-between w-full items-center">
                             <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{n.title}</span>
                             <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                               <Calendar size={10} /> {new Date(n.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
                        {language === 'Indonesia' ? 'Tidak ada notifikasi' : 'No notifications'}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate("/notifications")}
                    className="w-full py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-t border-slate-50 dark:border-slate-800"
                  >
                    {language === 'Indonesia' ? 'Lihat Semua Aktivitas' : 'See All Activities'}
                  </button>
                </DropdownMenuContent>
             </DropdownMenu>

             <div className="h-8 w-[1px] bg-gray-100 dark:bg-slate-800 mx-1 hidden sm:block" />
             <div 
               onClick={() => navigate("/profile")}
               className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-100 dark:hover:ring-slate-700 transition-all"
             >
                <span className="text-xs font-black text-slate-500 dark:text-slate-300">{initials}</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}