// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');

// Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  database: 'entrega_3',
  port: 5432,
});

// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function billingDetails(id, id_orden, client, supplier, channel, status, price, interest, totalprice, created, updated) {
    console.log("entro a billingDetails");
    let client1; // Variable para almacenar el client1e de conexión

  try {
    client1 = await pool.connect(); // Obtener una instancia de client1e de conexión

    await client1.query(
      `INSERT INTO BillingDetails (invoice_id, order_id, client, supplier, channel, status, price, interest, totalprice, created, updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, id_orden, client, supplier, channel, status, price, interest, totalprice, created, updated]
    );

    console.log('Invoice insertado exitosamente');
  } catch (error) {
    console.error('Error al poblar la tabla "billingDetails":', error);
  } finally {
    if (client1) {
      client1.release(); // Liberar el client1e de conexión
    }
  }
}

// Definir la ruta para obtener los datos de la tabla "ordenes_creadas"
app.get('/details', async function(req, res) {
  try {
    const client1 = await pool.connect();
    const result = await client1.query('SELECT * FROM billingDetails');
    const rows = result.rows;
    res.send(rows);
  } catch (error) {
    console.error('Error al obtener los datos de la tabla "billingDetails":', error);
    res.status(500).send('Error al obtener los datos');
  }
});

// Ejecutar la función para poblar la tabla al iniciar el servidor
//billingDetails(); // Puedes pasar los valores deseados para poblar la tabla aquí


module.exports = billingDetails;

