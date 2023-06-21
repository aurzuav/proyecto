const Router = require("koa-router");
const router = new Router();
const getToken = require("./getToken.js");

const axios = require("axios");
const BurgersinProdution = [];
const ready_for_production = [];
const {
	getCSVDictionaryProducts,
	getCSVDictionaryFormula,
} = require("./obtenerDiccionarios.js");
const Formuladictionary = {};
const Productdictionary = {};
const moveProduct = require("./moveProduct.js");
const notifyOrder = require("./notifyOrder.js");
const notifyCreateOrder = require("./notifyCreateOrder.js");
const getStock = require("./getStock.js")
const producirSku = require("./producir.js");
const moment = require("moment");
const newOrder = require("./newOrder.js")
const ReceptionToDispatch = require("./ReceptiontoDispatch.js")
const actualizarOrden = require("./actualizarOrden")
const obtenerOrden = require("./obtenerOrden");
const getStockRecepcion = require("./getStockRecepcion.js");
const ReceptionToKitchen = require("./receptiontoKitchen.js");
const checkIngredients = require("./checkIngredients");
const produceBurgers = require("./produceBurgers.js");
const { read } = require("fs");
const { Console } = require("console");
const checkKitchen = require("./checkKitchen.js");
const KitchentoCheckOut = require("./KitchentoCheckOut.js");
const wait = require("./wait.js");
const Dispatch = require("./Dispatch.js");
//const getStatement = require("./getStatement.js");
const getBalance = require("./getBalance.js");
const createInvoice = require("./createInvoice.js");

//app.use(router.routes());

getCSVDictionaryFormula(Formuladictionary, "./formulas_E3.csv");
getCSVDictionaryProducts(Productdictionary, "./products_E3.csv");

