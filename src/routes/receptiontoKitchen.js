const moveProduct = require("./moveProduct")

async function ReceptionToKitchen(formula, cantidad) {
	try {
		console.log("ReceptionToKitchen")
		console.log(formula)
		// CAMBIAR DE BODEGA DE RECEPCION A COCINA EL INGREDIENTE QUE NECESITAMOS PARA LA HAMBURGUESA
		for (let indiceSku in formula) {
			console.log(`quiero mover ${cantidad} del sku: ${formula[indiceSku]}`)
			await moveProduct(formula[indiceSku], cantidad);
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = ReceptionToKitchen;