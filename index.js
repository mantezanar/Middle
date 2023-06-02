const express = require('express');
const cors = require('cors');
const { connect } = require('./utils/supabase');


const jwt = require('jsonwebtoken');
const app = express();
const secretToken = "M+Yidu6bWMk9GKkJopL0Sk+ri/RRcBFTF5DmxvbBZaJj+ouXBWzNeSb0qf+rG0GuLXqeD34vZ0RKH2LnS+0INw==";
app.use(cors({
  origin: '*', // Asegúrate de que este origen coincida con el de tu cliente
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

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
      const token = jwt.sign("Credenciales no validas", secretToken);
      res.json(token);
      return;
    } else {
      const respuesta = jwt.sign(result, secretToken);
      res.json(respuesta);
    }
  });
});

app.post('/files/algebra', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó el token de autorización' });
  }

  try {
    const supabase = await connect();
    const { data: files, error } = await supabase.storage.from('Ejemplo').list('Algebra');

    if (error) {
      throw error;
    }

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar los archivos' });
  }
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

    let result = await supabase.auth.signUp({
      email: correo,
      password: contrasena
    });
    const token = jwt.sign("Registro completado", secretToken);
    res.json(token);

  });

})

/*
  Crear directorio y escribir en su terminal npm init -y
  luego npm install azure-storage multer express
  finalmente npm install cors
  para instalar supabase npm install @supabase/supabase-js
  npm install @azure/storage-blob
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
const { BlobServiceClient } = require('@azure/storage-blob');
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
const blobService = azure.createBlobService('academicos', 'q0muG31l4muGSQcxB8V9crxcn3oQRHhFl5jYL0B5QB1tlAb6zinLORGrkmtjz9q+C71WBnHPTiHI+AStto8JZg==');
//nombre del contenedor en Almacenamiento de datos-> contenedores
const containerName = 'imagenes';
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=academicos;AccountKey=q0muG31l4muGSQcxB8V9crxcn3oQRHhFl5jYL0B5QB1tlAb6zinLORGrkmtjz9q+C71WBnHPTiHI+AStto8JZg==;EndpointSuffix=core.windows.net'

// Crear una instancia del cliente de Blob Service
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);


//-------------------------------Rutas para el CRUD con la tabla "etiqueta"-------------------------------
// Obtener registros
app.get('/etiquetas', async (req, res) => {
  try {
    const supabase = await connect();
    const { data, error } = await supabase.from('etiqueta').select('*');
    if (error) {
      throw new Error('Error fetching etiqueta');
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
    const supabase = await connect();
    const { etiqueta, description } = req.body;

    const { data, error } = await supabase
      .from('etiqueta')
      .insert({ etiqueta, description });
    if (error) {
      throw new Error('Error creating etiqueta');
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
    const { etiqueta, description } = req.body;

    const supabase = await connect();
    const { data, error } = await supabase
      .from('etiqueta')
      .update({ etiqueta, description })
      .eq('id', id);
    if (error) {
      throw new Error('Error updating etiqueta');
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating etiqueta:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Funcion para eliminar una etiqueta (cascada) y que a su vez se eliminen los archivos relacionados de Azure
async function deleteEtiqueta(id) {
  try {
    // Obtener la etiqueta por su ID
    const supabase = await connect();

    // Obtener los archivos relacionados a la etiqueta
    const { data: archivoData, error: archivoError } = await supabase
      .from('archivo')
      .select('url_azura')
      .eq('etiqueta_id', id);

    if (archivoError) {
      console.error(archivoError);
      return;
    }

    const archivos = archivoData;

    // Eliminar los archivos del contenedor de Azure Blob Storage
    archivos.forEach(async (archivo) => {
      const blobName = archivo.url_azura.split('/').pop(); // Obtener el nombre del archivo del URL

      blobService.deleteBlobIfExists(containerName, blobName, (error, result) => {
        if (error) {
          console.error('Error deleting blob:', error);
          return;
        } else {
          console.log('Blob deleted successfully:', blobName);
        }
      });
    });

    // Eliminar la etiqueta y los archivos relacionados en la base de datos
    const { data, error } = await supabase
      .from('etiqueta')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting etiqueta:', error.message);
      return;
    }
    console.log('Etiqueta and related archivos deleted successfully');
  } catch (error) {
    console.error('Error durante la eliminacion de etiqueta:', error.message);
    throw error;
  }
}

// Eliminar una etiqueta
app.delete('/etiquetas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEtiqueta(id);
    res.json({ message: 'Etiqueta y archivos relacionados eliminados' });
  } catch (error) {
    console.error('Error durante la eliminacion de etiqueta:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
      throw new Error('Error fetching archivos from Supabase');
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

    const email = req.body.email;
    const etiqueta_id = req.body.etiqueta_id;

    const mimeType = mime.lookup(originalFileName); // Obtener el tipo MIME basado en la extensión del archivo
    console.log('MIME Type:', mimeType);
    const options = {
      contentSettings: {
        contentType: mimeType // Establecer el tipo MIME obtenido
      }
    };
    blobService.createBlockBlobFromLocalFile(containerName, blobName, filePath, options, (error) => {
      if (error) {
        console.log('Error uploading file:', error);
        res.status(500).send('Error uploading file');
      }
    });

    const url_azura = blobService.getUrl(containerName, blobName);
    const supabase = await connect();

    const nombre_archivo = req.body.nombre_archivo || originalFileName;
    const { data, error } = await supabase
      .from('archivo')
      .insert([{ email, etiqueta_id, url_azura, formato: mimeType, nombre_archivo }]);

    if (error) {
      console.error('Error creating archivo:', error.message);
      return;
    }
    console.log('Archivo creado exitosamente');

  } catch (error) {
    console.error('Error creating archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Crear un registro
app.post('/archivo', upload.single('file'), async (req, res) => {
  try {
    await createArchivo(req, res);
    res.json({ message: 'Registro creado exitosamente' });
  } catch (error) {
    console.error('Error creating archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
      console.error(archivoError);
      return;
    }
    const blobUrl = archivoData.url_azura;
    const blobName = blobUrl.substring(blobUrl.lastIndexOf('/') + 1);

    blobService.createBlockBlobFromLocalFile(containerName, blobName, filePath, options, (error) => {
      if (error) {
        console.log('Error uploading file:', error);
        res.status(500).send('Error uploading file');
      }
    });

    const url_azura = blobService.getUrl(containerName, blobName);
    const nombre_archivo = req.body.nombre_archivo || originalFileName;
    const { data, error } = await supabase
      .from('archivo')
      .update({ url_azura, nombre_archivo})
      .eq('id', id);

    if (error) {
      console.error('Error updating archivo:', error.message);
      return;
    }
    console.log('Archivo actualizado exitosamente');
  } catch (error) {
    console.error('Error updating archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Actualizar un registro
app.put('/archivo/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    await updateArchivo(id, req, res);
    res.json({ message: 'Registro actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
      console.error(archivoError);
      return;
    }

    const blobUrl = archivoData.url_azura;
    const blobName = blobUrl.substring(blobUrl.lastIndexOf('/') + 1);

    await containerClient.deleteBlob(blobName); // Eliminar el archivo en Azure Blob Storage

    const { data, error } = await supabase
      .from('archivo')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting archivo:', error.message);
      return;
    }
    console.log('Archivo eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Eliminar un registro
app.delete('/archivo/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteArchivo(id, res);
    res.json({ message: 'Archivo eliminado' });
  } catch (error) {
    console.error('Error durante la eliminación del archivo:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});