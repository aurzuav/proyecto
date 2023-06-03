// Importar los módulos necesarios
const { Pool } = require('pg');

// Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'cseverino99_web',
  password: '12345678',
  host: 'localhost',
  database: 'entrega_3',
  port: 5432,
});

// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function poblarTabla() {
  try {
    // Array de diccionarios con los datos de las órdenes a insertar
    const ordenes = [
      {
        id: '1',
        estado: 'Pendiente',
        sku: 'SKU001',
        cantidad: 10,
        canal: 'Tienda en línea',
      },
      {
        id: '2',
        estado: 'En proceso',
        sku: 'SKU002',
        cantidad: 5,
        canal: 'Tienda física',
      },
      // Agregar más órdenes si es necesario
    ];

    // Iterar sobre los diccionarios y realizar la inserción en la tabla
    for (const orden of ordenes) {
      await pool.query(
        `INSERT INTO ordenes (id, estado, sku, cantidad, canal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orden.id, orden.estado, orden.sku, orden.cantidad, orden.canal]
      );
    }

    console.log('La tabla "ordenes" ha sido poblada exitosamente.');
  } catch (error) {
    console.error('Error al poblar la tabla "ordenes":', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await pool.end();
  }
}

// Ejecutar la función para poblar la tabla al iniciar el servidor
poblarTabla();

module.exports = poblarTabla;


//para llamar la función en otro modulo:
//const poblarTabla = require('./bdd.local.js');

// Llamar a la función para poblar la tabla
//poblarTabla();
