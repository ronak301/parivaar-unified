const { createClient } = require('@supabase/supabase-js');
// let supabase;

// if (process.env.NODE_ENV === 'PRODUCTION') {
//   supabase = createClient(process.env.PROD_SUPABASE_URL, process.env.PROD_SUPABASE_KEY);
// } else {
//   supabase = createClient(process.env.DEV_SUPABASE_URL, process.env.DEV_SUPABASE_KEY);
// }

module.exports = createClient("https://vmkshebyuvhvgyiwqeqv.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta3NoZWJ5dXZodmd5aXdxZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NjY2Mzc0NCwiZXhwIjoyMDAyMjM5NzQ0fQ.SFT2YJgjohh0xay3YYGp40mlTzOi1iPC8jl6z92MyBY");