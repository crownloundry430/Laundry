// src/app/components/Salary.tsx
import { Users, Calendar, Edit3, Save, X, Wallet, TrendingUp, Loader2, Banknote, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";
import { useAuthStore } from "../store";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Salary() {
  const { salaries, updateSalaryRate, paySalary, language, fetchSalaries } = useAuthStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState({ position: "", rate: 0 });
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Modal Pembayaran Modern
  const [payModal, setPayModal] = useState<{ isOpen: boolean; data: any | null }>({
    isOpen: false,
    data: null
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('Rp', 'Rp ');
  };

  const getTodayISO = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const totalPayroll = salaries.reduce((acc, curr) => acc + curr.totalSalary, 0);

  const handleOpenEdit = (pos: string, currentRate: number) => {
    setEditingPos({ position: pos, rate: currentRate });
    setIsEditModalOpen(true);
  };

  const handleSaveRate = async () => {
    try {
      setIsSaving(true);
      await updateSalaryRate(editingPos.position, editingPos.rate);
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Gagal menyimpan!");
    } finally { setIsSaving(false); }
  };

  // Fungsi Final Bayar Gaji
  const confirmPayment = async () => {
    if (!payModal.data) return;
    try {
      setIsSaving(true);
      await paySalary(payModal.data.employeeId);
      setPayModal({ isOpen: false, data: null });
    } catch (error) {
      alert("Gagal memproses pembayaran.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left pb-24 min-h-screen bg-slate-50 relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic uppercase">
            {language === 'Indonesia' ? 'Kelola Gaji Karyawan' : 'Payroll Management'}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Automated Payroll & Reset System
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl shadow-sm border border-slate-100">
          <Calendar className="text-blue-500" size={18} />
          <span className="font-black text-sm text-slate-600 font-mono tracking-tighter">
            {getTodayISO()}
          </span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-blue-600 text-white rounded-[2.5rem] border-none shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 text-white/80">
               <Wallet size={14} />
               <p className="text-[10px] font-black uppercase tracking-widest">Total Tagihan Gaji</p>
            </div>
            <h2 className="text-3xl font-black">{formatIDR(totalPayroll)}</h2>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 text-white" />
        </Card>
        
        <Card className="p-6 bg-white rounded-[2.5rem] border-none shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 rounded-3xl flex items-center justify-center text-green-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan Terdaftar</p>
            <p className="text-2xl font-black text-slate-800">{salaries.length} Orang</p>
          </div>
        </Card>
      </div>

      {/* DATA TABLE */}
      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b">
              <tr>
                <th className="py-6 px-8">Karyawan & Posisi</th>
                <th className="py-6 px-6 text-center">Kehadiran</th>
                <th className="py-6 px-6 text-center">Tarif / Hari</th>
                <th className="py-6 px-6 text-center">Estimasi Gaji</th>
                <th className="py-6 px-8 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {salaries.map((s) => (
                <tr key={s.employeeId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-6 px-8">
                    <p className="font-bold text-slate-900 text-sm leading-tight">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{s.position}</p>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`font-black text-[10px] px-3 py-1.5 rounded-xl uppercase ${s.totalAttendance > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {s.totalAttendance} Hari
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <p className="font-bold text-slate-600 text-sm">{formatIDR(s.dailyRate)}</p>
                      <button onClick={() => handleOpenEdit(s.position, s.dailyRate)} className="p-2 bg-slate-100 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white">
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <p className={`font-black text-base italic ${s.totalSalary > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                       {formatIDR(s.totalSalary)}
                    </p>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex justify-center"> 
                        {s.totalSalary > 0 ? (
                        <button 
                            onClick={() => setPayModal({ isOpen: true, data: s })}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black rounded-2xl transition-all shadow-lg shadow-green-200 uppercase tracking-widest active:scale-95 whitespace-nowrap"
                        >
                            <Banknote size={16} /> <span>Bayar Gaji</span>
                        </button>
                        ) : (
                        <div className="inline-flex items-center justify-center gap-2 text-slate-300 text-[10px] font-black uppercase whitespace-nowrap">
                            <CheckCircle size={16} className="text-slate-200" /> <span>Sudah Lunas</span>
                        </div>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL EDIT TARIF */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <Card className="w-full max-w-md bg-white rounded-[3rem] p-10 z-[10000] shadow-2xl relative border-none animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-1 italic">Update Tarif Gaji</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{editingPos.position}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={20}/>
                </button>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Nominal Gaji Per Hari</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">Rp</span>
                    <Input type="number" value={editingPos.rate} onChange={(e) => setEditingPos({...editingPos, rate: parseInt(e.target.value) || 0})} className="h-16 pl-14 bg-slate-50 border-none rounded-[1.5rem] text-xl font-black text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-400" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                  <Button disabled={isSaving} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 text-white" onClick={handleSaveRate}>
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Simpan</>}
                  </Button>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* MODAL KONFIRMASI PEMBAYARAN MODERN */}
      {payModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setPayModal({ isOpen: false, data: null })} />
          <Card className="w-full max-w-md bg-white rounded-[3.5rem] p-10 z-[10000] shadow-2xl relative border-none animate-in zoom-in-90 duration-300 text-center">
             <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Banknote size={40} className="animate-pulse" />
             </div>
             <h2 className="text-xl font-black text-slate-800 uppercase italic mb-2">Konfirmasi Pembayaran</h2>
             <p className="text-xs font-bold text-slate-400 mb-8 px-4 leading-relaxed uppercase tracking-tighter">
                Apakah Anda yakin ingin membayar gaji <span className="text-blue-600">{payModal.data?.name}</span>? 
                Data kehadiran akan di-reset otomatis.
             </p>

             <Card className="bg-slate-50 border-none rounded-[2rem] p-6 mb-8 text-left">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kehadiran</span>
                   <span className="font-black text-slate-700">{payModal.data?.totalAttendance} Hari</span>
                </div>
                <div className="h-px bg-slate-200 mb-3" />
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Dibayar</span>
                   <span className="text-xl font-black text-green-600">{formatIDR(payModal.data?.totalSalary)}</span>
                </div>
             </Card>

             <div className="flex flex-col gap-3">
                <Button 
                  disabled={isSaving}
                  onClick={confirmPayment}
                  className="w-full h-16 rounded-[1.5rem] bg-green-500 hover:bg-green-600 font-black text-white text-sm shadow-xl shadow-green-100 uppercase tracking-widest transition-all"
                >
                   {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                   {isSaving ? 'Memproses...' : 'Ya, Sudah Dibayar'}
                </Button>
                <button 
                   disabled={isSaving}
                   onClick={() => setPayModal({ isOpen: false, data: null })}
                   className="w-full h-12 rounded-[1.5rem] font-bold text-slate-400 hover:text-slate-600 uppercase text-[10px] tracking-widest transition-colors"
                >
                   Batalkan
                </button>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
}