// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');
const { emit } = require('nodemon');
var soap = require('soap');

var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';


// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function getInvoice(order_id) {
    try {
        soap.createClient(url, {}, function (err, client) {
            //console.log(`.describe():`, client.describe());
            //console.log(client)
            var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
            //console.log(wsSecurity)
            client.setSecurity(wsSecurity);
            const requestBody = { status: 'pending', side: 'client'}
            client.getInvoices(requestBody, function (err, result) {
                const invoices = result.BillingDetails;
                for (let invoice of invoices) {
                    console.log("entro for");
                    console.log(invoice.id);
                    return invoice.id;
                }
            });

            });
        }
        catch (error) {
            console.log(error.message);
        }
}

module.exports = getInvoice;

//getInvoice()