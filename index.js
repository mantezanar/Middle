const express = require('express');
const cors = require('cors');
import cookieParser from 'cookie-parser'
const {connect} = require('./utils/supabase');


const jwt = require('jsonwebtoken');
const app = express();
const secretToken = "M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==";
var respuesta = ''
app.use(express.json());
app.use(cors());
app.use(cookieParser())

// Ruta protegida
app.post('/', async (req, res) =>{
  const supabase = await connect();
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó el token de autorización' });
  }

   jwt.verify(token, secretToken, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    console.log('Token decodificado:', decoded);
    const correo = decoded.email;
    const contrasena = decoded.pass;
    
    const result =  await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena
     });
     const { user, error } = result;

     if (error) {
        const token = jwt.sign("Credenciales no validas", secretToken);
        res.json(token);
        return;
     } else {
        res.cookie('sesion', result);
        respuesta = jwt.sign(result.data.session.user.aud, secretToken);
        res.json(respuesta);
     }
  });
});


app.post('/pedirsesion', async (req, res) =>{
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const prueba1 = jwt.verify(token, secretToken);
  res.json(respuesta)
  respuesta = ''
});

app.post('/recursos', async (req, res) =>{
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const sesion_recursos = jwt.verify(token, secretToken);
  if (sesion_recursos == "aunteticado")
  {

  }
  respuesta = sesion_recursos
  res.json(respuesta)
  respuesta = ''
});





app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});