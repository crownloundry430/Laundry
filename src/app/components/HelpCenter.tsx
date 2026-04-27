// src/app/components/HelpCenter.tsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store'; // Import store
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

export const HelpCenter = () => {
  const navigate = useNavigate();
  const { language } = useAuthStore(); // Ambil language dari store
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // DATA FAQ DENGAN DUKUNGAN BAHASA
  const faqs = [
    {
      question: language === 'Indonesia' ? "Bagaimana cara ganti password?" : "How to change password?",
      answer: language === 'Indonesia' 
        ? "Buka menu 'Profil', pilih 'Keamanan Akun'. Masukkan password lama Anda dan ketik password baru dua kali untuk konfirmasi."
        : "Go to 'Profile' menu, select 'Account Security'. Enter your old password and type the new password twice to confirm.",
      category: language === 'Indonesia' ? "Keamanan" : "Security"
    },
    {
      question: language === 'Indonesia' ? "Cara mengaktifkan Biometrik?" : "How to enable Biometrics?",
      answer: language === 'Indonesia'
        ? "Pastikan perangkat mendukung Fingerprint/FaceID. Masuk ke menu Keamanan Akun, aktifkan toggle 'Biometrik' dan ikuti instruksi pemindaian."
        : "Ensure your device supports Fingerprint/FaceID. Go to Account Security, enable 'Biometric' toggle and follow the scan instructions.",
      category: language === 'Indonesia' ? "Keamanan" : "Security"
    },
    {
      question: language === 'Indonesia' ? "Lupa password saat login?" : "Forgot password during login?",
      answer: language === 'Indonesia'
        ? "Jika Anda tidak bisa masuk, silakan hubungi Admin IT melalui WhatsApp atau datang langsung ke ruang operasional untuk reset password."
        : "If you cannot log in, please contact IT Admin via WhatsApp or come directly to the operational room for a password reset.",
      category: language === 'Indonesia' ? "Akses" : "Access"
    },
    {
      question: language === 'Indonesia' ? "Data orderan tidak muncul?" : "Order data not appearing?",
      answer: language === 'Indonesia'
        ? "Pastikan koneksi internet stabil. Coba tarik layar ke bawah (pull-to-refresh) atau pastikan Anda sudah melakukan sinkronisasi di dashboard."
        : "Ensure your internet connection is stable. Try pulling the screen down (pull-to-refresh) or make sure you have synchronized on the dashboard.",
      category: language === 'Indonesia' ? "Operasional" : "Operational"
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 px-6 py-8 border-b dark:border-slate-800 sticky top-0 z-[50]">
        <div className="max-w-md mx-auto flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">
            {language === 'Indonesia' ? 'Pusat Bantuan' : 'Help Center'}
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-md mx-auto relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={20} />
          </div>
          <Input 
            placeholder={language === 'Indonesia' ? "Cari solusi atau pertanyaan..." : "Search solutions or questions..."} 
            className="pl-12 h-14 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8">
        
        {/* QUICK CATEGORIES */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <ShieldCheck size={20}/>, label: language === 'Indonesia' ? 'Keamanan' : 'Security' },
            { icon: <Clock size={20}/>, label: language === 'Indonesia' ? 'Absensi' : 'Attendance' },
            { icon: <HelpCircle size={20}/>, label: language === 'Indonesia' ? 'Lainnya' : 'Others' },
          ].map((cat, i) => (
            <button key={i} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800">
              <div className="text-blue-600">{cat.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ SECTION */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 text-left">
            {language === 'Indonesia' ? 'Pertanyaan Populer' : 'Popular Questions'}
          </p>
          
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden border-none transition-all duration-300 ${openIndex === index ? 'ring-2 ring-blue-500' : ''}`}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between bg-white dark:bg-slate-900 text-left transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{faq.question}</span>
                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${openIndex === index ? 'rotate-90' : ''}`} />
                </button>
                
                {openIndex === index && (
                  <div className="px-5 pb-5 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-300 text-left">
                    <div className="h-[1px] bg-slate-100 dark:bg-slate-800 mb-4" />
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* SUPPORT CONTACT CARD */}
        <div className="pt-4">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white border-none shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden text-left">
            <div className="relative z-10">
              <h3 className="text-lg font-black italic mb-2 uppercase tracking-tight">
                {language === 'Indonesia' ? 'Butuh Bantuan Lebih?' : 'Need More Help?'}
              </h3>
              <p className="text-xs text-blue-100 font-medium mb-6 leading-relaxed">
                {language === 'Indonesia' 
                  ? 'Admin kami siap membantu kendala operasional Anda setiap hari pukul 08:00 - 22:00.' 
                  : 'Our admin is ready to help with your operational issues every day from 08:00 AM - 10:00 PM.'}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => window.location.href = 'mailto:support@laundryhotel.com'}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest gap-2"
                >
                  <Mail size={14} /> Email
                </Button>

                <Button 
                  onClick={() => window.open(`https://wa.me/6285792698607?text=${encodeURIComponent(language === 'Indonesia' ? 'Halo Admin, saya butuh bantuan terkait aplikasi LaundryHotel' : 'Hello Admin, I need help regarding the LaundryHotel application')}`, "_blank")}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-green-900/20"
                >
                  <MessageCircle size={14} /> WhatsApp
                </Button>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
          </Card>
        </div>

        {/* FOOTER */}
        <div className="text-center py-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
            © 2026 LaundryHotel • Support System v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;