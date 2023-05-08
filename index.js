const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const supabase = require("./utils/supabase");
const app = express();
app.use(express.json());
//secretToken =
const token1 = 'M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==';
//token2 = 
const JWT_SECRET = 'DEE18F06FAA7F52C346E1569E13F5A85F501D844E5DD1D4DC7CA81A378A1C37A'; 
const util = require('util');
const { log } = require('console');

//
app.use(cors());

// Ruta protegida
app.post('/', async (req, res) =>{
  const supabase = await connect();
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó el token de autorización' });
  }else {
    jwt.verify(token, secretToken, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }else {
      console.log('Token decodificado:', decoded);
    const correo = decoded.email;
    const contrasena = decoded.pass;
    
    const result =  await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena
     });
    const { user, error } = result;
     if (error) {
        const token = jwt.sign("Credenciales no validas", JWT_SECRET);
        res.json({token});
        return;
     } else {
        const token = jwt.sign(result.data.session.user, JWT_SECRET);
        res.json({token});
     }
    }
  });
  }
});


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

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});