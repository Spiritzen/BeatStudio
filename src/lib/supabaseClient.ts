import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://frauedrzvqfnvqatubg.supabase.co";
const supabaseAnonKey = "sb_publishable_5YKdz0_j_Ame8l1mJyF7Hw_uI6YMp8C";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);