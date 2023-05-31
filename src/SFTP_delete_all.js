const Client = require('ssh2-sftp-client');
const fs = require('fs');
const xml2js = require('xml2js');

const config = {
  host: 'langosta.ing.puc.cl', // Coloca el nombre de host o la dirección IP del servidor SFTP
  port: '22', // Puerto del servidor SFTP (por defecto es 22)
  username: 'grupo5_desarrollo', // Nombre de usuario para autenticación
  password: 'JhFQ5FUc!8nuJwE93kDC!7' // Contraseña para autenticación
};

 sftp = new Client();

sftp.connect(config)
  .then(() => {
    console.log('Conexión establecida correctamente');
    return sftp.list('./pedidos'); // Obtener lista de archivos en la carpeta "pedidos"
  })
  .then(files => {
    // Eliminar cada archivo de la lista
    const deletePromises = files.map(file => sftp.delete(file.name));
    return Promise.all(deletePromises);
  })
  .then(() => {
    console.log('Todos los archivos fueron eliminados correctamente');

    // Cerrar conexión SFTP
    return sftp.end();
  })
  .then(() => {
    console.log('Conexión SFTP cerrada correctamente');
  })
  .catch(err => {
    console.error('Error:', err.message);
    sftp.end();
  });




