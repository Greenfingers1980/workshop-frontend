import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbqxwmrzsfjlcksmsuoz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXh3bXJ6c2ZqbGNrc21zdW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjA3MTUsImV4cCI6MjA5NzQzNjcxNX0.h7geRmUgit_YQp-7ZE-SRj0r6RE3x6tpotGWg4Rs6_I";

export const supabase = createClient(supabaseUrl, supabaseKey);
