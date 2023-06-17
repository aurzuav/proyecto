const moveProduct = require("./moveProduct")

async function ReceptionToKitchen(formula, cantidad) {
	try {
		console.log("ReceptionToKitchen")
		console.log(formula)
		// CAMBIAR DE BODEGA DE RECEPCION A COCINA EL INGREDIENTE QUE NECESITAMOS PARA LA HAMBURGUESA
		for (let sku in formula) {
			console.log(`quiero mover ${cantidad} del sku: ${sku}`)
			await moveProduct(sku, cantidad);
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = ReceptionToKitchen;