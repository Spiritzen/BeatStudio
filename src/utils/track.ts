import { supabase } from '../lib/supabaseClient';

export async function track(event: string, props?: Record<string, unknown>) {
  console.log('📊 [TRACK]', event, props);
  try {
    await supabase.from('events').insert({ event, props });
  } catch (err) { console.error('❌ Supabase track error:', err); }
}
