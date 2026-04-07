export async function track(event: string, props?: Record<string, unknown>) {
  console.log('📊 [TRACK]', event, props);
  if (import.meta.env.DEV) return;
  try {
    const res = await fetch(
      'https://frauedrzvqfvnvqatubg.supabase.co/rest/v1/events',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYXVlZHJ6dnFmdm52cWF0dWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDgzMDYsImV4cCI6MjA5MDcyNDMwNn0.UPvhn4MffFQBRnyUEey_f2YAZstV8NrOobyCligy3Rc',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYXVlZHJ6dnFmdm52cWF0dWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDgzMDYsImV4cCI6MjA5MDcyNDMwNn0.UPvhn4MffFQBRnyUEey_f2YAZstV8NrOobyCligy3Rc',
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
