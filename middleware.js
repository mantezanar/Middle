const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const supabase = require("./utils/supabase");
const app = express();
app.use(express.json());
const JWT_SECRET = 'M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==';
const util = require('util');
//
app.use(cors());
app.post('/login', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded == 'Credenciales no validas') {
      res.status(400).json({ error: 'Credenciales incorrectas' });
         
    } else {
      data = {aud: decoded.aud, email: decoded.email}
      res.json(data);  
    }
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});