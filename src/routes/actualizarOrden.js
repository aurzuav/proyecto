const axios = require("axios");
const getToken = require("./getToken")
const poblar_or = require("../ordenes_recibidas.js")
const obtenerOrden = require("./obtenerOrden")
const notifyOrder = require("./notifyOrder.js");

async function actualizarOrden(requestBody, datosOrden, canal){
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
		const response = await axios.post(
			`https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${datosOrden.id}/estado`,
			requestBody,
			{ headers }
		);

		if (requestBody.estado === "aceptada"){
			await poblar_or(datosOrden.id, "aceptada", datosOrden.sku, datosOrden.cantidad,canal)
		}
		if (datosOrden.cliente !== "999"){
			await notifyOrder(requestBody.estado, datosOrden.cliente, datosOrden.id);
		}
		console.log(`Orden actualizada con estado: ${requestBody.estado} correctamente`)
		return response.data;
	} catch (error) {
		console.log(`No se pudo actualizar la orden con estado: ${requestBody.estado}`)
		console.log(error.response.data);
	}
};

module.exports = actualizarOrden