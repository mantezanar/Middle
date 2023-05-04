const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://tzscatlgcubfpvmcykrh.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2NhdGxnY3ViZnB2bWN5a3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE2MDQ0NDksImV4cCI6MTk5NzE4MDQ0OX0.X4va-55G7_wn7BFWSCNOQQH6S6mUdT8aJGcsyy8MLhs";

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
module.exports = supabase;
