import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabase = null;

if (env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) {
  supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  console.log('⚡ Supabase client initialized.');
} else {
  console.warn('⚠️ Supabase URL / Key not provided in .env. Fallback JWT authentication will be enabled.');
}

export { supabase };
