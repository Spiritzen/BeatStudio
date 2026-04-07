export async function track(event: string, props?: Record<string, unknown>) {
  console.log('📊 [TRACK]', event, props);
  if (import.meta.env.DEV) return;
  try {
    const res = await fetch(
      'https://frauedrzvqfnvqatubg.supabase.co/rest/v1/events',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_5YKdz0_j_Ame8l1mJyF7Hw_uI6YMp8C',
          'Authorization': 'Bearer sb_publishable_5YKdz0_j_Ame8l1mJyF7Hw_uI6YMp8C',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ event, props }),
      }
    );
    console.log('✅ track status:', res.status);
  } catch (err) {
    console.error('❌ track error:', err);
  }
}
