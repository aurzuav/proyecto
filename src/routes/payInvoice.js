// Importar los módulos necesarios
const { emit } = require('nodemon');
const util = require('util');
var soap = require('soap');
const getBalance = require('./getBalance');
const getInfoDDBB = require('./getInfoDDBB');


var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';



// Definir una función para poblar la tabla "ordenes" a partir de diccionarios

const createClientAsync = util.promisify(soap.createClient);

async function payInvoice(order_id) {
    try {
        const client = await createClientAsync(url, {});
        console.log(`.describe():`, client.describe());

        var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
        client.setSecurity(wsSecurity);

        const data_ddbb = await getInfoDDBB(order_id);
        console.log(data_ddbb);

        const invoice_id = data_ddbb[0].invoice_id;
        const info_dict = { invoice_id: `${invoice_id}` };

        client.payInvoice(info_dict, function (err, result) {
            if (err) {
                console.log(err.message);
                return;
            }
            // Process the result if needed
        });

    } catch (error) {
        console.log(error.message);
    }

    console.log('Invoice inserted successfully');
}



module.exports = payInvoice;

