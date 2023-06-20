// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');
const { emit } = require('nodemon');
var soap = require('soap');

var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';

// Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  database: 'entrega_3',
  port: 5432,
});

// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function payInvoice(order_id) {
    try {
        soap.createClient(url, {}, function (err, client) {
            console.log(`.describe():`, client.describe());
            var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
            client.setSecurity(wsSecurity);
        
            // client.getBankStatement({}, function (err, result) {
            // const balance = result.BankStatement.balance;
            // });

            const invoice_id = dataDDBB(order_id);

            const info_dict = { invoice_id: `${invoice_id}`};

            client.payInvoice(info_dict, function (err, result) {});

            });
        }
        catch (error) {
            console.log(error.message);
        }

    console.log('Invoice insertado exitosamente');
}

async function dataDDBB(order_id) {
    let client; // Variable para almacenar el cliente de conexión

    try {
        client = await pool.connect(); // Obtener una instancia de cliente de conexión

        const query = `SELECT invoice_id FROM billingdetails WHERE invoice_id = ${order_id}`;
        const data = await client.query(query);
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


module.exports = payInvoice;

