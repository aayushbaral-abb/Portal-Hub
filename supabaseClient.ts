
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (window as any).SUPABASE_URL || 'https://bwbviufipfikhbaxcaej.supabase.co';
const supabaseAnonKey = (window as any).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3YnZpdWZpcGZpa2hiYXhjYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzkxODAsImV4cCI6MjA4MTgxNTE4MH0.gieShx_RhM-2jhtP9n8Zv4iXFjpgHNfcdf4XpfYODLk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Session is not persisted as per user request (logout on refresh)
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
