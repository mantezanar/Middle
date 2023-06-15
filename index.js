//npm install dotenv
require("dotenv").config(); // Cargar variables de entorno desde un archivo .env

const express = require('express');
const cors = require('cors');
const { connect } = require('./utils/supabase');

const jwt = require('jsonwebtoken');
const app = express();
const secretToken = process.env.secretToken;
app.use(cors({
  origin: '*', // Asegúrate de que este origen coincida con el de tu cliente
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

async function seaching_id(email, result, res) {
  try {
    // Buscar el id del usuario mediante el email
    const supabase = await connect();
    const { data, error } = await supabase
      .from('usuario')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      // Error al consultar la información del usuario
      console.error('Error al consultar la información del usuario:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const resultado = {
      result: result,
      id: data.id
    }
    const token = jwt.sign(resultado, secretToken);
    console.log("Ingresado correctamente")
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Ruta protegida
app.post('/', async (req, res) => {
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

    const result = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena
    });
    const { user, error } = result;

    if (error) {
      console.log(error.message);
      const token = jwt.sign("Credenciales no validas", secretToken);
      return res.json(token);
    } else {
      //Se busca el id del email de la tabla usuaraiopara devolverlo al cliente
      await seaching_id(correo, result, res)
    }
  });
});

app.post('/registro', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const supabase = await connect();
  jwt.verify(token, secretToken, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    const correo = decoded.email;
    const contrasena = decoded.password;

    //Para guardar los datos del usuario en la tabla usuario,guardo el email y por defecto el rol de Alumno
    const role = 'Alumno'

    //Mapearlo
    const { data, error } = await supabase
      .from('usuario')
      .insert({ email: correo, role });
    if (error) {
      console.log(error.message);
      return res.status(500).json({ error: 'Error creating usuario' });
    }

    let result = await supabase.auth.signUp({
      email: correo,
      password: contrasena
    });

    console.log("Registrado Correctamente")
    const token = jwt.sign("Registro completado", secretToken);
    res.json(token);
  });

})

/*
  Crear directorio y escribir en su terminal npm init -y
  luego npm install azure-storage multer express
  finalmente npm install cors
  para instalar supabase npm install @supabase/supabase-js
  para el token  npm install jsonwebtoken
  para ejecutar node server.js
*/

/*
  al crear un el recurso en la cuenta de almacenamiento ir a Uso compartido de recursos (CORS)
  y agregrar en blog service un permiso origenes permitidos * y metodos permitidos lo que se deseeen
*/


// Importar la función connect desde './utils/supabase'
//azure-storage para interactuar con Azure Blob Storage.
const azure = require('azure-storage');
//Utilizo el paquete multer para manejar la carga de archivos
const multer = require('multer');
//Para generar nombre unicos para los archivos
const uuid = require('uuid');
/*
El problema probablemente se deba a que el tipo MIME del archivo 
no se establece correctamente durante la carga. Para solucionarlo, 
puedes usar el paquete mime-types para obtener el tipo MIME basado en la 
extensión del archivo y luego establecerlo en las opciones de carga.
*/
const mime = require('mime-types');

const upload = multer({ dest: 'uploads/' });
//nombre de la cuenta de almacenamiento y clave(no Cadena de conexión)+
//se consiguen en Claves de acceso
const AccountName = process.env.AccountName;
const AccountKey = process.env.AccountKey;
//nombre del contenedor en Almacenamiento de datos-> contenedores
const containerName = process.env.containerName;

const blobService = azure.createBlobService(AccountName, AccountKey);

//-------------------------------Rutas para el CRUD con la tabla "etiqueta"-------------------------------

