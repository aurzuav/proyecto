// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');
const { emit } = require('nodemon');
var soap = require('soap');

var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';


// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function getBalance() {
    try {
        soap.createClient(url, {}, function (err, client) {
            //console.log(`.describe():`, client.describe());
            var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
            client.setSecurity(wsSecurity);
        
            client.getBankStatement({}, function (err, result) {
            const balance = result.BankStatement.balance;
            //console.log(balance)
            return balance;
            });

            });
        }
        catch (error) {
            console.log(error.message);
        }
}


module.exports = getBalance;


getBalance()


