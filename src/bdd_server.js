const fs = require('fs');
const { Client } = require('ssh2');
const { Pool } = require('pg');
const poblar_or = require("../ordenes_recibidas.js")
const poblar_oc = require("../ordenes_creadas.js")

// Configuración de la conexión SSH
const sshConfig = {
    host: 'lagarto5.ing.puc.cl',
    port: 22,
    username: 'integracion',
    password: 'vZ5!mB3gAtJ1bY'
  };
  

// Configuración de la conexión a la base de datos
const dbConfig = {
    user: 'postgres',
    password: '12345678',
    host: 'lagarto5.ing.puc.cl',
    database: 'entrega_3',
    port: 5432,
  };
  

// Función para poblar la tabla en la base de datos remota
async function poblarServidor() {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();

    sshClient
      .on('ready', () => {
        console.log('Conexión SSH establecida'); // hasta acá bien

        // Establecer una conexión a la base de datos remota
        const pool = new Pool(dbConfig);

        // Array de diccionarios con los datos de las órdenes a insertar
        const ordenes = [
            {
              id: '1',
              estado: 'Pendiente',
              sku: 'SKU001',
              cantidad: 5,
              canal: 'Online',
            },
            {
              id: '2',
              estado: 'En proceso',
              sku: 'SKU002',
              cantidad: 10,
              canal: 'Tienda física',
            },
            {
              id: '3',
              estado: 'Completado',
              sku: 'SKU003',
              cantidad: 3,
              canal: 'Online',
            },
          ];
          

        // Iterar sobre los diccionarios y realizar la inserción en la tabla
        for (const orden of ordenes) {
          pool.query(
            `INSERT INTO ordenes (id, estado, sku, cantidad, canal)
             VALUES ($1, $2, $3, $4, $5)`,
            [orden.id, orden.estado, orden.sku, orden.cantidad, orden.canal],
            (err, res) => {
              if (err) {
                console.error('Error al insertar datos:', err);
              } else {
                console.log('Datos insertados correctamente');
              }
            }
          );
        }

        pool.end((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos:', err);
            reject(err);
          } else {
            console.log('Conexión a la base de datos cerrada');
            sshClient.end();
            resolve();
          }
        });
      })
      .connect(sshConfig)
      .on('error', (err) => {
        console.error('Error en la conexión SSH:', err);
        reject(err);
      });
  });
}

module.exports = poblarServidor;
