import 'server-only';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';

let cached:SupabaseClient|undefined;
export const AVATAR_BUCKET='prime-avatars';

export function supabaseAdmin():SupabaseClient{
 const url=process.env.SUPABASE_URL;
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)throw new Error('SUPABASE_CONFIG_MISSING');
 if(!cached)cached=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
 return cached;
}
