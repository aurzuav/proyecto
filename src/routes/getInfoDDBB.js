// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');
const { emit } = require('nodemon');


// Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  database: 'entrega_3',
  port: 5432,
});

// Definir una función para poblar la tabla "ordenes" a partir de diccionarios

async function getInfoDDBB(order_id) {
    let client; // Variable para almacenar el cliente de conexión

    try {
        client = await pool.connect(); // Obtener una instancia de cliente de conexión

        const query = 'SELECT invoice_id FROM billingdetails WHERE order_id = $1';
        const values = [order_id];
        const data = await client.query(query, values);
        return data.rows;
    } catch (error) {
        console.error('Error al obtener los datos de la tabla "billingDetails":', error);
        throw error; // Agregamos "throw error" para propagar el error
    } finally {
        if (client) {
            client.release(); // Liberar el cliente de conexión
        }
    }
}

// Definir la ruta para obtener los datos de la tabla "ordenes_creadas"
app.get('/details', async function(req, res) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM billingDetails');
    const rows = result.rows;
    res.send(rows);
  } catch (error) {
    console.error('Error al obtener los datos de la tabla "billingDetails":', error);
    res.status(500).send('Error al obtener los datos');
  }
});

// Ejecutar la función para poblar la tabla al iniciar el servidor
//payInvoice(); // Puedes pasar los valores deseados para poblar la tabla aquí


module.exports = getInfoDDBB;

