const axios = require("axios");

async function notifyOrder(data, group, orderId) {
//notificar al grupo que la orden fue creada
	// console.log("notificando orden");
	// console.log(group);
	try {
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
		};
		const response = await axios.post(
			`http://lagarto${group}.ing.puc.cl/ordenes-compra/${orderId}`,
			requestBody,
			{ headers }
		);
		console.log("funcionó notify")
		console.log( response.data);
	} catch (error) {
		console.log("NO FUNCIONO notify :((((")
		//console.log(error);
	}
};

module.exports = notifyOrder;