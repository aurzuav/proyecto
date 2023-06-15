const Client = require('ssh2-sftp-client');
const fs = require('fs');
const xml2js = require('xml2js');

async function leerArchivosXML() {
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

  const sftp = new Client();

  try {
    await sftp.connect(config);

    const data = await sftp.list('pedidos');
    const xmlFiles = data.filter(file => /\.(xml)$/i.test(file.name));

    if (xmlFiles.length > 0) {
      const pedidos = [];

      for (const xmlFile of xmlFiles) {
        const localPath = `./${xmlFile.name}`;
        await sftp.get(`pedidos/${xmlFile.name}`, localPath);

        const fileContent = fs.readFileSync(localPath, 'utf-8');
        const xmlObject = await new Promise((resolve, reject) => {
          xml2js.parseString(fileContent, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        const id = xmlObject.order.id[0];
        const sku = xmlObject.order.sku[0];
        const qty = xmlObject.order.qty[0];

        const pedido = {
          id,
          sku,
          qty
        };

        pedidos.push(pedido);

        await sftp.delete(`pedidos/${xmlFile.name}`); // Eliminar archivo del servidor SFTP
        fs.unlinkSync(localPath); // Eliminar archivo descargado
      }

      await sftp.end();
      return pedidos;
    } else {
      throw new Error('No se encontraron archivos XML en la carpeta "pedidos"');
    }
  } catch (err) {
    sftp.end();
    throw err;
  }
}

module.exports = leerArchivosXML;
