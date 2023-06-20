// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');
const { emit } = require('nodemon');
var soap = require('soap');

var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';


// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function getInvoice() {
    try {
        soap.createClient(url, {}, function (err, client) {
            // console.log(`.describe():`, client.describe());
            console.log(client)
            // var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
            // console.log(wsSecurity)
            // client.setSecurity(wsSecurity);
        
            // client.getInvoicesRequest({}, function (err, result) {
            //     console.log(result)
            // });

            });
        }
        catch (error) {
            console.log(error.message);
        }
}

getInvoice()