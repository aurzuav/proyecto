const moveProduct = require("./moveProduct")

async function ReceptionToKitchen(datosOrden, formula) {
	try {
		console.log("ReceptionToKitchen")
		console.log(formula)
		// CAMBIAR DE BODEGA DE RECEPCION A COCINA EL INGREDIENTE QUE NECESITAMOS PARA LA HAMBURGUESA
		for (let sku in formula) {
			console.log(`quiero mover ${datosOrden.cantidad} del sku: ${sku}`)
			await moveProduct(sku, datosOrden.cantidad);
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = ReceptionToKitchen;