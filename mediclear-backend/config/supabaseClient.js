import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — check your .env file."
    );
}

// This client uses the service_role key, meaning it has full backend access.
// Never import this file into frontend code.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);