const axios = require("axios");



async function getToken() {
	try {
        var url = 'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';

		return token;
	} catch (error) {
		console.error(error);
	}
}

module.exports = getToken;