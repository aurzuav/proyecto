const axios = require("axios");
const getToken = require("./getToken")
const poblar_or = require("../ordenes_recibidas.js")
const obtenerOrden = require("./obtenerOrden")
const notifyOrder = require("./notifyOrder.js");

async function actualizarOrden(requestBody, idOrden, canal){
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
		const response = await axios.post(
			`https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}/estado`,
			requestBody,
			{ headers }
		);
		const datos = await obtenerOrden(idOrden)

		if (requestBody.estado === "aceptada"){
			await poblar_or(datos.id, "aceptada", datos.sku, datos.cantidad,canal)
		}
		if (datos.cliente !== "999"){
			await notifyOrder(requestBody.estado, datos.cliente, idOrden);
		}
		console.log(`Orden actualizada con estado: ${requestBody.estado} correctamente`)
		return response.data;
	} catch (error) {
		console.log(`No se pudo actualizar la orden con estado: ${requestBody.estado}`)
		console.log(error.response.data);
	}
};

module.exports = actualizarOrden