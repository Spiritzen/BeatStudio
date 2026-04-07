import { supabase } from '../lib/supabaseClient';

export async function track(event: string, props?: Record<string, unknown>) {
  console.log('📊 [TRACK]', event, props);
  if (import.meta.env.DEV) return; // skip Supabase en local (CORS)
  try {
    await supabase.from('events').insert({ event, props });
  } catch {}
}
