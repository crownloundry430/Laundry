import { useState } from "react";
import {
  Search, Plus, Edit, Trash2, MoreVertical, Mail, Phone, UserCheck, UserX,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal,
} from "./ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";

// --- IMPORT STORE ---
import { useAuthStore } from "../store";

export function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- AMBIL DATA & FUNGSI DARI STORE ---
  const { attendance, addEmployee, deleteEmployee, fetchInitialData } = useAuthStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    shift: "Pagi",
    status: "Aktif",
  });

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: "", role: "", email: "", phone: "", shift: "Pagi", status: "Aktif" });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: any) => {
    setIsEditMode(true);
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      role: employee.position,
      email: employee.email,
      phone: employee.phone,
      shift: employee.shift,
      status: employee.status === "Tidak Aktif" ? "Tidak Aktif" : "Aktif",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus karyawan ini secara permanen dari Database?")) {
      await deleteEmployee(id);
      // Refresh data setelah hapus
      fetchInitialData();
    }
  };

  const handleSave = async () => { // Tambahkan async di sini
  if (!formData.name || !formData.role || !formData.email) {
    alert("Harap isi Nama, Posisi, dan Email!");
    return;
  }

  const newEmployeeData = {
    name: formData.name,
    position: formData.role,
    email: formData.email,
    phone: formData.phone || "-",
    shift: formData.shift,
    initials: getInitials(formData.name),
  };

  if (isEditMode && editingId) {
    // Logika Edit (Opsional, fokus dulu ke Tambah)
    await deleteEmployee(editingId); 
  }

  // PANGGIL FUNGSI SIMPAN
  await addEmployee(newEmployeeData as any);
  
  // Ambil data terbaru agar tampilan sinkron
  await fetchInitialData(); 

  setIsDialogOpen(false);
};

  const filteredEmployees = attendance.filter((emp) => {
    return emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           emp.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = [
    { label: "Total Karyawan", value: attendance.length, color: "blue" },
    { label: "Hadir Hari Ini", value: attendance.filter((e) => e.status === "Hadir").length, color: "green" },
    { label: "Shift Pagi", value: attendance.filter((e) => e.shift === "Pagi").length, color: "purple" },
    { label: "Shift Malam", value: attendance.filter((e) => e.shift === "Malam").length, color: "orange" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manajemen Karyawan</h1>
          <p className="text-sm text-gray-500">Data ini tersimpan aman di Database Supabase</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Karyawan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 border-none shadow-sm text-left bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl bg-blue-50 text-blue-600">
                {stat.value}
              </div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Karyawan" : "Tambah Karyawan Baru"}</DialogTitle>
            <DialogDescription>Data akan disimpan ke server cloud.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama Lengkap" />
            </div>
            <div className="space-y-2">
              <Label>Posisi</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih posisi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supervisor Laundry">Supervisor Laundry</SelectItem>
                  <SelectItem value="Operator Mesin Cuci">Operator Mesin Cuci</SelectItem>
                  <SelectItem value="Staf Setrika">Staf Setrika</SelectItem>
                  <SelectItem value="Driver Antar Jemput">Driver Antar Jemput</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shift</Label>
                <Select value={formData.shift} onValueChange={(val) => setFormData({...formData, shift: val})}>
                  <SelectTrigger><SelectValue placeholder="Shift" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pagi">Pagi</SelectItem>
                    <SelectItem value="Malam">Malam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@hotel.com" />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+62" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600">Simpan Ke Database</Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Batal</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-6 hover:shadow-md transition-all border-none shadow-sm overflow-visible bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-600 text-white font-bold">{employee.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-none mb-1">{employee.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{employee.id}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(employee)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(employee.id)} className="text-red-600 cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus Permanen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              </div>
              <div className="space-y-4">
                <div>
                    <p className="text-sm font-bold text-gray-700">{employee.position}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Shift {employee.shift}</p>
                </div>
                <div className="space-y-2 text-xs text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {employee.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {employee.phone}</div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic">
            Belum ada karyawan. Silakan klik tombol "Tambah Karyawan".
          </div>
        )}
      </div>
    </div>
  );
}