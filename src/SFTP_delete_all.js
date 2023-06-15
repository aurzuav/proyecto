const Client = require('ssh2').Client;

const config = {
  host: 'langosta.ing.puc.cl', // Coloca el nombre de host o la dirección IP del servidor SFTP
  port: '22', // Puerto del servidor SFTP (por defecto es 22)
  username: 'grupo5_desarrollo', // Nombre de usuario para autenticación
  password: 'JhFQ5FUc!8nuJwE93kDC!7' // Contraseña para autenticación
};

// const config = {
//   host: 'langosta.ing.puc.cl', // Coloca el nombre de host o la dirección IP del servidor SFTP
//   port: '22', // Puerto del servidor SFTP (por defecto es 22)
//   username: 'grupo5_produccion', // Nombre de usuario para autenticación
//   password: 'saMXkp8!wP%B!SUA+NbE-w' // Contraseña para autenticación
// };

const conn = new Client();

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;

    const carpetaAEliminar = '/pedidos';

    eliminarArchivosXMLRecursivamente(sftp, carpetaAEliminar)
      .then(() => {
        console.log('Archivos XML eliminados con éxito');
        conn.end();
      })
      .catch((err) => {
        console.error('Error al eliminar archivos XML:', err);
        conn.end();
      });
  });
});

function eliminarArchivosXMLRecursivamente(sftp, carpeta) {
  return new Promise((resolve, reject) => {
    sftp.readdir(carpeta, (err, archivos) => {
      if (err) {
        reject(err);
        return;
      }

      const promesasEliminacion = archivos.map((archivo) => {
        const rutaArchivo = `${carpeta}/${archivo.filename}`;

        if (archivo.attrs.isDirectory()) {
          // Si es un directorio, llamamos recursivamente a la función para eliminar los archivos dentro de él
          return eliminarArchivosXMLRecursivamente(sftp, rutaArchivo);
        } else if (archivo.filename.endsWith('.xml')) {
          // Si es un archivo XML, lo eliminamos
          return new Promise((resolve, reject) => {
            sftp.unlink(rutaArchivo, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } else {
          // No es un archivo XML, no hacemos nada
          return Promise.resolve();
        }
      });

      Promise.all(promesasEliminacion)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  });
}

conn.connect(config);
