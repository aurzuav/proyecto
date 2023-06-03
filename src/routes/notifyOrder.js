const getToken = require("../app");
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
		//console.log(response.data);
	} catch (error) {
		console.log(error.response.data);
	}
};

module.exports = notifyOrder;