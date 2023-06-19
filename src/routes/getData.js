const { emit } = require('nodemon');
var soap = require('soap');
const billingDetails = require('./billingDetails');
const payInvoice = require('./payInvoice');
var url =
    'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';
var emitInvoiceArgs = { order_id: '648f2341fd1aaae5de314e09' };

var emit_try = { status: 'aceptada', side: 'B2B' };

// va a tener type y info_dict
async function getData(info_dict) {
    try {
        // we create client
        soap.createClient(url, {}, function (err, client) {
            console.log(`.describe():`, client.describe());
            var wsSecurity = new soap.WSSecurity('5', 'p=HjsR<8qUDZ9kSEdv', {});
            client.setSecurity(wsSecurity);

            // emit statement B2B
        client.emitInvoice(info_dict, function (err, result) {
            console.log("entro a B2B")
            console.log(`emit: ${JSON.stringify(result)}`)
            console.log(`emitInvoice Error:
            ${JSON.stringify(err.root.Envelope.Body)}`)
            //billingDetails(todos los inputs);
        })
        });
        payInvoice();
    }
    catch (error) {
        console.log(error.message);
    }
}



module.exports = getData;

