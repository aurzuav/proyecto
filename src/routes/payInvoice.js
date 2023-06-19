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
async function payInvoice() {
  let client; // Variable para almacenar el cliente de conexión

  try {
    client = await pool.connect(); // Obtener una instancia de cliente de conexión

    const data = await client.query(
      `SELECT * FROM billingdetails`);

    try {
        soap.createClient(url, {}, function (err, client1) {
            console.log(`.describe():`, client1.describe());
            var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
            client1.setSecurity(wsSecurity);
        
            client1.getBankStatement({}, function (err, result) {
            const balance = result.BankStatement.balance;
            });

            while (balance > 1000) {
                for (bill in data) {
                    const id = data.id;
                    const dict = { invoice_id: `${id}` }
                    client1.payInvoice(info_dict, function (err, result) {});
                    balance = balance - data.totalprice;
                    deleteRow(id);
                }
            }
            });
        }
        catch (error) {
            console.log(error.message);
        }

    console.log('Invoice insertado exitosamente');
  } catch (error) {
    console.error('Error al poblar la tabla "billingDetails":', error);
  } finally {
    if (client) {
      client.release(); // Liberar el cliente de conexión
    }
  }
}

async function deleteRow(id) {
    try {

    let client2 = await pool.connect();
    await client2.query(
        `DELETE FROM billingdetails WHERE id = ${id}`);
    }
    catch (error) {
        console.log(error.message);
    } finally {
        client2.release();
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
payInvoice(); // Puedes pasar los valores deseados para poblar la tabla aquí


module.exports = payInvoice;

