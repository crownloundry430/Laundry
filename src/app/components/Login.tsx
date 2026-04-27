// src/app/components/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Hotel, 
  Loader2, 
  Eye, 
  EyeOff,
  Fingerprint
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Ambil state dari store
  const { login, biometricEnabled, savedEmail, savedRole, language } = useAuthStore();
  const navigate = useNavigate();

  // --- AUTO-TRIGGER BIOMETRIK ---
  useEffect(() => {
    if (biometricEnabled && savedEmail) {
      const timer = setTimeout(() => {
        handleBiometricLogin();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- FUNGSI LOGIN MANUAL ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'karyawan';
      const name = role === 'admin' ? 'Admin Hotel' : 'Staff Operasional';
      
      await login(role, name, email);
      navigate(role === 'admin' ? '/' : '/attendance');
    } catch (error) {
      console.error(error);
      alert(
        language === 'Indonesia' 
        ? "Gagal masuk. Periksa kembali email dan koneksi Anda." 
        : "Login failed. Please check your email and connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI LOGIN CEPAT (BIOMETRIK) ---
  const handleBiometricLogin = async () => {
    if (!biometricEnabled || !savedEmail) return;

    setIsLoading(true);
    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        try {
          await navigator.credentials.get({
            publicKey: {
              challenge,
              userVerification: "required",
            }
          });
          await proceedBiometricLogin();
        } catch (err) {
          console.log("Hardware prompt closed");
          setIsLoading(false);
        }
      } else {
        const confirmMsg = language === 'Indonesia' 
          ? `Gunakan login cepat untuk: ${savedEmail}?` 
          : `Use quick login for: ${savedEmail}?`;
          
        const confirmSim = window.confirm(confirmMsg);
        if (confirmSim) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await proceedBiometricLogin();
        } else {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const proceedBiometricLogin = async () => {
    await login(savedRole, "", savedEmail);
    navigate(savedRole === 'admin' ? '/' : '/attendance');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white p-4 text-left relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none"></div>

      <Card className="w-full max-w-[400px] p-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[3rem] z-10 animate-in fade-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-200 mb-4 transform -rotate-6 transition-transform hover:rotate-0 duration-300">
            <Hotel className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">LaundryHotel</h2>
          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.3em]">
            {language === 'Indonesia' ? 'SISTEM MANAJEMEN V2' : 'MANAGEMENT SYSTEM V2'}
          </p>
        </div>

        {/* FORM LOGIN MANUAL */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              {language === 'Indonesia' ? 'ID EMAIL' : 'EMAIL ID'}
            </label>
            <div className="relative group text-left">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="email@hotel.com" 
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              {language === 'Indonesia' ? 'KATA SANDI' : 'PASSWORD'}
            </label>
            <div className="relative group text-left">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                className="w-full pl-12 pr-12 py-4 bg-slate-100/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-100 transition-all active:scale-[0.98] mt-2"
          >
            {isLoading && !biometricEnabled ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center justify-center uppercase tracking-widest text-xs">
                {language === 'Indonesia' ? 'Masuk Sekarang' : 'Login Now'} <LogIn className="ml-3 w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* SECTION: LOGIN CEPAT BIOMETRIK */}
        {biometricEnabled && savedEmail && (
          <div className="mt-8 flex flex-col items-center gap-5 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 w-full opacity-30">
              <div className="h-[1px] bg-slate-400 flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
                {language === 'Indonesia' ? 'Atau Login Biometrik' : 'Or Biometric Login'}
              </span>
              <div className="h-[1px] bg-slate-400 flex-1"></div>
            </div>

            <div className="flex flex-col items-center">
              <button 
                disabled={isLoading}
                onClick={handleBiometricLogin}
                className="relative group flex items-center justify-center p-2"
              >
                <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all duration-500 ${isLoading ? 'animate-pulse' : ''}`}></div>
                <div className="relative w-20 h-20 bg-white border-2 border-blue-100 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200/50 group-active:scale-90 transition-all duration-300">
                  {isLoading ? (
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  ) : (
                    <Fingerprint className="text-blue-600 group-hover:scale-110 transition-transform" size={40} />
                  )}
                </div>
              </button>
              
              <p className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest italic animate-pulse">
                {isLoading 
                  ? (language === 'Indonesia' ? 'Memverifikasi...' : 'Verifying...') 
                  : (language === 'Indonesia' ? 'Sentuh Sensor Jari' : 'Touch Fingerprint Sensor')}
              </p>
              <p className="mt-1 text-[9px] text-slate-400 font-bold tracking-tight">
                {language === 'Indonesia' ? 'Melanjutkan Akun:' : 'Continuing Account:'} <span className="text-slate-700">{savedEmail}</span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            © 2026 LaundryHotel • Secure Infrastructure
          </p>
        </div>
      </Card>
    </div>
  );
};