async function manejarOrden(OrderId, canal) {
	try {
		//const bank = await getStatement();
		const datos = await obtenerOrden(OrderId)
		try {
			if (canal === "grupo") {
				const stock = await getStockRecepcion(datos.sku)
				console.log(stock)
				if (stock >= datos.cantidad) {
					console.log("tengo stock, voy a aceptar el pedido de grupo")
					const requestBody1 = { "estado": "aceptada" }
					await actualizarOrden(requestBody1, OrderId, canal);
					await ReceptionToDispatch(OrderId, datos.cantidad, datos.sku)
					await createInvoice(OrderId, { order_id: `${OrderId}` })
				} else {
					//producir
					console.log("no lo tengo, voy a rechazar")
					const requestBody2 = { "estado": "rechazada" }
					//await producir_orden(datos);
					await actualizarOrden(requestBody2, OrderId, canal);

				}
			} else if (canal === "SFTP") {
				var cantidadHamburguesas = datos.cantidad
				const sku = datos.sku
				const producto = Productdictionary[sku]
				const divisionEntera = Math.floor(cantidadHamburguesas / producto.loteProduccion);
				console.log(datos)
				console.log(producto)
				if (divisionEntera * producto.loteProduccion === cantidadHamburguesas) {
					// La cantidad es divisible exactamente por el lote
				} else {
					// La cantidad no es divisible exactamente por el lote
					const siguienteNumero = (divisionEntera + 1) * producto.loteProduccion;
					cantidadHamburguesas = siguienteNumero;
				}
				const formula = Formuladictionary[datos.sku].ingredientes
				await actualizarOrden(requestBody = { "estado": "aceptada" }, OrderId, canal);
				let kitchenResult = await checkKitchen(formula, cantidadHamburguesas); //veo si estan en la cocina
				if (kitchenResult.faltantes.length > 0){
					await ReceptionToKitchen(kitchenResult.faltantes, cantidadHamburguesas); //trato de mover los que no estan en la cocina a la cocina
					kitchenResult = await checkKitchen(formula, cantidadHamburguesas); //veo si estan en la cocina
				}
				if (kitchenResult.faltantes.length > 0){
					await producir_orden(datos, cantidadHamburguesas, kitchenResult.faltantes); //produzco lo que falta
					await wait(3 * 60 * 1000); //Deberia esperar para se produzcan
				}
				let continuarProceso = kitchenResult.todosDisponibles //bool
				while (!continuarProceso) {
					await ReceptionToKitchen(kitchenResult.faltantes, cantidadHamburguesas); //trato de mover los que no estan en la cocina a la cocina
					kitchenResult = await checkKitchen(formula, cantidadHamburguesas); //veo si estan en la cocina
					continuarProceso = kitchenResult.todosDisponibles;
					console.log(kitchenResult)
					if (continuarProceso === true) {
						break;
					}
					console.log("Esperando que los ingredientes estén disponibles en alguna bodega y luego en la cocina");
					await wait(1 * 60 * 1000); // Espera 3 minutos (3 * 60 segundos * 1000 milisegundos)	
				}
				if (continuarProceso) {
					console.log(kitchenResult)
					await producirSku(sku, cantidadHamburguesas)
					let despachar = false;
					let checkOutResult = ""; 
					while (!despachar) {
						checkOutResult = await KitchentoCheckOut(datos.sku, cantidadHamburguesas); 
						console.log(JSON.stringify(checkOutResult))
						despachar = checkOutResult.listoParaDespacho
						const productIds = checkOutResult.productIds
						if (!despachar) {
							console.log("No esta lista la hamburguesa, va a esperar")
							await wait(3 * 60 * 1000); // Espera 3 minutos (3 * 60 segundos * 1000 milisegundos)
						}
						if (despachar){
							console.log("voy a despachar")
							await Dispatch(OrderId, productIds)
							await createInvoice(OrderId, { order_id: `${OrderId}` })
						}
					} 
				}
			}

		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.log(error);
	}
}

async function producir_orden(datos, cantidadHamburguesas, faltantes) {
	const sku = datos.sku
	const producto = Productdictionary[sku]
	try {
		// si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
		if (producto.produccion === "cocina") { // si es una hamburguesa
			const formula = Formuladictionary[sku].ingredientes;
			console.log("ingredientes faltantes:")
			console.log(faltantes)
			for (let ingrediente in formula) {
				if (faltantes.includes(ingrediente)) {
					const ingredient = Productdictionary[ingrediente];
					console.log(`${ingrediente}: ${JSON.stringify(ingredient)}`)
					const array_groups = JSON.parse(ingredient.gruposProductores)
					const qty = Math.ceil(cantidadHamburguesas / parseInt(ingredient.loteProduccion)) * parseInt(ingredient.loteProduccion);
					console.log(array_groups)
					if (array_groups.includes(5)) {
						console.log("Nosotros producimos el ingrediente")
						console.log(`Cantidad de hamburgesas ${cantidadHamburguesas}`)
						console.log(`cantidad del ingrediente a producir: ${qty}`)
						await producirSku(ingrediente, qty)
					}
					else { // ask ingredient to another group
						outerLoop:
						for (indice in array_groups) {
							const grupoProductor = array_groups[indice].toString()
							console.log("Vamos a pedir el ingrediente");
							console.log(`Cantidad de hamburgesas ${cantidadHamburguesas}`)
							console.log(`cantidad del ingrediente a pedir: ${qty}`)
							const stock = await getStock(ingrediente, grupoProductor);
							console.log(`el stock es:${stock}`)
							if (stock === 1) { //esto no se ha probado
								console.log("Si hay stock, se va a pedir");
								console.log(grupoProductor);
								const fechaActualUtc = moment.utc();
								const fechaHoraUtc4 = fechaActualUtc.add(4, "hours").format("YYYY-MM-DD HH:mm:ss");
								//console.log(fechaHoraUtc4)
								const requestBody = {
									"cliente": "5",
									"proveedor": grupoProductor,
									"sku": ingrediente,
									"cantidad": qty,
									"vencimiento": fechaHoraUtc4
								};
								//const balance = await getBalance();
								try {
									const costoOrden = (ingredient.costoProduccion/ingredient.loteProduccion)*qty
									let sePidio = false
									const order = await newOrder(requestBody);
									sePidio = await notifyCreateOrder(order)
									if (sePidio) {
										break outerLoop
									}
								} catch (error) {
									console.log(error);
								}
							}
						}
					}
				}
			}
		}
	} catch (error) {
		console.log(error.message);
	}
	console.log("ya produjimos/pedimos todo")
}



module.exports = manejarOrden;