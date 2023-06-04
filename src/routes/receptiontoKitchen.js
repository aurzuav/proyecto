const moveProduct = require("./moveProduct")

async function ReceptionToKitchen(datosOrden) {
	try {
		console.log("estoy en reception to kitchen")
		sku = datosOrden.sku;
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