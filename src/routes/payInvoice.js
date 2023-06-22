// Importar los módulos necesarios
const { emit } = require('nodemon');
const util = require('util');
var soap = require('soap');
const getBalance = require('./getBalance');
const getInfoDDBB = require('./getInfoDDBB');
const getInvoice = require('./getInvoice');


var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';



// Definir una función para poblar la tabla "ordenes" a partir de diccionarios

const createClientAsync = util.promisify(soap.createClient);

async function payInvoice(order_id) {
    try {
        console.log("entro a payinvoice");
        const client = await createClientAsync(url, {});
        //console.log(`.describe():`, client.describe());

        var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
        client.setSecurity(wsSecurity);

        const invoice_id = await getInfoDDBB(order_id);

        // console.log("invoice_id");
        // console.log(invoice_id);

        const requestBody = { status: 'pending', side: 'client'}
        client.getInvoices(requestBody, function (err, result) {
            const invoices = result.BillingDetails;
            for (let invoice of invoices) {
                console.log("entro for");
                console.log(invoice.id);
                if (invoice_id === invoice.id) {;
                    console.log("entro if");
                    console.log(invoice_id);
                    const info_dict = { invoice_id: `${invoice_id}` };

                    client.payInvoice(info_dict, function (err, result) {
                        if (err) {
                            console.log(err.message);
                            return;
                        } else {
                            console.log(result);
                            console.log("Invoice payed successfully");
                        }
                        // Process the result if needed
                    });
                    break;
                }
            }
        });

        // const info_dict = { invoice_id: `${invoice_id}` };

        // client.payInvoice(info_dict, function (err, result) {
        //     if (err) {
        //         console.log(err.message);
        //         return;
        //     } else {
        //         console.log(result);
        //         console.log("Invoice payed successfully");
        //     }
        //     // Process the result if needed
        // });

    } catch (error) {
        console.log(error.message);
    }

    //console.log('Invoice payed successfully');
}


module.exports = payInvoice;

