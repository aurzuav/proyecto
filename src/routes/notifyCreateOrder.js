const axios = require("axios");

//notificar al grupo que la orden fue actualizada
async function notifyCreateOrder(data) {
	try {
		console.log("notifyCreateOrder")
		console.log(data)
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
		};
		const requestBody = {
			cliente: data.cliente,
			sku: data.sku,
			fechaEntrega: data.vencimiento,
			cantidad: data.cantidad,
			urlNotificacion: `http://lagarto${data.proveedor}.ing.puc.cl/ordenes-compra/${data.id}`,
		};
		const response = await axios.post(
			`http://lagarto${data.proveedor}.ing.puc.cl/ordenes-compra/${data.id}`,
			requestBody,
			{ headers }
		);
		console.log(response.data);
	} catch (error) {
		console.log(error.response.data);
	}
};
module.exports = notifyCreateOrder;