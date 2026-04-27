// src/app/components/Attendance.tsx
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, RefreshCw, CheckCircle2, User, Briefcase, Clock, 
  ShieldCheck, MoreVertical, Search, UserCheck, 
  Stethoscope, Palmtree, AlertCircle, ImageIcon, CalendarDays,
  Download, CheckCircle, Timer, Info, Image as ImageIconLucide
} from 'lucide-react';
import { useAuthStore } from '../store';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Attendance = () => {
  const { user, attendance, submitAttendance, updateAttendanceStatus, fetchInitialData, language } = useAuthStore();
  const webcamRef = useRef<Webcam>(null);
  
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(""); 
  const [selectedName, setSelectedName] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Logika penentuan status (Terlambat / Tepat Waktu)
  const getAttendanceDetails = (r: any) => {
    if (r.status !== 'Hadir' || !r.time || r.time === "-") {
      return { label: r.status || "Belum Hadir", isLate: false };
    }
    try {
      const timePart = r.time.split(' • ')[1]; 
      if (!timePart) return { label: "Hadir", isLate: false };
      const [time, modifier] = timePart.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      const totalMinutes = hours * 60 + minutes;

      if (r.shift === 'Pagi') {
        return totalMinutes > 425 ? { label: "Terlambat", isLate: true } : { label: "Tepat Waktu", isLate: false };
      } else if (r.shift === 'Malam') {
        const isLate = (totalMinutes > 1110 || (totalMinutes > 420 && totalMinutes < 1110));
        return isLate ? { label: "Terlambat", isLate: true } : { label: "Tepat Waktu", isLate: false };
      }
      return { label: "Tepat Waktu", isLate: false };
    } catch { return { label: "Hadir", isLate: false }; }
  };

  const stats = {
    hadir: attendance.filter(r => r.status === 'Hadir').length,
    sakit: attendance.filter(r => r.status === 'Sakit').length,
    libur: attendance.filter(r => r.status === 'Libur').length,
    belumHadir: attendance.filter(r => r.status === 'Belum Hadir' || !r.status).length,
    tepatWaktu: 0,
    terlambat: 0
  };

  attendance.forEach(r => {
    if (r.status === 'Hadir' && r.time !== "-") {
      const details = getAttendanceDetails(r);
      if (details.isLate) stats.terlambat++;
      else stats.tepatWaktu++;
    }
  });

  const handleNameChange = (id: string) => {
    const employeeData = attendance.find(emp => emp.id === id);
    if (employeeData) {
      setSelectedId(employeeData.id);
      setSelectedName(employeeData.name);
      setSelectedPosition(employeeData.position);
      setSelectedShift(employeeData.shift);
    } else {
      setSelectedId(""); setSelectedName(""); setSelectedPosition(""); setSelectedShift("");
    }
  };

  const capture = () => setImgSrc(webcamRef.current?.getScreenshot() || null);

  const handleExportCSV = () => {
    if (attendance.length === 0) return alert("Tidak ada data");
    const headers = ["Nama", "Jabatan", "Shift", "Waktu", "Status"];
    const csvRows = attendance.map(item => [`"${item.name}"`, `"${item.position}"`, `"${item.shift}"`, `"${item.time}"`, `"${item.status}"`].join(","));
    const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Absensi_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const handleAbsen = async () => {
    if (!imgSrc || !selectedId) return;
    setIsSubmitting(true);
    try {
      const base64Response = await fetch(imgSrc);
      const blob = await base64Response.blob();
      const fileName = `attendance/selfie-${selectedId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('selfies').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(fileName);
      await submitAttendance({ id: selectedId, name: selectedName, position: selectedPosition, shift: selectedShift, photo_url: publicUrl });
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setImgSrc(null); setSelectedId(""); }, 3000);
    } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  if (user?.role === 'admin') {
    const filteredData = attendance.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return (
      <div className="p-6 space-y-6 text-left pb-24 bg-slate-50 min-h-screen">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monitor Absensi</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatBox label="Hadir" val={stats.hadir} color="green" icon={<CheckCircle2 size={16}/>} />
          <StatBox label="Sakit" val={stats.sakit} color="yellow" icon={<Stethoscope size={16}/>} />
          <StatBox label="Libur" val={stats.libur} color="orange" icon={<Palmtree size={16}/>} />
          <StatBox label="Belum Hadir" val={stats.belumHadir} color="gray" icon={<AlertCircle size={16}/>} />
          <StatBox label="Tepat Waktu" val={stats.tepatWaktu} color="teal" icon={<CheckCircle size={16}/>} />
          <StatBox label="Terlambat" val={stats.terlambat} color="rose" icon={<Timer size={16}/>} />
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2.5rem]">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Cari karyawan..." className="pl-12 h-12 bg-slate-50 border-none rounded-2xl font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="h-12 px-6 rounded-2xl font-black border-slate-100 text-slate-500 gap-2 hover:bg-slate-50">
              <Download size={18} /> EXPORT CSV
            </Button>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <tr>
                  <th className="py-5 px-6 text-center">Identitas</th>
                  <th className="py-5 px-6 text-center">Bukti Absen</th>
                  <th className="py-5 px-6">Karyawan</th>
                  <th className="py-5 px-6">Shift</th>
                  <th className="py-5 px-6">Waktu Masuk</th>
                  <th className="py-5 px-6 text-center">Status Detail</th>
                  <th className="py-5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((r) => {
                  const details = getAttendanceDetails(r);
                  const isCheckedIn = r.status === 'Hadir';

                  return (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition-colors group">
                     {/* 1. FOTO PROFIL (IDENTITAS ASLI) */}
<td className="py-5 px-6 text-center">
  <div className="w-10 h-10 rounded-full mx-auto overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
    {r.profile_picture ? (
      <img src={r.profile_picture} className="w-full h-full object-cover" alt="Identitas" />
    ) : (
      <User className="w-5 h-5 text-slate-300" />
    )}
  </div>
</td>

{/* 2. FOTO SELFIE (BUKTI ABSEN) */}
<td className="py-5 px-6 text-center">
  {isCheckedIn && r.photo_url ? (
    <div className="relative inline-block">
      <img 
        src={r.photo_url} 
        className="w-12 h-12 rounded-xl object-cover border-2 border-green-100 shadow-sm cursor-pointer hover:scale-110 transition-transform" 
        onClick={() => window.open(r.photo_url, '_blank')} 
      />
      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
        <Camera size={8} className="text-white" />
      </div>
    </div>
  ) : (
    <div className="w-10 h-10 bg-slate-50 rounded-xl mx-auto flex items-center justify-center border-dashed border-2 border-slate-100">
      <ImageIcon size={14} className="text-slate-200"/>
    </div>
  )}
</td>

                      <td className="py-5 px-6">
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight">{r.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{r.position}</p>
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 rounded-md">
                          {r.shift || '-'}
                        </Badge>
                      </td>

                      <td className="py-5 px-6">
                         <span className="text-xs font-black text-slate-600 tabular-nums">{r.time}</span>
                      </td>

                      <td className="py-5 px-6 text-center">
                        <Badge className={`px-3 py-1 border shadow-none font-black uppercase text-[9px] rounded-lg ${
                          details.label === 'Tepat Waktu' ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                          details.label === 'Terlambat' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {details.label}
                        </Badge>
                      </td>

                      <td className="py-5 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-4 h-4 text-slate-400" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-none shadow-2xl p-2 rounded-2xl w-44">
                            <DropdownMenuItem onClick={() => updateAttendanceStatus(r.id, "Hadir", r.name, r.position, r.shift)} className="cursor-pointer text-green-600 font-black text-[10px] uppercase tracking-widest p-3 rounded-xl hover:bg-green-50"><UserCheck className="w-4 h-4 mr-2"/>Set Hadir</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAttendanceStatus(r.id, "Sakit", r.name, r.position, r.shift)} className="cursor-pointer text-amber-600 font-black text-[10px] uppercase tracking-widest p-3 rounded-xl hover:bg-amber-50"><Stethoscope className="w-4 h-4 mr-2"/>Set Sakit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAttendanceStatus(r.id, "Libur", r.name, r.position, r.shift)} className="cursor-pointer text-blue-600 font-black text-[10px] uppercase tracking-widest p-3 rounded-xl hover:bg-blue-50"><Palmtree className="w-4 h-4 mr-2"/>Set Libur</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-left min-h-screen bg-slate-50">
      {isSuccess ? (
        <SuccessView name={selectedName} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="p-6 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border-none">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Camera size={18} /> Verifikasi Wajah
            </h3>
            <div className="relative aspect-[3/4] bg-slate-900 rounded-[2rem] overflow-hidden shadow-inner">
              {!imgSrc ? (
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{ facingMode: "user" }} />
              ) : (
                <img src={imgSrc} className="w-full h-full object-cover" alt="Preview" />
              )}
            </div>
            <Button onClick={!imgSrc ? capture : () => setImgSrc(null)} className="w-full h-16 mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200">
              {!imgSrc ? <><Camera size={20} className="mr-2"/> Ambil Foto</> : <><RefreshCw size={20} className="mr-2"/> Foto Ulang</>}
            </Button>
          </Card>
          
          <Card className="p-10 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border-none space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Presensi Kehadiran</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest tracking-tighter">Pastikan data sesuai jadwal shift</p>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl flex gap-4 items-start border border-blue-100">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <p className="text-blue-700 text-[11px] font-bold leading-relaxed uppercase">
                 Shift Pagi: 07.00 WIB | Shift Malam: 18.30 WIB. Terlambat jika lebih dari 25 menit.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Identitas</label>
                <select 
                  value={selectedId} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  className="w-full h-14 px-5 bg-slate-50 rounded-2xl outline-none font-black text-slate-700 border-2 border-transparent focus:border-blue-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Nama --</option>
                  {attendance.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <ReadOnlyInput label="Jabatan Terdaftar" val={selectedPosition} />
              <ReadOnlyInput label="Shift Kerja" val={selectedShift} />
            </div>

            <Button 
              onClick={handleAbsen} 
              disabled={!imgSrc || !selectedId || isSubmitting} 
              className="w-full h-20 rounded-[1.5rem] bg-green-600 hover:bg-green-700 text-xl font-black shadow-2xl shadow-green-100 transition-all gap-4 disabled:bg-slate-100 disabled:text-slate-300"
            >
              {isSubmitting ? <RefreshCw className="animate-spin" /> : <ShieldCheck size={28} />}
              {isSubmitting ? "MENGIRIM..." : "KIRIM SEKARANG"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

const StatBox = ({label, val, color, icon}: any) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-50 text-green-600", 
    yellow: "bg-amber-50 text-amber-600",
    orange: "bg-orange-50 text-orange-600", 
    gray: "bg-slate-100 text-slate-400",
    teal: "bg-teal-50 text-teal-600", 
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <Card className="p-4 flex flex-col items-center justify-center bg-white border-none shadow-sm rounded-[2.5rem]">
      {/* 1. Kotak Angka (Ganti mb-4 menjadi mb-2 agar lebih naik) */}
      <div className={`w-14 h-14 ${colorMap[color] || "bg-blue-50"} rounded-[1.25rem] flex items-center justify-center font-black text-2xl mb-2 shadow-inner`}>
        {val}
      </div>

      {/* 2. Container Status & Staf (Grup ini dibuat mepet) */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 opacity-40">
          <span className="scale-75">{icon}</span>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {label}
          </p>
        </div>
        
        {/* 3. Tulisan Staf (Sekarang nempel ke atas karena tidak ada mb pada div di atasnya) */}
        <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em] mt-0.5">
          Staf
        </p>
      </div>
    </Card>
  );
};
const ReadOnlyInput = ({label, val}: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type="text" readOnly value={val} className="w-full h-14 px-5 bg-slate-50 border-none rounded-2xl font-black text-slate-400 cursor-not-allowed" placeholder="Otomatis..." />
  </div>
);

const SuccessView = ({name}: any) => (
  <div className="bg-white p-16 rounded-[3rem] shadow-2xl text-center border-none max-w-md mx-auto animate-in zoom-in duration-300 mt-20">
    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 size={56} /></div>
    <h2 className="text-4xl font-black text-slate-900 mb-3">Berhasil!</h2>
    <p className="text-slate-500 font-medium">Data absensi <span className="font-black text-blue-600">{name}</span> telah aman tersimpan di sistem.</p>
  </div>
);