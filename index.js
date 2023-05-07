const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const supabase = require("./utils/supabase");
const app = express();
app.use(express.json());
const token1 = 'M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==';
const JWT_SECRET = 'DEE18F06FAA7F52C346E1569E13F5A85F501D844E5DD1D4DC7CA81A378A1C37A';
const util = require('util');
const { log } = require('console');

//
app.use(cors());
app.post('/login', async (req, res) => {
  var loginToken;
  try {
    const token = req.headers.authorization.split(' ')[1];
    //Este es el token que viene del auth
    const decoded = jwt.verify(token, JWT_SECRET);  
    if (decoded == 'Credenciales no validas') {
      res.status(400).json({ error: 'Credenciales incorrectas' });
        
    } else {
      data = {aud: decoded.aud, email: decoded.email}
      loginToken = jwt.sign(data, token1);
      res.json(loginToken);  
    }
    
  } catch (err) {
    //res.status(600).json({ error: 'Error en el servidor' });
    const token = req.headers.authorization.split(' ')[1];
    //Este es el token que se le manda al usuario autenticado
    const decoded = jwt.verify(token, token1);
    if(decoded == 'sesion actual'){
      console.log(loginToken);
      if(!loginToken){
        const no_sesion = 'No';
        const sesionToken = jwt.sign(no_sesion, token1);
        res.json(sesionToken);
      }else {
        data = 'Sesion inciada';      
      const sesionToken = jwt.sign(loginToken, token1);
      res.json(sesionToken); 
      }
    } 
    /*data = { }
    const sesionToken = jwt.sign(data, token1);*/
    
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});