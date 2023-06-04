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
async function poblarTabla(id, estado, sku, cantidad, grupo) {
  let client; // Variable para almacenar el cliente de conexión

  try {
    client = await pool.connect(); // Obtener una instancia de cliente de conexión

    await client.query(
      `INSERT INTO ordenes_creadas (id, estado, sku, cantidad, grupo)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, estado, sku, cantidad, grupo]
    );

    console.log('La tabla "ordenes_creadas" ha sido poblada exitosamente.');
  } catch (error) {
    console.error('Error al poblar la tabla "ordenes_creadas":', error);
  } finally {
    if (client) {
      client.release(); // Liberar el cliente de conexión
    }
  }
}

// Definir la ruta para obtener los datos de la tabla "ordenes_creadas"
app.get('/ordenes', async function(req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM ordenes_creadas');
    const rows = result.rows;
    res.send(rows);
  } catch (error) {
    console.error('Error al obtener los datos de la tabla "ordenes_creadas":', error);
    res.status(500).send('Error al obtener los datos');
  }
});

// Ejecutar la función para poblar la tabla al iniciar el servidor
poblarTabla(); // Puedes pasar los valores deseados para poblar la tabla aquí



module.exports = poblarTabla;