// Obtener registros
app.get('/etiquetas', async (req, res) => {
  try {
    const supabase = await connect();
    const { data, error } = await supabase.from('etiqueta').select('*');
    if (error) {
      return res.status(500).json({ error: 'Error fetching etiqueta' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching etiquetas:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Crear un registro
app.post('/etiquetas', async (req, res) => {
  try {
    //Se añadi al autor del la etiqueta
    const supabase = await connect();
    const { etiqueta, description, categoria, usuario_id } = req.body;

    const { data, error } = await supabase
      .from('etiqueta')
      .insert({ etiqueta, description, usuario_id, categoria });
    if (error) {
      return res.status(500).json({ error: 'Error creating etiqueta' });
    }
    res.json({ message: 'Registro creado exitosamente' });
  } catch (error) {
    console.error('Error creating etiqueta:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Actualizar un registro
app.put('/etiquetas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { etiqueta, description, categoria } = req.body;

    const supabase = await connect();
    const { data, error } = await supabase
      .from('etiqueta')
      .update({ etiqueta, description, categoria })
      .eq('id', id);
    if (error) {
      return res.status(500).json({ error: 'Error updating etiqueta' });
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating etiqueta:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Funcion para eliminar una etiqueta (cascada) y que a su vez se eliminen los archivos relacionados de Azure
async function deleteEtiqueta(id, res) {
  try {
    // Obtener la etiqueta por su ID

    const supabase = await connect();
    // Obtener los archivos relacionados a la etiqueta
    const { data: archivoData, error: archivoError } = await supabase
      .from('archivo')
      .select('url_azura')
      .eq('etiqueta_id', id);

    if (archivoError) {
      return res.status(500).json({ archivoError: 'Error seaching etiqueta' });
    }

    const archivos = archivoData;

    // Eliminar los archivos del contenedor de Azure Blob Storage
    archivos.forEach(async (archivo) => {
      const blobName = archivo.url_azura.split('/').pop(); // Obtener el nombre del archivo del URL

      //Se utiliza promesa para utilizar resolve y reject para controlar el flujo y el manejo de errores.
      //Al momento de un error se ejecutara el catch correspondiente 
      await new Promise((resolve, reject) => {
        blobService.deleteBlobIfExists(containerName, blobName, (error, result) => {
          if (error) {
            //Pasa el catch externo
            reject(error);
          } else {
            //Si funciona seguira el codigo normalmente
            resolve();
          }
        });
      });

    });

    // Eliminar la etiqueta y los archivos relacionados en la base de datos
    const { data, error } = await supabase
      .from('etiqueta')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting etiqueta:', error.message);
      return res.status(500).json({ archivoError: 'Error deleting etiqueta' });
    }
    console.log('Etiqueta and related archivos deleted successfully');
    res.json({ message: 'Etiqueta y archivos relacionados eliminados' });
  } catch (error) {
    console.error('Error durante la eliminacion de etiqueta:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Eliminar una etiqueta
app.delete('/etiquetas/:id', async (req, res) => {
  const { id } = req.params;
  await deleteEtiqueta(id,res);
});


//-------------------------------Rutas para el CRUD con la tabla "archivo"-------------------------------

// Obtener registros
app.get('/archivo', async (req, res) => {
  try {
    const { id } = req.query;
    const supabase = await connect();
    const { data, error } = await supabase
      .from('archivo')
      .select('*')
      .eq('etiqueta_id', id);

    if (error) {
      return res.status(500).json({ error: 'Error fetching archivos' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching archivos:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Función para cargar un archivo a Azure Blob Storage y crear un registro
async function createArchivo(req, res) {
  try {

    const file = req.file;
    const filePath = file.path;
    const originalFileName = file.originalname;
    const blobName = uuid.v4(); // Genera un nombre único para el archivo en Azure Blob Storage

    const usuario_id = req.body.usuario_id;
    const etiqueta_id = req.body.etiqueta_id;

    const mimeType = mime.lookup(originalFileName); // Obtener el tipo MIME basado en la extensión del archivo
    console.log('MIME Type:', mimeType);
    const options = {
      contentSettings: {
        contentType: mimeType // Establecer el tipo MIME obtenido
      }
    };

    //Al ser un callback, aun con el error el codigo se seguira ejecutando, con Promise evito que pase esto
    //Se utiliza promesa para utilizar resolve y reject para controlar el flujo y el manejo de errores.
    //Al momento de un error se ejecutara el catch correspondiente 
    await new Promise((resolve, reject) => {
      blobService.createBlockBlobFromLocalFile(containerName, blobName, filePath, options, (error) => {
        if (error) {
          console.log('Error uploading file:', error);
          //Pasa el catch externo
          reject(error);
        } else {
          //Si funciona seguira el codigo normalmente
          resolve();
        }
      });
    });


    const url_azura = blobService.getUrl(containerName, blobName);
    const supabase = await connect();

    const nombre_archivo = req.body.nombre_archivo || originalFileName;
    const { data, error } = await supabase
      .from('archivo')
      .insert([{ usuario_id, etiqueta_id, url_azura, formato: mimeType, nombre_archivo }]);

    if (error) {
      console.error('Error creating archivo:', error.message);
      return res.status(500).json({ error: 'Error creating archivo' });
    }
    console.log('Archivo creado exitosamente');
    res.json({ message: 'Registro creado exitosamente' });

  } catch (error) {
    console.error('Error creating archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Crear un registro
app.post('/archivo', upload.single('file'), async (req, res) => {
  await createArchivo(req, res);
});

// Función para actualizar un archivo en Azure Blob Storage y actualizar el registro
async function updateArchivo(id, req, res) {
  try {
    const file = req.file;
    const filePath = file.path;
    const originalFileName = file.originalname;

    const mimeType = mime.lookup(originalFileName); // Obtener el tipo MIME basado en la extensión del archivo
    console.log('MIME Type:', mimeType);
    const options = {
      contentSettings: {
        contentType: mimeType // Establecer el tipo MIME obtenido
      }
    };

    const supabase = await connect();
    // Obtener el archivo relacionado a la etiqueta
    const { data: archivoData, error: archivoError } = await supabase
      .from('archivo')
      .select('url_azura')
      .eq('id', id)
      .single();

    if (archivoError) {
      return res.status(500).json({ error: 'Error seaching archivo' });
    }
    const blobUrl = archivoData.url_azura;
    const blobName = blobUrl.substring(blobUrl.lastIndexOf('/') + 1);

    //Se utiliza promesa para utilizar resolve y reject para controlar el flujo y el manejo de errores.
    //Al momento de un error se ejecutara el catch correspondiente 
    await new Promise((resolve, reject) => {
      blobService.createBlockBlobFromLocalFile(containerName, blobName, filePath, options, (error) => {
        if (error) {
          console.log('Error uploading file:', error);
          //Pasa el catch externo
          reject(error);
        } else {
          //Si funciona seguira el codigo normalmente
          resolve();
        }
      });
    });

    const url_azura = blobService.getUrl(containerName, blobName);
    const nombre_archivo = req.body.nombre_archivo || originalFileName;
    const { data, error } = await supabase
      .from('archivo')
      .update({ url_azura, nombre_archivo, formato: mimeType })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error updating archivo' });
    }
    console.log('Archivo actualizado exitosamente');
    res.json({ message: 'Registro actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Actualizar un registro
app.put('/archivo/:id', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  await updateArchivo(id, req, res);
});

// Función para eliminar un archivo de Azure Blob Storage y eliminar el registro
async function deleteArchivo(id, res) {
  try {
    const supabase = await connect();
    // Obtener el archivo relacionado a la etiqueta
    const { data: archivoData, error: archivoError } = await supabase
      .from('archivo')
      .select('url_azura')
      .eq('id', id)
      .single();

    if (archivoError) {
      return res.status(500).json({ error: 'Error seaching archivo' });
    }

    const blobUrl = archivoData.url_azura;
    const blobName = blobUrl.substring(blobUrl.lastIndexOf('/') + 1);

    //Se utiliza promesa para utilizar resolve y reject para controlar el flujo y el manejo de errores.
    //Al momento de un error se ejecutara el catch correspondiente 
    await new Promise((resolve, reject) => {
      blobService.deleteBlobIfExists(containerName, blobName, (error, result) => {
        if (error) {
          console.error('Error deleting blob:', error);
          //Pasa el catch externo
          reject(error);
        } else {
          //Si funciona seguira el codigo normalmente
          resolve();
        }
      }); // Eliminar el archivo en Azure Blob Storage
    });

    console.log('Blob deleted successfully:', blobName);

    const { data, error } = await supabase
      .from('archivo')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting archivo:', error.message);
      return res.status(500).json({ error: 'Error deleting archivo' });
    }
    console.log('Archivo eliminado exitosamente');
    res.json({ message: 'Archivo eliminado' });
  } catch (error) {
    console.error('Error deleting archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Eliminar un registro
app.delete('/archivo/:id', async (req, res) => {
  const { id } = req.params;
  await deleteArchivo(id, res);
});

//-------------------------------Rutas para las Funciones de roles-------------------------------

//Verificar que el usuario es administrador
app.post("/admin", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  jwt.verify(token, secretToken, async (err, decoded) => {

    if (err) {
      // Devolver un mensaje de error si el token es inválido
      return res.status(403).json({ message: 'Token inválido' });
    }

    try {
      // Verificar si el usuario es administrador
      const supabase = await connect();
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('id', decoded)
        .single();

      if (error) {
        // Error al consultar la información del usuario
        console.error('Error al consultar la información del usuario:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const userRole = data.role;

      if (userRole === 'Administrador') {
        // El usuario es administrador, realizar la acción de envío de correo
        // Aquí puedes agregar la lógica para enviar el correo electrónico
        res.json({ message: 'Correo enviado correctamente.' });
      } else {
        // El usuario no es administrador, devuelve una respuesta de acceso denegado
        res.status(403).json({ message: 'Acceso denegado.' });
      }
    } catch (error) {
      console.error('Error de búsqueda:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});
//Buscar el Rol del Usuario
app.get("/buscar", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  jwt.verify(token, secretToken, async (err, decoded) => {

    if (err) {
      // Devolver un mensaje de error si el token es inválido
      return res.status(403).json({ message: 'Token inválido' });
    }

    try {
      // Verificar si el usuario es administrador
      const supabase = await connect();
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('id', decoded)
        .single();

      if (error) {
        // Error al consultar la información del usuario
        console.error('Error al consultar la información del usuario:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const token = jwt.sign(data.role, secretToken);
      res.json(token);

    } catch (error) {
      console.error('Error de búsqueda:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});
//Obtener los Datos del usuario
app.get('/usuario', async (req, res) => {
  try {
    const supabase = await connect();
    const { data, error } = await supabase.from('usuario').select('*');
    if (error) {
      return res.status(500).json({ error: 'Error seaching usuario' });
    }
    if (!data) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});
//Cambiar el rol de un Usuario determinado
app.put('/usuario/:id', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  jwt.verify(token, secretToken, async (err, decoded) => {

    if (err) {
      // Devolver un mensaje de error si el token es inválido
      return res.status(403).json({ message: 'Token inválido' });
    }
    const role = decoded;
    try {
      //Verificar que el usuario existe
      const supabase = await connect();
      const { data: usuarioExistente, error: errorusuarioExistente } = await supabase
        .from('usuario')
        .select('id')
        .eq('id', id);

      if (errorusuarioExistente) {
        return res.status(500).json({ error: 'Error seaching usuario' });
      }

      if (usuarioExistente.length === 0) {
        console.log("Usuario no encontrado")
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      //Cambiar rol de usuario
      const { data, error } = await supabase
        .from('usuario')
        .update({ role })
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Error update usuario' });
      }
      res.json({ message: 'Rol del usuario actualizado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el rol del usuario' });
    }
  });
});

//-------------------------------Funciones Extras-------------------------------

//Filtrar elementos de etiqueta mediante etiqueta y categoria
app.get('/filtrar', async (req, res) => {
  const etiqueta = req.query.etiqueta;
  const categoria = req.query.categoria;
  try {
    const supabase = await connect();
    let query = supabase.from('etiqueta').select('*');

    if (etiqueta && categoria) {
      query = query.ilike('etiqueta', `%${etiqueta}%`).ilike('categoria', `%${categoria}%`);
    } else if (etiqueta) {
      query = query.ilike('etiqueta', `%${etiqueta}%`);
    } else if (categoria) {
      query = query.ilike('categoria', `%${categoria}%`);
    }

    // Realizar la consulta a la tabla "etiqueta"
    const { data, error } = await query;

    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error en el servidor');
    } else {
      res.json(data); // Enviar los resultados como respuesta (puedes ajustarlo según tus necesidades)
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error en el servidor');
  }
});

//Filtrar elementos de archivo mediante nombre del archivo y formato
app.get('/filtrar_archivo', async (req, res) => {
  const nombre_archivo = req.query.nombre;
  const formato = req.query.formato;
  const id = req.query.id;

  try {
    const supabase = await connect();
    let query = supabase.from('archivo').select('*').eq('etiqueta_id', id);;

    if (nombre_archivo && formato) {
      query = query.ilike('nombre_archivo', `%${nombre_archivo}%`).ilike('formato', `%${formato}%`);
    } else if (nombre_archivo) {
      query = query.ilike('nombre_archivo', `%${nombre_archivo}%`);
    } else if (formato) {
      query = query.ilike('formato', `%${formato}%`);
    }

    // Realizar la consulta a la tabla "nombre_archivo"
    const { data, error } = await query;

    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error en el servidor');
    } else {
      res.json(data); // Enviar los resultados como respuesta (puedes ajustarlo según tus necesidades)
    }
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    res.status(500).send('Error en el servidor');
  }
});
// Obtener categorias
app.get('/categoria', async (req, res) => {
  try {
    const supabase = await connect();
    const { data, error } = await supabase.from('etiqueta').select('categoria');
    if (error) {
      return res.status(500).json({ error: 'Error fetching categoria' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching categoria:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Obtener Formatos
app.get('/formato', async (req, res) => {
  try {
    const { id } = req.query;
    const supabase = await connect();
    const { data, error } = await supabase
      .from('archivo')
      .select('formato')
      .eq('etiqueta_id', id);

    if (error) {
      return res.status(500).json({ error: 'Error fetching formato' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching formato:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(4041, () => {
  console.log('Servidor iniciado en el puerto 4041');
});