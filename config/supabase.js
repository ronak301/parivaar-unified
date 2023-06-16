const { createClient } = require('@supabase/supabase-js');
let supabase;

if (process.env.NODE_ENV === 'PRODUCTION') {
  supabase = createClient(process.env.PROD_SUPABASE_URL, process.env.PROD_SUPABASE_KEY);
} else {
  supabase = createClient(process.env.DEV_SUPABASE_URL, process.env.DEV_SUPABASE_KEY);
}

module.exports = supabase;