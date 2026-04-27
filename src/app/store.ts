import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// --- HELPER UNTUK FORMAT WAKTU ---
const getFullTimestamp = () => {
  const now = new Date();
  const datePart = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${datePart} • ${timePart}`;
};

// --- INTERFACES ---
export interface Order {
  id: string; guest: string; room: string; phone: string; service: string;
  weight: string; status: string; date: string; time: string; price: string;
  items: any[]; hotelId: string;
}

interface AttendanceRecord {
  id: string; name: string; position: string; email: string; phone: string;
  shift: string; status: string; joinDate: string; time: string; initials: string;
  photo_url?: string; 
  profile_picture?: string | null; 
}

interface Notification {
  id: number; title: string; message: string; time: number; isRead: boolean; link?: string; 
}

interface SalaryData {
  employeeId: string;
  name: string;
  position: string;
  totalAttendance: number; 
  dailyRate: number;      
  totalSalary: number;    
}

interface AppState {
  user: { name: string; role: 'admin' | 'karyawan'; email: string; avatar_url?: string } | null;
  login: (role: 'admin' | 'karyawan', name?: string, email?: string) => Promise<void>;
  logout: () => void;
  isDarkMode: boolean; 
  toggleTheme: (isDark: boolean) => void; 
  updateUserPhoto: (url: string) => Promise<void>; 
  fetchInitialData: () => Promise<void>;
  orders: Order[];
  addOrder: (newOrder: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  attendance: AttendanceRecord[]; 
  addEmployee: (newEmp: Partial<AttendanceRecord>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  submitAttendance: (record: Partial<AttendanceRecord>) => Promise<void>;
  updateAttendanceStatus: (id: string, status: string, name: string, position: string, shift: string) => Promise<void>;
  salaries: SalaryData[];
  fetchSalaries: () => Promise<void>;
  updateSalaryRate: (position: string, rate: number) => Promise<void>;
  paySalary: (employeeId: string) => Promise<void>; 
  notifications: Notification[];
  markAllRead: () => void;
  markAsRead: (id: number) => void;
  addNotification: (newNotif: Notification) => void; 
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void; 
  savedEmail: string;
  savedRole: 'admin' | 'karyawan';
  language: 'Indonesia' | 'English';
  setLanguage: (lang: 'Indonesia' | 'English') => void;
  pushEnabled: boolean;
  setPushEnabled: (enabled: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
}

export const useAuthStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null, orders: [], attendance: [], salaries: [], isDarkMode: false, biometricEnabled: false, 
      savedEmail: '', savedRole: 'karyawan', language: 'Indonesia', pushEnabled: true,
      hapticEnabled: true, notifications: [],

      setLanguage: (lang) => set({ language: lang }),
      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),

      toggleTheme: (isDark) => {
        set({ isDarkMode: isDark });
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      },

      login: async (role, name, email) => {
        let dbPhoto = "";
        let dbName = name;
        set({ savedEmail: email || '', savedRole: role }); 
        if (email) {
          const cleanEmail = email.trim().toLowerCase();
          const { data } = await supabase.from('employees').select('photo_url, name').eq('email', cleanEmail).maybeSingle(); 
          if (data) { dbPhoto = data.photo_url || ""; dbName = data.name || name; }
        }
        set({ user: { role, name: dbName || 'Staff', email: email || '', avatar_url: dbPhoto } });
      },

      logout: () => set({ user: null }),

      updateUserPhoto: async (url) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const cleanEmail = currentUser.email.trim().toLowerCase();
        set({ user: { ...currentUser, avatar_url: url } });
        try {
          await supabase.from('employees').update({ photo_url: url }).eq('email', cleanEmail);
          await get().fetchInitialData();
        } catch (err) { console.error(err); }
      },

      fetchSalaries: async () => {
        try {
          const { data: rates } = await supabase.from('salary_settings').select('*');
          const { data: emps } = await supabase.from('employees').select('id, name, position');
          const { data: logs } = await supabase.from('attendance_logs')
            .select('employee_id, status')
            .eq('is_paid', false); 

          if (emps && rates) {
            const calculatedSalaries = emps.map(emp => {
              const posRate = rates.find(r => r.position === emp.position)?.daily_rate || 0;
              const attendanceCount = logs?.filter(l => 
                l.employee_id === emp.id && (l.status === 'Hadir' || l.status === 'Tepat Waktu')
              ).length || 0;

              return {
                employeeId: emp.id, name: emp.name, position: emp.position,
                totalAttendance: attendanceCount, dailyRate: posRate, totalSalary: attendanceCount * posRate
              };
            });
            set({ salaries: calculatedSalaries });
          }
        } catch (err) { console.error("Gagal hitung gaji:", err); }
      },

      updateSalaryRate: async (position, rate) => {
        try {
          await supabase.from('salary_settings').upsert({ position, daily_rate: rate }, { onConflict: 'position' });
          await get().fetchSalaries();
        } catch (err) { console.error(err); throw err; }
      },

      // --- LOGIKA BAYAR GAJI (DINAMIS DENGAN NOTIFIKASI) ---
      paySalary: async (employeeId: string) => {
        try {
          // 1. Cari nama karyawan untuk isi notifikasi
          const employee = get().attendance.find(a => a.id === employeeId);
          const employeeName = employee?.name || "Karyawan";

          // 2. Update status di database
          const { error } = await supabase
            .from('attendance_logs')
            .update({ is_paid: true }) 
            .eq('employee_id', employeeId)
            .eq('is_paid', false);

          if (error) throw error;
          
          // 3. Tambahkan notifikasi ke lonceng secara lokal
          get().addNotification({
            id: Date.now(),
            title: "Gaji Dibayar 💸",
            message: `Gaji untuk ${employeeName} telah berhasil dibayar & riwayat hadir direset.`,
            time: Date.now(),
            isRead: false,
            link: '/salary'
          });

          // 4. Refresh hitungan gaji agar jadi 0 kembali
          await get().fetchSalaries();
        } catch (err) {
          console.error("Gagal proses bayar gaji:", err);
          throw err;
        }
      },

      fetchInitialData: async () => {
        try {
          const { data: emps } = await supabase.from('employees').select('*').order('name');
          const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          const { data: atts } = await supabase.from('attendance').select('*');

          if (ords) {
            const mappedOrders: Order[] = ords.map(o => ({
              id: o.id, guest: o.guest_name, room: o.room_number, phone: o.phone,
              service: o.service_type, weight: o.weight_qty, status: o.status,
              price: o.total_price, items: o.items || [], hotelId: o.hotel_id || 'country',
              date: o.created_at ? new Date(o.created_at).toLocaleDateString('id-ID') : "-", 
              time: o.pickup_time || "" 
            }));
            set({ orders: mappedOrders });
          }

          if (emps) {
            const mergedData = emps.map(emp => {
              const log = atts?.find(a => a.employee_id === emp.id);
              return {
                ...emp, profile_picture: emp.photo_url || null, 
                status: log ? log.status : 'Belum Hadir',
                time: log ? log.time : '-',
                photo_url: (log && log.photo_url) ? log.photo_url : null 
              };
            });
            set({ attendance: mergedData });
          }
          await get().fetchSalaries();

          // --- REAL-TIME LISTENERS ---
          supabase
            .channel('global-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => get().fetchInitialData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => get().fetchInitialData())
            // Listener khusus untuk notifikasi pembayaran gaji realtime
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'attendance_logs' }, (p) => {
              if (p.new.is_paid === true && p.old.is_paid === false) {
                get().addNotification({ 
                  id: Date.now(), 
                  title: "Update Penggajian ✅", 
                  message: `Gaji karyawan ${p.new.name || 'Staff'} telah dibayarkan oleh Admin.`, 
                  time: Date.now(), 
                  isRead: false, 
                  link: '/salary' 
                });
              }
              get().fetchSalaries();
            })
            .subscribe();

        } catch (err) { console.error("Fetch Error:", err); }
      },

      addOrder: async (newOrder) => {
        await supabase.from('orders').insert([{
          id: newOrder.id, guest_name: newOrder.guest, room_number: newOrder.room,
          phone: newOrder.phone, service_type: newOrder.service, weight_qty: newOrder.weight,
          status: newOrder.status, total_price: newOrder.price, items: newOrder.items,
          hotel_id: newOrder.hotelId, pickup_time: newOrder.time
        }]);
      },

      updateOrderStatus: async (id, status) => {
        await supabase.from('orders').update({ status }).eq('id', id);
      },

      deleteOrder: async (id) => {
        await supabase.from('orders').delete().eq('id', id);
      },

      addEmployee: async (newEmp) => {
        await supabase.from('employees').insert([{
          name: newEmp.name, position: newEmp.position, email: newEmp.email?.trim().toLowerCase(),
          phone: newEmp.phone, shift: newEmp.shift, initials: newEmp.initials
        }]);
      },

      deleteEmployee: async (id) => {
        await supabase.from('employees').delete().eq('id', id);
      },

      submitAttendance: async (record) => {
        const empId = get().attendance.find(a => a.name === record.name)?.id;
        if (!empId) return alert("Error: ID Karyawan tidak ditemukan!");
        const timestamp = getFullTimestamp();
        
        try {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const { data: alreadyAbsent } = await supabase
            .from('attendance_logs')
            .select('id')
            .eq('employee_id', empId)
            .gte('created_at', startOfToday.toISOString());

          if (alreadyAbsent && alreadyAbsent.length > 0) {
            alert("⚠️ MAAF! Kamu sudah absen hari ini.");
            return;
          }

          await supabase.from('attendance_logs').insert([{
            employee_id: empId, name: record.name, status: 'Hadir', time: timestamp, is_paid: false
          }]);

          await supabase.from('attendance').upsert({
            employee_id: empId, name: record.name, position: record.position,
            shift: record.shift, status: 'Hadir', photo_url: record.photo_url, time: timestamp
          }, { onConflict: 'employee_id' });

          alert("✅ Absen Berhasil!");
          await get().fetchInitialData();
        } catch (err) { alert("Kesalahan validasi."); }
      },

      updateAttendanceStatus: async (id, status, name, position, shift) => {
        const timestamp = status === "Hadir" ? getFullTimestamp() : "-";
        if (status === "Hadir") {
            await supabase.from('attendance_logs').insert([{
                employee_id: id, name, status: 'Hadir', time: timestamp, is_paid: false
            }]);
        }
        await supabase.from('attendance').upsert({ 
          employee_id: id, name, position, shift, status, time: timestamp 
        }, { onConflict: 'employee_id' });
        await get().fetchInitialData();
      },

      markAllRead: () => set((state) => ({ notifications: state.notifications.map(n => ({ ...n, isRead: true })) })),
      markAsRead: (id) => set((state) => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) })),
      addNotification: (newNotif) => set((state) => ({ notifications: [newNotif, ...state.notifications] })),
    }),
    { 
      name: 'laundry-hotel-storage',
      partialize: (state) => ({ 
        isDarkMode: state.isDarkMode, language: state.language, notifications: state.notifications,
        biometricEnabled: state.biometricEnabled, savedEmail: state.savedEmail, savedRole: state.savedRole
      }),
    }
  )
);