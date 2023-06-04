const getToken = require("./getToken");
const axios = require("axios");
const moveProduct = require("./moveProduct")

async function ReceptionToKitchen(idOrden, Formuladictionary) {
	try {
		const token = await getToken();
		const headers = {
			"Content-Type": "application/json", // Adjust the content type if necessary
			Authorization: "Bearer " + token,
		};
		const response = await axios.get(
			`https://prod.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
			{ headers }
		);
		sku = response.data.sku;
		const formula = Formuladictionary[sku].ingredientes

		// CAMBIAR DE BODEGA DE RECEPCION A COCINA EL INGREDIENTE QUE NECESITAMOS PARA LA HAMBURGUESA
		for (let sku in formula) {
			moveProduct(sku);
		}

	} catch (error) {
		console.log(error);
	}
}

module.exports = ReceptionToKitchen;