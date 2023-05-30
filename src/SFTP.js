const Client = require('ssh2-sftp-client');
const fs = require('fs');

const config = {
  host: 'langosta.ing.puc.cl', // Coloca el nombre de host o la dirección IP del servidor SFTP
  port: '22', // Puerto del servidor SFTP (por defecto es 22)
  username: 'grupo5_desarrollo', // Nombre de usuario para autenticación
  password: 'JhFQ5FUc!8nuJwE93kDC!7' // Contraseña para autenticación
};

const sftp = new Client();

sftp.connect(config)
  .then(() => {
    console.log('Conexión establecida correctamente');
    return sftp.list('pedidos'); // Obtener lista de archivos en la carpeta "pedidos"
  })
  .then(data => {
    const xmlFiles = data.filter(file => /\.(xml)$/i.test(file.name));
    console.log('Archivos XML en la carpeta "pedidos":');
    xmlFiles.forEach(file => {
      console.log(file.name);
    });

    if (xmlFiles.length > 0) {
        const firstXmlFile = xmlFiles[0];
        console.log(`Leyendo el primer archivo XML: ${firstXmlFile.name}`);
  
        const localPath = `./${firstXmlFile.name}`;
        return sftp.get(`pedidos/${firstXmlFile.name}`, localPath) // Descargar el primer archivo XML
          .then(() => {
            return new Promise((resolve, reject) => {
              fs.readFile(localPath, 'utf-8', (err, fileContent) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(fileContent);
                }
              });
            });
          })
          .then(fileContent => {
            console.log('Contenido del primer archivo XML:');
            console.log(fileContent);
            fs.unlinkSync(localPath); // Eliminar archivo descargado
            return sftp.end(); // Cerrar conexión SFTP
          });
      } else {
        throw new Error('No se encontraron archivos XML en la carpeta "pedidos"');
      }
    })
  .then(() => {
    console.log('Conexión SFTP cerrada correctamente');
  })
  .catch(err => {
    console.error('Error:', err.message);
    sftp.end();
  });


