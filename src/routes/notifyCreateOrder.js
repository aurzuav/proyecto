const axios = require("axios");

//notificar al grupo que la orden fue actualizada
async function notifyCreateOrder(data) {
	try {
		console.log("notifyCreateOrder")
		//console.log(data)
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
		};
		//console.log("request body notify create")
		
		const requestBody = {
			"cliente": data.cliente,
			"sku": data.sku,
			"fechaEntrega": data.vencimiento,
			"cantidad": data.cantidad,
			"urlNotificacion": `http://lagarto${data.cliente}.ing.puc.cl/ordenes-compra/${data.id}`,
		};
		//console.log(requestBody)
		const response = await axios.post(
			`http://lagarto${data.proveedor}.ing.puc.cl/ordenes-compra/${data.id}`,
			requestBody,
			{ headers }
		);
		console.log(response.data);
		console.log(`notificamos pedir ${data.sku} a ${data.proveedor}`);
		return true
	} catch (error) {
		console.log(`error al notificar ${data.sku} a ${data.proveedor}`);
	}
};
module.exports = notifyCreateOrder;