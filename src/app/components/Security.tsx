// src/app/components/Security.tsx
import React, { useState } from 'react';
import { 
  ArrowLeft, Lock, ShieldCheck, Fingerprint, KeyRound, 
  Info, Eye, EyeOff, X, CheckCircle2, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';

export const Security = () => {
  const navigate = useNavigate();
  const { biometricEnabled, setBiometricEnabled, user, language } = useAuthStore();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  // HANDLE TOGGLE
  const handleToggleBiometric = (checked: boolean) => {
    if (checked) {
      setIsModalOpen(true);
      setScanStatus('idle');
    } else {
      setBiometricEnabled(false);
    }
  };

  const startScan = async () => {
    if (!window.PublicKeyCredential) {
      alert(
        language === 'Indonesia' 
        ? "Perangkat tidak mendukung biometrik." 
        : "Device does not support biometrics."
      );
      setIsModalOpen(false);
      return;
    }

    setScanStatus('scanning');

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Laundry App" },
          user: {
            id: new Uint8Array([1]),
            name: user?.email || "user@laundry.com",
            displayName: user?.name || "User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { 
            authenticatorAttachment: "platform", 
            userVerification: "required" 
          },
          timeout: 60000 
        }
      });

      if (credential) {
        setScanStatus('success');
        setBiometricEnabled(true);
        setTimeout(() => setIsModalOpen(false), 2000);
      }
    } catch (err: any) {
      console.error(err);
      const confirmMsg = language === 'Indonesia' 
        ? "Gagal akses hardware. Gunakan mode simulasi?" 
        : "Hardware access failed. Use simulation mode?";

      if (window.confirm(confirmMsg)) {
        setScanStatus('scanning');
        await new Promise(r => setTimeout(r, 2000));
        setScanStatus('success');
        setBiometricEnabled(true);
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        setScanStatus('idle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 px-6 py-6 border-b dark:border-slate-800 flex items-center gap-4 sticky top-0 z-[50]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={20} className="dark:text-white" />
        </button>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">
          {language === 'Indonesia' ? 'Keamanan Akun' : 'Account Security'}
        </h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6 text-left">
        
        {/* BANNER STATUS */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-xl flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/30">
            <ShieldCheck size={36} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em]">
              {language === 'Indonesia' ? 'Status Keamanan' : 'Security Status'}
            </p>
            <p className="text-xl font-black italic">
              {biometricEnabled 
                ? (language === 'Indonesia' ? 'Sangat Aman' : 'Highly Secure') 
                : (language === 'Indonesia' ? 'Standar' : 'Standard')}
            </p>
          </div>
        </div>

        {/* SECTION: PASSWORD */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
            {language === 'Indonesia' ? 'Ganti Kata Sandi' : 'Change Password'}
          </p>
          <Card className="p-6 rounded-[2.5rem] border-none shadow-sm dark:bg-slate-900 space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  type={showCurrentPassword ? "text" : "password"} 
                  placeholder={language === 'Indonesia' ? "Password Lama" : "Old Password"} 
                  className="pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl" 
                />
                <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder={language === 'Indonesia' ? "Password Baru" : "New Password"} 
                  className="pl-12 h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl" 
                />
                <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
              {language === 'Indonesia' ? 'Update Password' : 'Update Password'}
            </Button>
          </Card>
        </div>

        {/* SECTION: BIOMETRIK (LOGIN CEPAT) */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
            {language === 'Indonesia' ? 'Akses Cepat' : 'Quick Access'}
          </p>
          <Card className="p-6 rounded-[2.5rem] border-none shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${biometricEnabled ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <Fingerprint size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase">
                    {language === 'Indonesia' ? 'Biometrik' : 'Biometric'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase italic">
                    {biometricEnabled 
                      ? (language === 'Indonesia' ? 'Aktif' : 'Active') 
                      : (language === 'Indonesia' ? 'Tidak Aktif' : 'Inactive')}
                  </p>
                </div>
              </div>
              <Switch checked={biometricEnabled} onCheckedChange={handleToggleBiometric} />
            </div>
          </Card>
        </div>

        {/* INFO TIPS */}
        <div className="flex gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
           <Info size={20} className="text-amber-600 shrink-0" />
           <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200 font-bold italic text-left">
             {language === 'Indonesia' 
               ? 'Jika biometrik aktif, Anda bisa masuk ke aplikasi hanya dengan sidik jari tanpa mengetik password.' 
               : 'If biometrics are active, you can log in to the application using only your fingerprint without typing a password.'}
           </p>
        </div>
      </div>

      {/* MODAL SCANNING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
          <Card className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            {scanStatus !== 'scanning' && (
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X size={18} className="dark:text-white" />
              </button>
            )}
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black dark:text-white uppercase italic">
                  {scanStatus === 'success' 
                    ? (language === 'Indonesia' ? 'Berhasil!' : 'Success!') 
                    : (language === 'Indonesia' ? 'Verifikasi Jari' : 'Finger Verification')}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {scanStatus === 'idle' && (language === 'Indonesia' ? 'Tempelkan jari pada sensor perangkat' : 'Place your finger on the device sensor')}
                  {scanStatus === 'scanning' && (language === 'Indonesia' ? 'Sedang memproses...' : 'Processing...')}
                  {scanStatus === 'success' && (language === 'Indonesia' ? 'Login biometrik sekarang aktif' : 'Biometric login is now active')}
                </p>
              </div>

              <div className="relative flex items-center justify-center w-32 h-32">
                 <div className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-700 ${scanStatus === 'scanning' ? 'border-blue-500 animate-spin' : 'border-slate-200 dark:border-slate-800'}`} />
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${scanStatus === 'success' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-blue-500'}`}>
                    {scanStatus === 'success' ? <CheckCircle2 size={48} /> : <Fingerprint size={48} className={scanStatus === 'scanning' ? 'animate-pulse' : ''} />}
                 </div>
              </div>

              {scanStatus === 'idle' && (
                <Button onClick={startScan} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
                  {language === 'Indonesia' ? 'Mulai Pindai' : 'Start Scan'}
                </Button>
              )}

              {scanStatus === 'scanning' && (
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase italic animate-pulse">
                  <Loader2 className="animate-spin" size={14} /> 
                  {language === 'Indonesia' ? 'Memeriksa Hardware...' : 'Checking Hardware...'}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};