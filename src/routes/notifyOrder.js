const axios = require("axios");

async function notifyOrder(estado, group, orderId) {
//notificar al grupo que la orden fue creada
	// console.log("notificando orden");
	// console.log(group);
	try {
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
		};
		const response = await axios.patch(
			`http://lagarto${group}.ing.puc.cl/ordenes-compra/${orderId}`,
			{ "estado": estado},
			{ headers }
		);
		//console.log(response.data);
		console.log(`Se notificó al grupo que la orden está ${estado}`)
	} catch (error) {
		console.log(`No se pudo notificar al grupo que la orden está ${estado}`)
		//console.log(error);
	}
};

module.exports = notifyOrder;