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

//app.use(router.routes());

getCSVDictionaryFormula(Formuladictionary, "./formulas_E3.csv");
getCSVDictionaryProducts(Productdictionary, "./products_E3.csv");

async function manejarOrden(OrderId, canal) {
	try {
		datos = await obtenerOrden(OrderId)
		try {
			if (canal === "grupo") {
				const stock = await getStockRecepcion(datos.sku, 5)
				if (stock >= datos.cantidad) {
					checkIngredients();
					//console.log("lo tengo")
					requestBody = { "estado": "aceptada" }
					await actualizarOrden(requestBody, OrderId, canal);
					await ReceptionToDispatch(OrderId, canal, datos.cantidad)
				} else {
					//producir
					//console.log("no lo tengo")
					requestBody = { "estado": "rechazada" }
					//await producir_orden(datos);
					await actualizarOrden(requestBody, OrderId, canal);

				}
			} else if (canal === "SFTP") {
				BurgersinProdution.push(datos.sku); //entender
				await actualizarOrden(requestBody = {"estado":"aceptada"}, OrderId, canal);
				await producir_orden(datos);
				const formula = Formuladictionary[datos.sku].ingredientes
				let bool = false
				while(!bool){
					await ReceptionToKitchen(datos, formula);
					bool = await checkKitchen(formula, datos.cantidad)
					if (bool === true){
						break
					}
					console.log("va a esperar que esten los ingredientes en la cocina")
					await wait(3 * 60 * 1000); // Espera 3 minutos (3 * 60 segundos * 1000 milisegundos)
				}
				if (bool) {
					await producirSku(datos.sku, datos.cantidad)
					let result = false;
					while (!result) {
						result = await KitchentoCheckOut(datos.sku, datos.cantidad, OrderId); // Llama a tu función checkKitchen aquí
						if (!result) {
							console.log("va a esperar")
							await wait(3 * 60 * 1000); // Espera 3 minutos (3 * 60 segundos * 1000 milisegundos)
						}
					}

				}
				// setTimeout(checkIngredients, 10 * 60 * 1000, BurgersinProdution, Productdictionary, Formuladictionary, ready_for_production);
				// console.log("ready_for_production")
				// console.log(ready_for_production);
				// setTimeout(produceBurgers, 1 * 60 * 1000, BurgersinProdution, ready_for_production, Productdictionary)
				// await ReceptionToKitchen(datos, Formuladictionary[datos.sku].ingredientes);
				// console.log("burgers in production before check")
				// console.log(BurgersinProdution);
				// await checkIngredients(BurgersinProdution, Productdictionary, Formuladictionary, ready_for_production);
				// console.log("burger in production");
				// console.log(BurgersinProdution);
				// console.log("ready for prod");
				// console.log(ready_for_production);
				// await produceBurgers(BurgersinProdution, ready_for_production, Productdictionary);
				// console.log("burger in production despues de producir");
				// console.log(BurgersinProdution);
				// console.log("reasy")
				// console.log(ready_for_production)
			}

		} catch (error) {
			console.log(error);
		}
	} catch (error) {
		console.log(error);
	}
}

// function wait(timeout) {
// 	return new Promise((resolve) => {
// 	  setTimeout(resolve, timeout);
// 	});
//   }

//   // Call the function and wait for the specified timeout
//   wait(10 * 60 * 1000).then(() => {
// 	const result = checkIngredients(BurgersinProdution, Productdictionary, Formuladictionary, ready_for_production);
// 	console.log(result); // Output the returned value
//   });

async function producir_orden(datos) {
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
	try {
		// si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
		if (producto.produccion === "cocina") { // si es una hamburguesa
			console.log("es una hamburguesa")
			const formula = Formuladictionary[sku].ingredientes;
			for (let ingrediente in formula) {
				const ingredient = Productdictionary[ingrediente];
				console.log(`Ingrediente completo: ${JSON.stringify(ingredient)}`)
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
					//falta hacer algo que me diga si lo pedí o no
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
							//console.log(requestBody)
							try {
								const order = await newOrder(requestBody);
								//console.log(order)
								await notifyCreateOrder(order)
							} catch (error) {
								console.log(error);
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