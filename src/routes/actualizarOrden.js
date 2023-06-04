const axios = require("axios");
const getToken = require("./getToken")
const poblar_or = require("../ordenes_recibidas.js")
const obtenerOrden = require("./obtenerOrden")

async function actualizarOrden(requestBody, idOrden, canal){
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
			Authorization: "Bearer " + token,
		};
		const response = await axios.post(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}/estado`,
			requestBody,
			{ headers }
		);
		const datos = await obtenerOrden(idOrden)
		//falta update
		console.log(requestBody.estado)
		if (requestBody.estado === "aceptada"){
			await poblar_or(datos.id, "creada", datos.sku, datos.cantidad,canal)
		}
		return response.data;
	} catch (error) {
		console.log("error funcion actualizar")
		console.log(error.response.data);
	}
};

module.exports = actualizarOrden