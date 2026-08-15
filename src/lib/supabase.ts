import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://clrsebdialuukfcpcwxf.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscnNlYmRpYWx1dWtmY3Bjd3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODQyNjQsImV4cCI6MjEwMjI2MDI2NH0.1WaMjE6Sx2KjFJlr6jJxCVERnSh8E3JF0MIMTenn-7k';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseUrl !== 'https://placeholder.supabase.co' &&
      supabaseUrl !== 'https://your-supabase-project-id.supabase.co' &&
      supabaseAnonKey &&
      supabaseAnonKey !== 'placeholder-anon-key'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
