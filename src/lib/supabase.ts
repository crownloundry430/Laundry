// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'; // <--- Perbaikan: Pakai 'supabase-js'

// Tambahkan baris di bawah ini agar TypeScript tidak error soal 'env'
/// <reference types="vite/client" />

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi sederhana agar tidak crash jika env kosong
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Link atau Key Supabase belum diisi di file .env!");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');