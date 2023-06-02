const { createClient } = require('@supabase/supabase-js');

// Datos de conexión a la primera base de datos
const supabaseUrl1 = "https://zqnfodulhltkthicgmfk.supabase.co/";
const supabaseAnonKey1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbmZvZHVsaGx0a3RoaWNnbWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU0MTM1NzksImV4cCI6MjAwMDk4OTU3OX0.J2sxmhFk8mbMNsAbCamZ5VWgf45vMy15B20gusnQZCY";

// Datos de conexión a la segunda base de datos
const supabaseUrl2 = "https://ujdiwyiomnpqiilwykcl.supabase.co";
const supabaseAnonKey2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZGl3eWlvbW5wcWlpbHd5a2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ5Mzg1NDUsImV4cCI6MjAwMDUxNDU0NX0.jcC0vYoQn3By9ZeBpao9wTnHHS7oYy5A9sUBfUkkhGM";

async function connect() {
  try {
    const supabase1 = createClient(supabaseUrl1, supabaseAnonKey1);
    const { data, error1 } = await supabase1.from('status').select();
    console.log('error: %o',error1)
    console.log('data: %o',data)
    if (data!=null) {
      console.log('Conectado a la base de datos 1');
      return supabase1;
    }
  } catch (err) {
    console.error(`Error al conectar a la base de datos 1: ${err}`);
  }

  try {
    const supabase2 = createClient(supabaseUrl2, supabaseAnonKey2);
    const { data, error2 } = await supabase2.from('etiqueta').select();
    console.log('error: %o',error2)
    console.log('data: %o',data)
    if (data!=null) {
      console.log('Conectado a la base de datos 2');
      return supabase2;
    }
  } catch (err) {
    console.error(`Error al conectar a la base de datos 2: ${err}`);
  }

  console.error('No se pudo conectar a ninguna base de datos');
  return null;
}
module.exports = { connect };


//export const supabase = () => connect;

// const supabaseClient = await connect();
// export const supabaseClient = connect;



/* const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://tzscatlgcubfpvmcykrh.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2NhdGxnY3ViZnB2bWN5a3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE2MDQ0NDksImV4cCI6MTk5NzE4MDQ0OX0.X4va-55G7_wn7BFWSCNOQQH6S6mUdT8aJGcsyy8MLhs";

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
module.exports = supabase;*/ 
