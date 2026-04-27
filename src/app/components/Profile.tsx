// src/app/components/Profile.tsx
import { useState, useRef } from "react";
import {
  User,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  Award,
  Bell,
  HelpCircle,
  ArrowLeft,
  Camera,
  X,
  Languages,
  Moon,
  Sun,
  Loader2,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { useAuthStore } from "../store";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { supabase } from "../../lib/supabase";

export const Profile = () => {
  const { 
    user, logout, orders, isDarkMode, toggleTheme, updateUserPhoto,
    language, setLanguage,
    pushEnabled, setPushEnabled,
    hapticEnabled, setHapticEnabled
  } = useAuthStore();

  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (ms = 40) => {
    if (hapticEnabled && "vibrate" in navigator) navigator.vibrate(ms);
  };

  // --- LOGIKA UPLOAD FOTO PROFIL ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      triggerHaptic(50);

      // 1. Buat nama file unik berdasarkan email dan timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.email.replace(/[@.]/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `user_profiles/${fileName}`;

      // 2. Upload ke Supabase Storage (Bucket: avatars)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // 3. Ambil URL Publik
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update di Database & Store Global
      await updateUserPhoto(publicUrl);
      
      triggerHaptic(100);
      alert(language === 'Indonesia' ? "Foto profil diperbarui!" : "Profile photo updated!");
      
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    triggerHaptic(100);
    if (window.confirm(language === 'Indonesia' ? "Keluar?" : "Logout?")) {
      logout();
      navigate("/login");
    }
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-left transition-colors duration-300">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-slate-900 dark:to-slate-800 text-white pt-6 pb-28 px-6 rounded-b-[3.5rem] shadow-2xl relative">
        <button onClick={() => { triggerHaptic(); navigate(-1); }} className="mb-4 p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
            <Avatar className="w-28 h-28 border-4 border-white/30 dark:border-slate-700 shadow-2xl mb-4 relative overflow-hidden">
              <AvatarImage src={user?.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="bg-white text-blue-600 dark:bg-slate-800 text-4xl font-black">{initials}</AvatarFallback>
              
              {/* Overlay Loading saat upload */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-1" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">SINKRON...</span>
                </div>
              )}
            </Avatar>

            <div className="absolute bottom-4 right-0 p-2 bg-blue-500 rounded-full border-2 border-white shadow-lg text-white group-hover:scale-110 transition-transform">
              <Camera size={16} />
            </div>
            
            {/* Input file tersembunyi */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          <h2 className="text-2xl font-black">{user?.name}</h2>
          <p className="text-blue-100/70 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">
             {user?.role === 'admin' ? 'Administrator' : (language === 'Indonesia' ? 'Staff Operasional' : 'Operational Staff')}
          </p>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-20">
        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatMini icon={<Package className="text-blue-600"/>} val={orders?.length || 0} label={language === 'Indonesia' ? "Pesanan" : "Orders"} />
          <StatMini icon={<Award className="text-yellow-500"/>} val="98%" label={language === 'Indonesia' ? "Performa" : "Performance"} />
          <StatMini icon={<Clock className="text-orange-500"/>} val="2th" label={language === 'Indonesia' ? "Masa Kerja" : "Work Period"} />
        </div>

        {/* MENU */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{language === 'Indonesia' ? 'Pengaturan Akun' : 'Account Settings'}</p>
          <MenuCard icon={User} label={language === 'Indonesia' ? "Informasi Pribadi" : "Personal Information"} desc={language === 'Indonesia' ? "Data Lengkap" : "Full Data"} color="text-blue-600" onClick={() => { triggerHaptic(); setActiveModal('pribadi'); }} />
          <MenuCard icon={ShieldCheck} label={language === 'Indonesia' ? "Keamanan Akun" : "Account Security"} desc={language === 'Indonesia' ? "Ubah Sandi" : "Change Password"} color="text-green-600" onClick={() => { triggerHaptic(); navigate("/profile/security"); }} />
          <MenuCard icon={Settings} label={language === 'Indonesia' ? "Pengaturan Sistem" : "System Settings"} desc={language === 'Indonesia' ? "Bahasa & Tampilan" : "Language & UI"} color="text-slate-500" onClick={() => { triggerHaptic(); setActiveModal('sistem'); }} />
          <MenuCard icon={HelpCircle} label={language === 'Indonesia' ? "Pusat Bantuan" : "Help Center"} desc="Support & FAQ" color="text-indigo-500" onClick={() => { triggerHaptic(); navigate("/profile/help"); }} />

          <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-rose-50 dark:bg-rose-950/20 mt-6 group transition-all active:scale-95">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-rose-600 shadow-sm group-hover:bg-rose-600 group-hover:text-white transition-colors"><LogOut size={20} /></div>
              <div className="text-left">
                <p className="text-sm font-black text-rose-600 uppercase tracking-widest">{language === 'Indonesia' ? 'Keluar Aplikasi' : 'Logout App'}</p>
                <p className="text-[9px] text-rose-400 font-bold uppercase mt-1">{language === 'Indonesia' ? 'Akhiri sesi anda' : 'End your session'}</p>
              </div>
            </div>
            <ChevronRight className="text-rose-200" size={18} />
          </button>
        </div>
      </div>

      {/* MODAL CONTAINER */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border-none relative animate-in zoom-in-95 duration-200 overflow-hidden text-left">
            <button onClick={() => { triggerHaptic(); setActiveModal(null); }} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"><X size={20} className="dark:text-white"/></button>
            
            {activeModal === 'pribadi' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">{language === 'Indonesia' ? 'Informasi Pribadi' : 'Personal Info'}</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{language === 'Indonesia' ? 'Nama Lengkap' : 'Full Name'}</label>
                    <Input readOnly value={user?.name} className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold h-12" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{language === 'Indonesia' ? 'Email ID' : 'Email ID'}</label>
                    <Input readOnly value={user?.email} className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold h-12" />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex gap-3">
                    <ShieldCheck className="text-blue-600" size={18} />
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed italic">{language === 'Indonesia' ? 'Data ini telah diverifikasi oleh sistem pusat.' : 'This data has been verified by the central system.'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'sistem' && (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">{language === 'Indonesia' ? 'Preferensi Sistem' : 'System Preferences'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-blue-600">{isDarkMode ? <Sun className="text-amber-500" size={20}/> : <Moon size={20}/>}</div>
                      <p className="font-bold text-sm">{language === 'Indonesia' ? 'Mode Gelap' : 'Dark Mode'}</p>
                    </div>
                    <Switch checked={isDarkMode} onCheckedChange={(checked) => { triggerHaptic(); toggleTheme(checked); }} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-indigo-600"><Languages size={20}/></div>
                      <div>
                        <p className="font-bold text-sm">{language === 'Indonesia' ? 'Bahasa' : 'Language'}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase italic">{language}</p>
                      </div>
                    </div>
                    <button onClick={() => { triggerHaptic(); setLanguage(language === 'Indonesia' ? 'English' : 'Indonesia'); }} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-xl text-[10px] font-black text-blue-600 border dark:border-slate-600 uppercase">{language === 'Indonesia' ? 'Ganti' : 'Change'}</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-purple-600"><Bell size={20}/></div>
                      <p className="font-bold text-sm">{language === 'Indonesia' ? 'Notifikasi Push' : 'Push Notif'}</p>
                    </div>
                    <Switch checked={pushEnabled} onCheckedChange={(checked) => { triggerHaptic(); setPushEnabled(checked); }} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-rose-600"><Smartphone size={20}/></div>
                      <p className="font-bold text-sm">Haptic Feedback</p>
                    </div>
                    <Switch checked={hapticEnabled} onCheckedChange={(checked) => { setHapticEnabled(checked); if(checked) triggerHaptic(100); }} />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const StatMini = ({icon, val, label}: any) => (
  <Card className="p-4 flex flex-col items-center border-none shadow-xl rounded-3xl bg-white dark:bg-slate-900">
    <div className="mb-2">{icon}</div>
    <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{val}</span>
    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{label}</span>
  </Card>
);

const MenuCard = ({icon: Icon, label, desc, color, onClick}: any) => (
  <Card onClick={onClick} className="p-4 border-none shadow-sm active:scale-[0.98] transition-all cursor-pointer rounded-3xl bg-white dark:bg-slate-900 group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 transition-colors"><Icon className={`w-5 h-5 ${color}`} /></div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{label}</p>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-1 uppercase italic">{desc}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600" />
    </div>
  </Card>
);