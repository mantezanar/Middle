const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
const JWT_SECRET = 'M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==';

app.post('/login', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { email, password } = decoded;

    // Simula el éxito del inicio de sesión verificando si el correo electrónico y la contraseña están decodificados correctamente.
    if (email && password) {
      res.status(200).json({ email, password });
      
      res.redirect("http://localhost:3000/Lobby");
    } else {
      res.status(400).json({ error: 'Credenciales incorrectas' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
/*const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SUPABASE_URL = 'https://tzscatlgcubfpvmcykrh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2NhdGxnY3ViZnB2bWN5a3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE2MDQ0NDksImV4cCI6MTk5NzE4MDQ0OX0.X4va-55G7_wn7BFWSCNOQQH6S6mUdT8aJGcsyy8MLhs';
const JWT_SECRET = 'M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.post('/login', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token);
  
      const { email, password } = decoded;
      console.log(email, password);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      res.status(200).json({ user, token: user.access_token });
    } catch (err) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});*/

