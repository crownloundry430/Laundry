// src/app/components/Notifications.tsx
import React from 'react';
import { useAuthStore } from '../store';
import { Bell, Check, Trash2, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from "./ui/badge";

export const Notifications = () => {
  const { notifications, markAllRead, language } = useAuthStore();

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto text-left min-h-screen bg-slate-50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {language === 'Indonesia' ? 'Pusat Notifikasi' : 'Notification Center'}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Activity Log</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={markAllRead}
          className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl"
        >
          <Check className="w-4 h-4 mr-2" /> Tandai Semua Dibaca
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <Card key={n.id} className={`p-6 border-none shadow-sm rounded-[2rem] transition-all hover:shadow-md ${!n.isRead ? 'ring-2 ring-blue-500 bg-white' : 'bg-white/60'}`}>
              <div className="flex gap-5">
                <div className={`p-4 rounded-2xl h-fit ${!n.isRead ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                  <Bell size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-lg text-slate-800 tracking-tight">{n.title}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                      <Calendar size={10} /> {formatTime(n.time)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">{n.message}</p>
                  {!n.isRead && (
                     <div className="mt-4 flex gap-2">
                        <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[9px] uppercase px-3 py-1">Baru</Badge>
                     </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-32 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Bell size={40} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada notifikasi baru</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;